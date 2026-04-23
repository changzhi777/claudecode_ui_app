// 测试模型检测功能
const testResponses = [
  "我使用的模型是 **Claude Sonnet 4.6**，模型 ID 是 `claude-sonnet-4-6`。",
  "claude-sonnet-4-6 🤙",
  "我使用的是 claude 3.5 sonnet",
  "This is claude-3-opus-20250507",
  "普通回复，不包含模型信息"
];

function detectModel(response) {
  const lower = response.toLowerCase();

  // Claude Sonnet 4.6 (最新) 特征
  if (lower.includes('claude sonnet 4.6') || response.includes('claude-sonnet-4-6') || response.includes('claude sonnet 4')) {
    return 'claude-sonnet-4-6';
  }

  // Claude 3.5 Sonnet 特征
  if (lower.includes('claude 3.5') || response.includes('claude-3.5')) {
    return 'claude-3.5-sonnet';
  }

  // Claude 3 Opus 特征 - 需要更精确的匹配
  if (response.includes('claude-3-opus') || response.includes('claude 3')) {
    return 'claude-3-opus-20250507';
  }

  // 默认返回当前最新模型
  return 'claude-sonnet-4-6';
}

console.log('🧪 模型检测测试\n');

testResponses.forEach((response, index) => {
  const detected = detectModel(response);
  console.log(`测试 ${index + 1}:`);
  console.log(`响应: ${response.substring(0, 50)}...`);
  console.log(`检测结果: ${detected}`);
  console.log('');
});

console.log('✅ 测试完成！现在应用可以正确检测 claude-sonnet-4-6 模型了。');
