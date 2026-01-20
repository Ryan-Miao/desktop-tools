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
      rollupOptions: {
        output: {
          // 代码分割优化（提升启动性能）
          manualChunks: (id) => {
            // 将大型依赖包分离到独立的 chunk
            if (id.includes('node_modules')) {
              // React 核心库
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              // UI 组件库（如果有）
              if (id.includes('@mui') || id.includes('antd')) {
                return 'ui-vendor';
              }
              // Babel and related
              if (id.includes('@babel') || id.includes('babel')) {
                return 'babel-vendor';
              }
              // 其他 node_modules
              return 'vendor';
            }

            // 分离大型组件 - 旧组件
            if (id.includes('/components/SettingsPanel')) {
              return 'settings-panel';
            }
            if (id.includes('/components/PluginManager')) {
              return 'plugin-manager';
            }
            if (id.includes('/components/BackupPanel')) {
              return 'backup-panel';
            }
            if (id.includes('/components/PerformanceMonitor')) {
              return 'performance-monitor';
            }
            if (id.includes('/components/CalculatorPad')) {
              return 'calculator-pad';
            }

            // 分离新插件 - 10个新插件独立打包
            if (id.includes('/components/PasswordStrength')) {
              return 'plugin-password-strength';
            }
            if (id.includes('/components/ScientificCalculator')) {
              return 'plugin-scientific-calculator';
            }
            if (id.includes('/components/ColorPalette')) {
              return 'plugin-color-palette';
            }
            if (id.includes('/components/JsonToTs')) {
              return 'plugin-json-to-ts';
            }
            if (id.includes('/components/RegexTester')) {
              return 'plugin-regex-tester';
            }
            if (id.includes('/components/ProgressCharts')) {
              return 'plugin-progress-charts';
            }
            if (id.includes('/components/WorldClock')) {
              return 'plugin-world-clock';
            }
            if (id.includes('/components/MarkdownEditor')) {
              return 'plugin-markdown-editor';
            }
            if (id.includes('/components/KeyboardShortcuts')) {
              return 'plugin-keyboard-shortcuts';
            }

            // 共享组件
            if (id.includes('/components/Loading')) {
              return 'loading';
            }
            if (id.includes('/components/Skeleton')) {
              return 'skeleton';
            }
            if (id.includes('/components/Toast')) {
              return 'toast';
            }
            if (id.includes('/components/ProgressBar')) {
              return 'progress-bar';
            }
            if (id.includes('/components/PluginWindow')) {
              return 'plugin-window';
            }
          }
        }
      },
      // 启用更多优化
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        }
      },
      // 代码压缩
      cssCodeSplit: true,
      // 启用源码映射（生产环境可选）
      sourcemap: false
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
