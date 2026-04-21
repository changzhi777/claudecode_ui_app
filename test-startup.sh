#!/bin/bash

# 测试 ClaudeCode UI 启动时间的脚本

echo "🚀 测试 ClaudeCode UI 启动时间"
echo "================================"
echo ""

# 检查应用是否存在
APP_PATH="/Applications/ClaudeCode UI.app"

if [ ! -d "$APP_PATH" ]; then
    echo "❌ 应用未安装在 /Applications/ClaudeCode UI.app"
    echo "请先将应用从 DMG 拖到 /Applications 文件夹"
    exit 1
fi

echo "✅ 找到应用: $APP_PATH"
echo ""
echo "📝 测试说明："
echo "1. 脚本将关闭所有正在运行的 ClaudeCode UI 实例"
echo "2. 然后启动应用并计时"
echo "3. 请等待应用窗口完全显示"
echo "4. 按下 Ctrl+C 停止计时"
echo ""

read -p "按 Enter 开始测试..."

# 关闭现有实例
echo ""
echo "🔌 关闭现有实例..."
killall "ClaudeCode UI" 2>/dev/null
sleep 1

# 记录开始时间
echo "🚀 启动应用..."
START_TIME=$(date +%s%3N)

# 启动应用
open -a "ClaudeCode UI"

# 等待用户按下 Ctrl+C
echo "⏱️  计时中... 当应用完全加载后，按下 Ctrl+C 停止计时"
trap 'END_TIME=$(date +%s%3N); DURATION=$((END_TIME - START_TIME)); echo ""; echo "✅ 启动时间: ${DURATION}ms ($(echo "scale=2; $DURATION/1000" | bc)秒)"; if [ $DURATION -lt 2000 ]; then echo "🎉 达到目标（<2秒）！"; else echo "⚠️  未达到目标（需要<2秒）"; fi; exit 0' INT

# 保持脚本运行
while true; do
    sleep 0.1
done
