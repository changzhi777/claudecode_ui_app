# Git 版本管理使用指南

## 📊 当前状态

✅ Git 仓库已初始化
✅ 初始提交已创建 (v0.0.1)
✅ 版本标签已创建
✅ Git 钩子已配置

## 🎯 版本管理规则

**版本格式**: `V0.0.x`
- 主版本: 0 (固定)
- 次版本: 0 (固定)
- 修订号: x (每次推送 +1)

**示例**: V0.0.1 → V0.0.2 → V0.0.3 → ...

## 🚀 日常使用

### 开发并推送（自动版本更新）

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "feat: 添加新功能"

# 3. 推送（自动更新版本号）
git push
```

**推送时会自动**:
1. 修订号 +1 (V0.0.1 → V0.0.2)
2. 更新 package.json
3. 创建版本提交
4. 推送到远程

### 手动版本更新

如果不想使用钩子，可以手动更新：

```bash
# 运行版本更新脚本
./scripts/bump-version.sh

# 推送
git push
```

## 📋 提交信息规范

### 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `chore`: 构建/工具/版本更新
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试

### 格式

```
<type>: <简短描述>

[可选的详细描述]

[可选的脚注]
```

**示例**:

```
feat: 添加任务可视化组件

- 实现实时任务追踪
- 支持多种任务类型
- 添加进度条显示

Closes #123
```

## 🔧 钩子系统

### pre-push 钩子

**位置**: `.git/hooks/pre-push`

**功能**: 
- 自动更新版本号（第3位 +1）
- 创建版本更新提交
- 阻止直接推送（确保版本已更新）

### 禁用钩子（临时）

```bash
# 跳过钩子
git push --no-verify
```

### 重新启用钩子

```bash
cp scripts/git-pre-push.sh .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

## 📦 当前版本信息

```
版本: v0.0.1
提交: 9589857
标签: v0.0.1
```

## 🎨 功能清单

- ✅ 三大主题系统
- ✅ AI 对话界面
- ✅ Monaco Editor 代码编辑器
- ✅ 文件树组件
- ✅ 任务可视化
- ✅ IPC 通信桥接
- ✅ 自动版本管理

## 📞 联系信息

- **作者**: 外星动物（常智）
- **组织**: IoTchange
- **邮箱**: 14455975@qq.com
- **版权**: Copyright (C) 2026 IoTchange - All Rights Reserved

## 📚 相关文档

- [版本管理详细规则](../docs/VERSION_CONTROL.md)
- [更新日志](../CHANGELOG.md)
- [README](../README.md)

---

**最后更新**: 2026-04-22
**版本**: v0.0.1
