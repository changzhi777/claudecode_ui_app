#!/bin/bash
# CLI启动验证脚本

echo "🧪 ClaudeCode CLI 启动测试"
echo "=============================="
echo ""

# 检查Claude CLI是否安装
if ! command -v claude &> /dev/null; then
    echo "❌ Claude CLI 未安装"
    exit 1
fi

echo "✅ Claude CLI 已安装: $(claude --version | head -1)"
echo ""

# 测试1：验证参数格式
echo "📋 测试1: 验证参数格式"
echo "------------------------"
echo "命令: claude --print --input-format stream-json --output-format stream-json --verbose"
echo ""

# 测试2：发送测试消息（最简单的验证）
echo "📋 测试2: 发送测试消息并验证JSON输出"
echo "--------------------------------------"
echo "发送消息..."
echo '{"type":"user_message","content":"hello","sessionId":"test-123"}' | claude --print --input-format stream-json --output-format stream-json 2>&1 | head -50 &
PID=$!
sleep 3
kill $PID 2>/dev/null || true
wait $PID 2>/dev/null || true

echo ""
echo "✅ 测试完成"
echo ""
echo "💡 提示：如果看到JSON格式的输出（包含type、content等字段），说明CLI工作正常"
