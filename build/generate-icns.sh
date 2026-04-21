#!/bin/bash

# Claude 图标 ICNS 生成脚本
# 将 SVG 转换为 macOS ICNS 格式

set -e

cd "$(dirname "$0")"

echo "🎨 开始生成 Claude 图标 ICNS..."

# 清理旧文件
rm -rf icon.iconset icon.icns

# 创建 iconset 目录
mkdir icon.iconset

# 生成所有必需尺寸
echo "📐 生成不同尺寸的 PNG..."

sizes=(16 32 128 256 512)
for size in "${sizes[@]}"; do
  echo "  - ${size}x${size}"
  sips -z $size $size icon.svg --out icon.iconset/icon_${size}x${size}.png >/dev/null 2>&1
  sips -z $((size*2)) $((size*2)) icon.svg --out icon.iconset/icon_${size}x${size}@2x.png >/dev/null 2>&1
done

# 转换为 ICNS
echo "🔄 转换为 ICNS 格式..."
iconutil -c icns icon.iconset -o icon.icns

# 清理临时文件
rm -rf icon.iconset

echo "✅ ICNS 生成完成: build/icon.icns"
echo ""
echo "📊 文件信息:"
ls -lh icon.icns | awk '{print "   大小: " $5}'
