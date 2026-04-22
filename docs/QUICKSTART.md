# 快速开始指南

**版本**：v0.5.0
**更新日期**：2026-04-22
**作者**：BB小子 🤙

---

## 🚀 5分钟上手

### 前置要求

✅ **Node.js >= 18.0**
```bash
node --version  # 应该显示 v18.x.x 或更高
```

✅ **pnpm >= 8.0**
```bash
npm install -g pnpm
```

✅ **ClaudeCode CLI** (可选)
```bash
# 安装ClaudeCode CLI
npm install -g @anthropic-ai/claude-code

# 验证安装
claude --version
```

---

## 📦 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/changzhi777/claudecode_ui_app.git
cd claudecode_ui_app
```

### 2. 安装依赖

```bash
# 使用pnpm安装依赖（会自动检查Node版本）
pnpm install

# 如果遇到版本问题
npm install -g pnpm@latest
pnpm install
```

### 3. 启动开发模式

```bash
# 启动完整开发环境（渲染进程 + Electron）
pnpm dev

# 或者分步启动
pnpm dev:renderer  # 终端1：启动Vite开发服务器
pnpm dev:electron  # 终端2：启动Electron
```

### 4. 开始使用

🎉 **应用会自动打开，享受流畅的AI对话体验！**

---

## 🎯 核心功能

### 1. AI对话界面

- **流畅对话**：类似ChatGPT的消息流
- **多会话管理**：并行多个AI会话
- **历史记录**：自动保存对话历史
- **Markdown渲染**：代码高亮、格式化

### 2. 代码编辑器

- **Monaco Editor**：VS Code同款编辑器
- **语法高亮**：支持多种编程语言
- **智能提示**：自动补全、参数提示
- **多文件编辑**：同时编辑多个文件

### 3. CLI集成

- **无缝对接**：与ClaudeCode CLI完美集成
- **实时通信**：stdio流式数据传输
- **状态监控**：CLI进程状态实时显示
- **错误恢复**：自动重启崩溃的进程

### 4. 任务可视化

- **P2任务支持**：可视化展示任务状态
- **进度追踪**：实时显示任务执行进度
- **结果预览**：快速查看任务输出

---

## 💡 常用操作

### 发送第一条消息

1. 确保CLI路径配置正确（设置 -> CLI配置）
2. 在输入框输入消息
3. 点击发送或按 `Ctrl+Enter`
4. 等待AI响应

### 编辑代码文件

1. 点击文件树中的文件
2. 在Monaco编辑器中编辑
3. 使用快捷键：
   - `Ctrl+S`：保存
   - `Ctrl+F`：查找
   - `Ctrl+H`：替换
   - `Ctrl+/`：注释

### 管理会话

1. 点击左侧边栏的会话列表
2. 点击 "+" 创建新会话
3. 右键会话卡片可以：
   - 重命名
   - 删除
   - 导出
   - 固定

### 配置CLI路径

1. 打开设置（齿轮图标）
2. 选择 "CLI配置"
3. 输入CLI可执行文件路径：
   - macOS: `/usr/local/bin/claude`
   - Linux: `/usr/bin/claude`
   - Windows: `C:\Program Files\ClaudeCode\claude.exe`
4. 点击 "测试连接" 验证
5. 保存设置

---

## 🔧 开发模式

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:run

# 查看测试覆盖率
pnpm test:coverage

# 运行特定测试文件
pnpm test cliStore.test.ts
```

### 代码检查

```bash
# ESLint检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format
```

### 类型检查

```bash
# TypeScript类型检查
pnpm type-check
```

### 构建应用

```bash
# 构建生产版本
pnpm build

# 打包macOS应用
pnpm package:mac

# 打包Windows应用
pnpm package:win

# 打包Linux应用
pnpm package:linux

# 打包所有平台
pnpm package
```

---

## 🐳 Docker使用

### 开发环境

```bash
# 启动开发容器
pnpm docker:up

# 进入容器
docker exec -it claudecode-ui-app-dev bash

# 在容器中运行开发模式
pnpm dev
```

### 生产构建

```bash
# 构建生产镜像
docker build -f Dockerfile.prod -t claudecode-ui:prod .

# 运行生产容器
docker run -d -p 5173:5173 --name claudecode-ui claudecode-ui:prod
```

### 测试环境

```bash
# 启动测试容器
docker-compose -f docker-compose.test.yml up

# 运行测试
docker-compose -f docker-compose.test.yml run test pnpm test:run
```

---

## 📊 项目结构速览

```
claudecode_ui_app/
├── src/
│   ├── main/           # Electron主进程
│   ├── renderer/       # React渲染进程
│   │   ├── modules/    # 功能模块
│   │   │   ├── chat-ui/        # AI对话界面
│   │   │   ├── code-editor/    # 代码编辑器
│   │   │   ├── performance-panel/  # 性能监控
│   │   │   └── ...
│   │   ├── components/ # 通用组件
│   │   └── stores/     # Zustand状态管理
│   ├── ipc-bridge/     # IPC通信桥接
│   └── shared/         # 共享类型与工具
├── docs/              # 文档
├── scripts/           # 脚本工具
└── tests/             # 测试文件
```

---

## 🎨 自定义配置

### 修改窗口大小

编辑 `src/main/index.ts`:

```typescript
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,  // 修改宽度
    height: 1000, // 修改高度
    // ...
  });
}
```

### 更改主题色

编辑 `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#你的颜色',
      }
    }
  }
}
```

### 添加环境变量

创建 `.env` 文件：

```bash
# .env
ANTHROPIC_AUTH_TOKEN=your-token-here
CLAUDE_CLI_PATH=/usr/local/bin/claude
```

---

## 🐛 常见问题

### Q: 依赖安装失败？

```bash
# 清理缓存
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# 如果还是失败
npm install -g pnpm@latest
pnpm install
```

### Q: 找不到Claude CLI？

```bash
# 查找CLI路径
which claude

# 或者在应用设置中配置路径
设置 -> CLI配置 -> 输入路径
```

### Q: 端口被占用？

```bash
# 查找占用端口的进程
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 或修改端口
# vite.config.ts
server: {
  port: 5174  // 改为其他端口
}
```

### Q: 应用白屏？

```bash
# 1. 检查Vite服务器是否启动
curl http://localhost:5173

# 2. 查看控制台错误
# 打开开发者工具 (Ctrl+Shift+I)

# 3. 清理缓存重新构建
pnpm clean
pnpm dev
```

---

## 📚 下一步

- 📖 阅读[完整用户指南](./用户使用指南.md)
- 🔧 查看[开发者指南](./开发者指南.md)
- 🐛 解决问题参考[故障排查](./TROUBLESHOOTING.md)
- 🎯 了解[安全规范](./SECURITY.md)

---

## 🆘 获取帮助

- **GitHub Issues**: https://github.com/changzhi777/claudecode_ui_app/issues
- **Email**: 14455975@qq.com
- **文档**: https://github.com/changzhi777/claudecode_ui_app/tree/main/docs

---

**准备好了吗？开始你的AI编程之旅！** 🚀

Be water, my friend! 🤙
