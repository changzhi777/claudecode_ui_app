// 测试真实命令自动补全功能

console.log('🧪 测试 ClaudeCode CLI 真实命令');

const testCommands = [
  // 核心命令
  '/update-config',
  '/keybindings-help',
  '/simplify',
  '/fewer-permission-prompts',
  '/loop',

  // Git 工作流
  '/zcf:git-commit',
  '/zcf:git-cleanBranches',
  '/zcf:git-rollback',
  '/zcf:git-worktree',

  // 开发流程
  '/zcf:workflow',
  '/zcf:feat',
  '/zcf:init-project',

  // 代码审查
  '/review',
  '/security-review',

  // AI 与测试
  '/claude-api',
  '/codex:setup',
  '/codex:rescue',
  '/init',
  '/qmd:qmd',

  // GLM Plan
  '/glm-plan-usage:usage-query',
  '/glm-plan-bug:case-feedback',
];

console.log(`✅ 共支持 ${testCommands.length} 个真实命令`);
console.log('');

// 按类别统计
const categories = {
  '核心': testCommands.filter(cmd => !cmd.includes(':')).length,
  'Git': testCommands.filter(cmd => cmd.includes('/zcf:git')).length,
  '开发': testCommands.filter(cmd => cmd.includes('/zcf:')).length - 4, // 减去 Git 命令
  '审查': testCommands.filter(cmd => cmd.includes('review')).length,
  'AI': testCommands.filter(cmd => cmd.includes('/claude') || cmd.includes('/codex') || cmd.includes('/init') || cmd.includes('/qmd')).length,
  'GLM': testCommands.filter(cmd => cmd.includes('/glm-plan')).length,
};

console.log('📊 命令分类统计:');
Object.entries(categories).forEach(([category, count]) => {
  console.log(`  ${category}: ${count} 个命令`);
});

console.log('');
console.log('🎯 测试场景:');
console.log('1. 输入 "/" 自动显示所有命令');
console.log('2. 输入 "/git" 过滤 Git 命令');
console.log('3. 输入 "/zcf:" 过滤所有 zcf 命令');
console.log('4. 按 Tab 手动触发补全');
console.log('5. 用 ↑↓ 键盘导航选择');
console.log('6. 按 Enter 确认选择');

console.log('');
console.log('✅ 现在可以在 ClaudeCode UI 中测试这些功能！');
