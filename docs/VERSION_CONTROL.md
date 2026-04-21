# Git 版本管理规则

## 版本号规则

**格式**: `V0.0.x`
- 主版本号: 0 (保持不变)
- 次版本号: 0 (保持不变)
- 修订号: x (每次推送 +1)

**示例**:
- V0.0.1 → V0.0.2 → V0.0.3 → ...

## 使用方法

### 方式 1: 手动版本更新脚本

```bash
./scripts/bump-version.sh
git push
```

### 方式 2: 自动 Git 钩子（推荐）

配置 Git 钩子后，每次推送自动更新版本号：

```bash
git add .
git commit -m "feat: 添加新功能"
git push  # 自动执行 pre-push 钩子，更新版本号
```

## 配置 Git 钩子

### 1. 安装钩子

```bash
chmod +x scripts/git-pre-push.sh
cp scripts/git-pre-push.sh .git/hooks/pre-push
```

### 2. 验证钩子

```bash
git config core.hooksPath .git/hooks
```

## 版本历史

- v0.0.1 - 2026-04-22: 初始版本
  - 主题系统（Claude/Cursor/Warp）
  - AI 对话界面
  - 代码编辑器（Monaco）
  - 文件树组件
  - 任务可视化
  - IPC 通信桥接

## 提交信息规范

### 提交类型

- `feat`: 新功能
- `fix`: 修复 bug
- `chore`: 构建/工具/版本更新
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关

### 提交格式

```
<type>: <description>

[optional body]

[optional footer]
```

**示例**:
```
feat: 添加任务可视化组件

- 实现任务状态追踪
- 添加进度条显示
- 支持任务历史记录

Closes #123
```

## Git 工作流

### 1. 开发新功能

```bash
git checkout -b feature/xxx
# ... 开发 ...
git add .
git commit -m "feat: 添加 xxx 功能"
```

### 2. 推送到远程

```bash
git push origin feature/xxx
# 自动触发 pre-push 钩子，版本号自动 +1
```

### 3. 合并到主分支

```bash
git checkout main
git merge feature/xxx
git push
```

## 注意事项

1. **版本号自动管理**: 不要手动修改 `package.json` 中的版本号
2. **钩子优先**: 推荐使用 Git 钩子自动更新版本号
3. **冲突处理**: 如果出现版本冲突，以远程版本为准
4. **备份**: 重要推送前建议先创建备份分支

## 查看版本

```bash
# 查看当前版本
node -p "require('./package.json').version"

# 查看版本历史
git tag -l
```

---

**作者**: 外星动物（常智） / IoTchange
**更新日期**: 2026-04-22
