// 测试更新后的模型检测功能
const testResponses = [
  "我正在使用 **engineer-professional（工程师专业版）** 输出样式。",
  "我的输出样式是 **工程师专业版** 🤙",
  "claude-sonnet-4-6",
  "Claude Sonnet 4.6 模型",
  "我使用的是 claude 3.5 sonnet",
  "This is claude-3-opus-20250507"
];

function detectModel(response) {
  const lower = response.toLowerCase();

  // Claude Sonnet 4.6 (最新) 特征 - 优先级最高
  if (
    lower.includes('claude sonnet 4.6') ||
    response.includes('claude-sonnet-4-6') ||
    lower.includes('claude 4.6') ||
    response.includes('claude-4-6')
  ) {
    return 'claude-sonnet-4-6';
  }

  // 检测 engineer-professional 输出样式（使用 Claude Sonnet 4.6）
  if (
    lower.includes('engineer-professional') ||
    lower.includes('工程师专业版') ||
    lower.includes('engineer professional')
  ) {
    return 'claude-sonnet-4-6';
  }

  // Claude 3.5 Sonnet 特征
  if (lower.includes('claude 3.5') || response.includes('claude-3.5')) {
    return 'claude-3.5-sonnet';
  }

  // Claude 3 Opus 特征
  if (response.includes('claude-3-opus') || lower.includes('claude 3 opus')) {
    return 'claude-3-opus-20250507';
  }

  // 默认返回当前最新模型
  return 'claude-sonnet-4-6';
}

console.log('🧪 更新后的模型检测测试\n');

testResponses.forEach((response, index) => {
  const detected = detectModel(response);
  console.log(`测试 ${index + 1}:`);
  console.log(`响应: ${response.substring(0, 60)}...`);
  console.log(`检测结果: ${detected}`);
  console.log('');
});

console.log('✅ 现在应该能正确识别 engineer-professional 输出样式了！');
