# 启动指南

## 快速启动

### 方式 1: Web 预览（推荐用于开发 UI）

```bash
pnpm dev
```

访问 http://localhost:5173 在浏览器中预览

### 方式 2: Electron 桌面应用

**终端 1 - 启动 Vite 开发服务器：**
```bash
pnpm dev:renderer
```

**终端 2 - 启动 Electron 桌面应用：**
```bash
pnpm dev:electron
```

### 方式 3: 一键启动（需要 concurrently）

```bash
pnpm dev:full
```

## 功能清单

### ✅ 已实现

- 🎨 **主题系统**
  - Claude 主题（温暖人文）
  - Cursor 主题（精密工程）
  - Warp 主题（极简深色）
  - 快捷键：⌘T / Ctrl+T

- 💬 **对话界面**
  - AI 对话气泡
  - 自动滚动
  - Enter 发送 / Shift+Enter 换行
  - 消息时间戳

- 📜 **会话管理**
  - 新建对话
  - 切换对话
  - 删除对话
  - 搜索对话
  - 时间显示（刚刚/分钟前/小时前/天前）

- 💾 **导出功能**
  - Markdown 格式
  - JSON 格式
  - 纯文本格式
  - 包含/排除元数据选项

- 📁 **文件树**
  - VS Code 风格
  - 折叠/展开
  - 文件图标
  - 修改状态指示

- ✏️ **代码编辑器**
  - Monaco Editor
  - 多标签页
  - 语法高亮
  - 快捷键支持

- 📊 **任务可视化**
  - 实时进度追踪
  - 任务状态显示
  - 自动更新演示

- 🔄 **视图切换**
  - 对话视图
  - 工作区视图
  - 快捷键：⌘K / Ctrl+K

- ⌨️ **快捷键面板**
  - ⌘K 打开/关闭
  - 搜索快捷键
  - 分类显示

- ⚙️ **设置面板**
  - 外观设置
  - 快捷键设置
  - 通知设置
  - 账户信息

### 🔧 开发中

- 与 ClaudeCode CLI 实际对接
- 文件读写功能
- 代码运行功能
- 云端同步支持

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| ⌘T / Ctrl+T | 切换主题 |
| ⌘K / Ctrl+K | 切换视图 / 打开快捷键面板 |
| ⌘N / Ctrl+N | 新建对话 |
| Enter | 发送消息 |
| Shift+Enter | 换行 |
| Escape | 关闭面板 |

## 技术栈

- **桌面框架**: Electron 30.5
- **前端框架**: React 18.3
- **构建工具**: Vite 5.4
- **UI 组件**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand 4.5
- **代码编辑**: Monaco Editor
- **图标**: Lucide React

## 开发命令

```bash
# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format

# 构建
pnpm build

# 打包应用
pnpm package:mac      # macOS
pnpm package:win      # Windows
pnpm package:linux    # Linux
```

## 故障排查

### Electron 无法启动

1. 确保已安装 Electron：
   ```bash
   npm install electron@30.5.1 --save-dev
   ```

2. 手动运行安装脚本：
   ```bash
   cd node_modules/electron && node install.js
   ```

### 端口被占用

如果 5173 端口被占用，Vite 会自动尝试下一个端口（5174、5175...）。

### 主题切换不生效

检查浏览器控制台是否有错误，确保 CSS 变量正确加载。

## 项目结构

```
claudecode_ui_app/
├── src/
│   ├── main/              # Electron 主进程
│   ├── preload/           # Electron 预加载脚本
│   ├── renderer/          # React 渲染进程
│   │   ├── components/    # 通用组件
│   │   ├── modules/       # 功能模块
│   │   │   ├── chat-ui/   # 对话界面
│   │   │   ├── code-editor/ # 代码编辑器
│   │   │   ├── file-tree/ # 文件树
│   │   │   ├── session-mgr/ # 会话管理
│   │   │   ├── task-viz/  # 任务可视化
│   │   │   └── workspace/ # 工作区
│   │   ├── hooks/         # React Hooks
│   │   └── styles/        # 样式文件
│   ├── stores/            # Zustand 状态管理
│   ├── shared/            # 共享代码
│   │   ├── themes/        # 主题配置
│   │   └── types/         # TypeScript 类型
│   └── ipc-bridge/        # IPC 通信桥接
├── electron-dev.js        # Electron 开发入口
├── vite.web.config.ts     # Vite Web 配置
├── electron.vite.config.ts # Electron Vite 配置
└── package.json           # 项目配置
```

## 联系方式

- **作者**: 外星动物（常智）
- **组织**: IoTchange
- **邮箱**: 14455975@qq.com
- **版权**: Copyright (C) 2026 IoTchange - All Rights Reserved

---

**享受编码！** 🤙
