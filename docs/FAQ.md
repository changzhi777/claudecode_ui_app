# ClaudeCode UI App - 常见问题（FAQ）

**版本**：v0.5.0
**更新日期**：2026-04-22

---

## 📚 目录

1. [安装与配置](#安装与配置)
2. [开发相关](#开发相关)
3. [功能使用](#功能使用)
4. [性能问题](#性能问题)
5. [错误排查](#错误排查)
6. [高级话题](#高级话题)

---

## 🔧 安装与配置

### Q1: 如何安装项目？

**A:** 按照以下步骤安装：

```bash
# 1. 克隆项目
git clone https://github.com/changzhi777/claudecode_ui_app.git
cd claudecode_ui_app

# 2. 安装依赖
pnpm install

# 3. 启动开发模式
pnpm dev
```

**环境要求**：
- Node.js >= 18
- pnpm >= 8
- ClaudeCode CLI 已安装

### Q2: 依赖安装失败怎么办？

**A:** 常见解决方案：

```bash
# 清除缓存重新安装
pnpm store prune
rm -rf node_modules
pnpm install

# 或者使用淘宝镜像
npm config set registry https://registry.npmmirror.com
pnpm install
```

### Q3: 如何配置 ClaudeCode CLI？

**A:** 三种配置方式：

**方式1：环境变量**
```bash
export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx"
```

**方式2：配置文件**
```json
// ~/.claude/settings.json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-ant-xxx"
  }
}
```

**方式3：应用内设置**
1. 打开应用
2. 进入设置
3. 输入API Key
4. 保存

### Q4: 支持哪些操作系统？

**A:** 
- ✅ macOS 12+ (Monterey)
- ✅ Linux (Ubuntu 20.04+, Fedora 35+)
- ✅ Windows 10+
- ✅ 支持 Apple Silicon (M1/M2)

---

## 💻 开发相关

### Q5: 如何运行测试？

**A:** 
```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test WorkerManager

# 监听模式
pnpm test --watch

# 覆盖率报告
pnpm test:coverage
```

### Q6: 如何构建应用？

**A:**
```bash
# 构建所有平台
pnpm build

# 构建特定平台
pnpm build:mac    # macOS
pnpm build:win    # Windows
pnpm build:linux  # Linux
```

### Q7: 如何打包应用？

**A:**
```bash
# 打包所有平台
pnpm package

# 打包特定平台
pnpm package:mac    # macOS (.dmg)
pnpm package:win    # Windows (.exe)
pnpm package:linux  # Linux (.AppImage, .deb, .rpm)
```

### Q8: VS Code 如何配置？

**A:** 安装推荐扩展：
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Vue Language Features (Volar)

**settings.json**:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Q9: 如何调试主进程？

**A:** 
1. 按 `Cmd+Option+I` (macOS) 或 `Ctrl+Shift+I` (Windows/Linux)
2. 切换到 "Main" 标签
3. 设置断点调试

**或使用 VS Code 调试**：
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [{
    "name": "Debug Main Process",
    "type": "node",
    "request": "launch",
    "cwd": "${workspaceFolder}",
    "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
    "windows": {
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
    },
    "args": ["."]
  }]
}
```

### Q10: 如何调试渲染进程？

**A:** 
1. 打开开发者工具（`Cmd+Option+I` 或 `Ctrl+Shift+I`）
2. 切换到 "Renderer" 标签
3. 使用 Chrome DevTools 调试

---

## 🎮 功能使用

### Q11: 如何新建对话？

**A:** 三种方式：
1. 点击左上角 "新建对话" 按钮
2. 使用快捷键 `⌘N` (macOS) 或 `Ctrl+N` (Windows/Linux)
3. 右键会话列表 → 新建

### Q12: 如何切换主题？

**A:** 
- 快捷键：`⌘T` (macOS) 或 `Ctrl+T` (Windows/Linux)
- 或：设置 → 外观 → 选择主题

**可用主题**：
- Claude（温暖人文）
- Cursor（精密工程）
- Warp（极简深色）

### Q13: 如何打开文件？

**A:** 
1. 点击文件树中的文件
2. 或使用快捷键 `⌘P` (macOS) 或 `Ctrl+P` (Windows/Linux)
3. 输入文件名搜索

### Q14: 如何保存文件？

**A:** 
- 快捷键：`⌘S` (macOS) 或 `Ctrl+S` (Windows/Linux)
- 或：文件 → 保存
- 自动保存：编辑后自动保存（可配置）

### Q15: 如何搜索文件内容？

**A:** 
- 在编辑器中：`⌘F` (macOS) 或 `Ctrl+F` (Windows/Linux)
- 或：右键 → 查找

### Q16: 如何使用代码片段？

**A:** 
1. 打开编辑器
2. 输入片段前缀
3. 按 `Tab` 展开
4. 或使用 `⌘Space` 查看所有片段

---

## ⚡ 性能问题

### Q17: 应用启动慢怎么办？

**A:** 优化建议：

1. **清除缓存**
```bash
rm -rf node_modules/.vite
pnpm dev
```

2. **延迟加载**
```typescript
// 已优化：CLI Handlers 延迟1秒初始化
setTimeout(() => {
  cliHandlersInstance = new CLIPCHandlers();
}, 1000);
```

3. **关闭不必要的扩展**
   - 禁用不需要的浏览器扩展

### Q18: 内存占用高怎么办？

**A:** 优化方案：

1. **清理会话历史**
   - 设置 → 清除历史
   - 或删除旧会话

2. **调整会话限制**
   ```typescript
   // cliStore.ts
   const MAX_MESSAGES = 100; // 已配置
   ```

3. **重启应用**
   - 定期重启应用释放内存

### Q19: 响应速度慢怎么办？

**A:** 排查步骤：

1. **检查网络**
   - 确保网络连接正常
   - 检查API Key是否有效

2. **查看性能监控**
   - 开发者工具 → Performance
   - 查找耗时操作

3. **优化模型选择**
   - 使用更快的模型（Sonnet vs Opus）

### Q20: CPU占用高怎么办？

**A:** 可能原因：

1. **大量文件操作**
   - 暂停文件监听
   - 减少同时打开的文件数

2. **Worker线程繁忙**
   - 检查是否有大量并发请求
   - 调整Worker配置

3. **关闭不必要的功能**
   - 禁用自动保存
   - 减少实时更新

---

## 🐛 错误排查

### Q21: CLI连接失败怎么办？

**A:** 排查步骤：

1. **检查CLI路径**
   - 设置 → CLI路径
   - 确保路径正确

2. **验证CLI可用**
   ```bash
   claude --version
   ```

3. **检查API Key**
   - 确保API Key有效
   - 检查账户余额

4. **查看日志**
   - 开发者工具 → Console
   - 查找错误信息

### Q22: 工具调用失败怎么办？

**A:** 常见原因：

1. **权限不足**
   - 检查配置文件中的权限设置
   - 添加必要的工具到allow列表

2. **文件不存在**
   - 确保文件路径正确
   - 检查文件是否存在

3. **路径权限**
   - 确保应用有访问权限
   - 检查文件权限设置

### Q23: 消息发送失败怎么办？

**A:** 解决方案：

1. **检查连接状态**
   - 查看状态栏连接指示器
   - 绿色 = 已连接，红色 = 断开

2. **重试发送**
   - 点击错误提示中的"重试"按钮
   - 或刷新页面重试

3. **查看重试队列**
   - 消息自动加入重试队列
   - 最多重试3次

### Q24: 文件保存失败怎么办？

**A:** 排查步骤：

1. **检查文件权限**
   ```bash
   ls -la file.ts
   ```

2. **检查磁盘空间**
   ```bash
   df -h
   ```

3. **检查文件是否被占用**
   - 关闭其他编辑器
   - 重启应用

### Q25: 应用崩溃怎么办？

**A:** 处理步骤：

1. **查看崩溃日志**
   - macOS: `~/Library/Logs/ClaudeCode-UI/`
   - Linux: `~/.config/ClaudeCode-UI/logs/`
   - Windows: `%APPDATA%/ClaudeCode-UI/logs/`

2. **提交Bug报告**
   - GitHub Issues
   - 附上崩溃日志

3. **临时解决方案**
   - 重启应用
   - 清除缓存重试

---

## 🔬 高级话题

### Q26: 如何开发插件？

**A:** 参考开发者指南：

```typescript
// plugins/my-plugin.ts
export default {
  name: 'my-plugin',
  version: '1.0.0',
  activate() {
    console.log('Plugin activated');
  },
  deactivate() {
    console.log('Plugin deactivated');
  }
};
```

### Q27: 如何自定义主题？

**A:** 创建自定义CSS：

```css
/* custom-theme.css */
:root {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --accent-color: #c96442;
}
```

然后在设置中导入。

### Q28: 如何配置代理？

**A:** 
```bash
# 设置代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 或在应用内设置
设置 → 网络 → 代理配置
```

### Q29: 如何启用调试模式？

**A:** 
```bash
# 启动时添加调试标志
DEBUG=* pnpm dev

# 或特定模块
DEBUG=cli:*,worker:* pnpm dev
```

### Q30: 如何导出对话历史？

**A:** 
1. 打开会话历史侧边栏
2. 点击"导出"按钮
3. 选择格式（Markdown/JSON/TXT）
4. 选择是否包含元数据
5. 点击"导出"

---

## 📞 获取帮助

### 在线资源

- 📖 [用户使用指南](./用户使用指南.md)
- 👨‍💻 [开发者指南](./开发者指南.md)
- 🐛 [提交Issue](https://github.com/changzhi777/claudecode_ui_app/issues)

### 联系方式

- 📧 Email: 14455975@qq.com
- 🐙 GitHub: https://github.com/changzhi777/claudecode_ui_app
- 💬 Discord: [加入社区](https://discord.gg/xxx)

### 贡献指南

欢迎贡献代码、文档或提出建议！

详见：[开发者指南 - 贡献指南](./开发者指南.md#-贡献指南)

---

## 🔗 相关链接

- [Electron文档](https://www.electronjs.org/docs)
- [React文档](https://react.dev)
- [TypeScript文档](https://www.typescriptlang.org/docs)
- [Vite文档](https://vitejs.dev)
- [Zustand文档](https://github.com/pmndrs/zustand)

---

**最后更新**：2026-04-22
**维护者**：BB小子 🤙

**Be water, my friend!** 🤙
