#!/bin/bash

# Git 钩子：自动更新版本号
# 在 pre-push 钩子中调用

# 检查是否有版本更新
VERSION_FILE="package.json"
CURRENT_VERSION=$(node -p "require('./$VERSION_FILE').version")

# 提取版本号部分
MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
PATCH=$(echo $CURRENT_VERSION | cut -d. -f3)

# 更新版本号 (第3位数字+1)
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

# 更新 package.json
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" $VERSION_FILE
else
  sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" $VERSION_FILE
fi

echo "🔄 版本自动更新: $CURRENT_VERSION → $NEW_VERSION"

# 添加更新后的 package.json
git add $VERSION_FILE

# 创建版本更新提交
git commit -m "chore: bump version to $NEW_VERSION [skip ci]"

echo "✓ 版本更新已提交"
