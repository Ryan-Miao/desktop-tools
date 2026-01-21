module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 Bug
        'docs',     // 更新文档
        'style',    // 代码格式调整
        'refactor', // 代码重构
        'perf',     // 性能优化
        'test',     // 添加测试
        'chore',    // 构建/工具链更新
        'revert',   // 回退
      ],
    ],
    'subject-case': [0], // 允许任何大小写
  },
};
