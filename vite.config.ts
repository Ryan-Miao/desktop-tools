import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

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
              build: {
                outDir: 'dist/preload'
              }
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
    } : undefined
  };
});
