import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'QRCodePlugin',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      // ✅ 不使用 external，将 React 和 qrcode 都打包进插件
      // 这样插件有自己的 React 副本，避免 React 实例冲突
      // external: ['react', 'react-dom'],  // ❌ 移除
      output: {
        // 不需要 globals 配置
        // globals: {  // ❌ 移除
        //   react: 'React',
        //   'react-dom': 'ReactDOM'
        // }
      }
    }
  }
});
