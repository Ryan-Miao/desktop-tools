import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Vitest Unit Testing Configuration
 *
 * 覆盖率阈值说明：
 * - 全局最小阈值：60% 行/函数/语句，50% 分支
 * - 核心代码要求：80% 行/函数/语句，70% 分支
 *
 * 核心代码定义：
 * - src/main/ - 整个主进程
 * - src/shared/types/ - 类型定义
 * - src/shared/logger/ - 日志框架
 * - src/renderer/services/ - 渲染服务
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/**",
        "plugins/", // 插件代码使用较低阈值
      ],
      // 全局最小阈值（非核心代码）
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
      // 按文件检查覆盖率
      perFile: true,
      // 为核心代码设置严格阈值
      // 注意：这需要在CI中通过scripts/check-coverage.js进行额外验证
    },
    include: [
      "**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      "build",
      ".electron",
      "tests/e2e/**", // Exclude E2E tests from vitest
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@main": path.resolve(__dirname, "./src/main"),
      "@renderer": path.resolve(__dirname, "./src/renderer"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
});
