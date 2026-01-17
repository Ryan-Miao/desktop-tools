import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';
import fs from 'fs';

// Get all plugin manifests
function getPluginEntries() {
  const pluginsDir = path.resolve(__dirname, 'plugins');
  const entries: Record<string, string> = {};

  if (!fs.existsSync(pluginsDir)) {
    return entries;
  }

  const pluginDirs = fs.readdirSync(pluginsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const pluginDir of pluginDirs) {
    const indexPath = path.resolve(pluginsDir, pluginDir, 'index.ts');
    if (fs.existsSync(indexPath)) {
      entries[pluginDir] = indexPath;
    }
  }

  return entries;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isWeb = mode === 'web' || process.env.WEB_MODE === 'true';

  return {
    plugins: [
      react({
        babel: {
          presets: ['@babel/preset-react']
        }
      }),
      // Only load Electron plugins in non-web mode
      ...(isWeb ? [] : [
        electron([
          {
            // Main process
            entry: 'src/main/index.ts',
            vite: {
              resolve: {
                alias: {
                  '@': path.resolve(__dirname, 'src'),
                  '@main': path.resolve(__dirname, 'src/main'),
                  '@renderer': path.resolve(__dirname, 'src/renderer'),
                  '@shared': path.resolve(__dirname, 'src/shared')
                }
              },
              build: {
                outDir: 'dist/main',
                rollupOptions: {
                  external: ['electron', 'better-sqlite3']
                }
              }
            }
          },
          {
            // Preload script
            entry: 'src/preload/index.ts',
            onstart(args) {
              args.reload();
            },
            vite: {
              resolve: {
                alias: {
                  '@': path.resolve(__dirname, 'src'),
                  '@main': path.resolve(__dirname, 'src/main'),
                  '@renderer': path.resolve(__dirname, 'src/renderer'),
                  '@shared': path.resolve(__dirname, 'src/shared')
                }
              },
              build: {
                outDir: 'dist/preload'
              }
            }
          },
          {
            // Plugins
            entry: getPluginEntries(),
            vite: {
              resolve: {
                alias: {
                  '@': path.resolve(__dirname, 'src'),
                  '@main': path.resolve(__dirname, 'src/main'),
                  '@renderer': path.resolve(__dirname, 'src/renderer'),
                  '@shared': path.resolve(__dirname, 'src/shared')
                }
              },
              build: {
                outDir: 'dist/plugins',
                rollupOptions: {
                  output: {
                    entryFileNames: '[name]/index.js',
                    chunkFileNames: '[name]/[name].js',
                    assetFileNames: '[name]/[name][extname]'
                  }
                },
                // Copy manifest.json files after build
                emptyOutDir: false
              },
              publicDir: false,
              plugins: [
                {
                  name: 'copy-plugin-manifests',
                  writeBundle() {
                    // Copy manifest.json files to dist/plugins
                    const pluginsDir = path.resolve(__dirname, 'plugins');
                    const distPluginsDir = path.resolve(__dirname, 'dist/plugins');

                    if (!fs.existsSync(distPluginsDir)) {
                      return;
                    }

                    const pluginDirs = fs.readdirSync(pluginsDir, { withFileTypes: true })
                      .filter(dirent => dirent.isDirectory())
                      .map(dirent => dirent.name);

                    for (const pluginDir of pluginDirs) {
                      const manifestSrc = path.resolve(pluginsDir, pluginDir, 'manifest.json');
                      const manifestDest = path.resolve(distPluginsDir, pluginDir, 'manifest.json');

                      if (fs.existsSync(manifestSrc)) {
                        fs.mkdirSync(path.dirname(manifestDest), { recursive: true });
                        fs.copyFileSync(manifestSrc, manifestDest);
                      }
                    }
                  }
                }
              ]
            }
          }
        ]),
        renderer()
      ])
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@main': path.resolve(__dirname, 'src/main'),
        '@renderer': path.resolve(__dirname, 'src/renderer'),
        '@shared': path.resolve(__dirname, 'src/shared')
      }
    },
    root: '.',
    build: {
      outDir: isWeb ? 'dist/renderer' : 'dist/renderer',
      rollupOptions: isWeb ? {
        output: {
          // 确保在 Web 模式下不包含 Node.js 特定的模块
          manualChunks: {}
        }
      } : undefined
    },
    server: {
      port: 5173
    },
    // Web 模式下的特殊配置
    define: isWeb ? {
      'process.env.WEB_MODE': JSON.stringify('true')
    } : undefined,
    // Vitest 测试配置
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'dist/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData',
        ]
      }
    }
  };
});
