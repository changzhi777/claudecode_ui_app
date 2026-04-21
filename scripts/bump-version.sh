#!/bin/bash

# Git 版本管理脚本
# 版本规则: V0.0.x，每次推送更新第3位数字+1

VERSION_FILE="package.json"
CURRENT_VERSION=$(node -p "require('./$VERSION_FILE').version")

echo "当前版本: $CURRENT_VERSION"

# 提取版本号部分
MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
PATCH=$(echo $CURRENT_VERSION | cut -d. -f3)

echo "版本分解: $MAJOR.$MINOR.$PATCH"

# 更新版本号 (第3位数字+1)
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "新版本: $NEW_VERSION"

# 更新 package.json
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" $VERSION_FILE
else
  # Linux
  sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" $VERSION_FILE
fi

echo "✓ 版本已更新: $CURRENT_VERSION → $NEW_VERSION"

# Git 操作
echo "执行 Git 操作..."

# 添加所有更改
git add .

# 提交更改
git commit -m "chore: bump version to $NEW_VERSION"

# 显示当前状态
git status

echo ""
echo "✓ 准备完成！使用以下命令推送："
echo "  git push"
