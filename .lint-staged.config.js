module.exports = {
  // TypeScript + ESLint
  '*.{ts,tsx}': [
    () => 'eslint --fix', // 先修复
    () => 'prettier --write', // 再格式化
    () => 'pnpm type-check', // 最后类型检查
  ],

  // 其他文件
  '*.{json,md}': [
    () => 'prettier --write'
  ],

  // 测试文件
  '*.{test,spec}.{ts,tsx}': [
    () => 'eslint --fix',
    () => 'prettier --write',
    () => 'vitest related --run'
  ]
};
