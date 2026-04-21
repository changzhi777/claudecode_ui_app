# ClaudeCode UI App

为 ClaudeCode CLI 打造的现代化桌面 UI 界面。

## 项目愿景

提供类似 ChatGPT 的流畅对话体验，同时集成强大的代码编辑与文件管理能力，让 AI 辅助编程更直观、更高效。

## 技术栈

- **桌面框架**: Electron
- **前端框架**: React 18+
- **构建工具**: Vite
- **UI 组件**: shadcn/ui
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand
- **代码编辑**: Monaco Editor

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发模式（Electron + Vite）
pnpm dev

# 构建应用
pnpm build

# 预览构建结果
pnpm preview

# 打包桌面应用（所有平台）
pnpm package

# 仅打包 macOS
pnpm package:mac

# 仅打包 Windows
pnpm package:win

# 仅打包 Linux
pnpm package:linux
```

**注意**：
- 开发模式下会自动启动 Electron 桌面应用
- 主题切换可在开发模式下实时预览
- 支持热更新，修改代码后自动刷新

## 项目结构

```
claudecode_ui_app/
├── src/
│   ├── main/                    # Electron 主进程
│   ├── renderer/                # React 渲染进程
│   │   ├── components/          # 共享 UI 组件
│   │   │   ├── ThemeProvider.tsx    # ✅ 主题提供者
│   │   │   ├── ThemeSwitcher.tsx    # ✅ 主题切换器
│   │   │   └── ViewSwitcher.tsx     # ✅ 视图切换器
│   │   ├── modules/             # 功能模块
│   │   │   ├── chat-ui/         # ✅ AI 对话界面
│   │   │   │   ├── ChatUI.tsx
│   │   │   │   └── components/
│   │   │   ├── code-editor/     # ✅ 代码编辑器
│   │   │   │   ├── CodeEditor.tsx
│   │   │   │   └── components/
│   │   │   ├── file-tree/       # ✅ 文件树
│   │   │   │   ├── FileTree.tsx
│   │   │   │   └── components/
│   │   │   ├── workspace/       # ✅ 工作区容器
│   │   │   ├── task-viz/        # 🚧 任务可视化
│   │   │   └── session-mgr/     # 🚧 会话管理
│   │   ├── hooks/               # React Hooks
│   │   │   ├── useThemeShortcut.ts  # ✅ 主题快捷键
│   │   │   └── useViewShortcut.ts   # ✅ 视图快捷键
│   │   ├── utils/               # 工具函数
│   │   ├── App.tsx              # 主应用
│   │   └── main.tsx             # 入口
│   ├── stores/                  # Zustand 状态管理
│   │   ├── themeStore.ts        # ✅ 主题状态
│   │   ├── chatStore.ts         # ✅ 对话状态
│   │   ├── editorStore.ts       # ✅ 编辑器状态
│   │   └── viewStore.ts         # ✅ 视图状态
│   ├── shared/                  # 共享代码
│   │   ├── types/               # TypeScript 类型
│   │   │   ├── theme.ts
│   │   │   ├── chat.ts
│   │   │   └── files.ts
│   │   └── themes/              # 主题配置
│   └── preload/                 # Electron 预加载
├── THEME_ARCHITECTURE.md        # 主题系统架构
├── DESIGN_GUIDE.md              # 设计指南
├── CHANGELOG.md                 # 更新日志
├── CLAUDE.md                    # 项目架构文档
└── README.md                    # 本文档
```

## 核心功能

### ✅ 已实现

- 🎨 **三大主题系统** - Claude / Cursor / Warp 可切换
- 💬 **AI 对话界面** - 类似 ChatGPT 的流畅对话体验
- 🔄 **会话管理** - 新建/切换/删除对话，自动保存
- 📜 **会话历史** - 带搜索的历史记录侧边栏
- 💾 **导出功能** - 支持 Markdown、JSON、TXT 格式
- 📁 **文件树组件** - VS Code 风格的文件浏览
- ✏️ **Monaco Editor** - 专业代码编辑器
- 📑 **多标签页** - 同时编辑多个文件
- 📊 **任务可视化** - 实时任务进度追踪
- 🔄 **视图切换** - 对话界面 ↔ 工作区
- 🔌 **IPC 通信桥接** - 渲染进程 ↔ 主进程
- ⌨️ **快捷键支持** - ⌘T 切换主题，⌘K 切换视图，⌘K 打开快捷键面板
- ⚙️ **设置面板** - 外观、快捷键、通知、账户配置
- 💾 **状态持久化** - 对话、标签页、主题偏好自动保存

### 🚧 开发中

- 与 ClaudeCode CLI 双向通信
- 文件内容实际加载与保存
- 代码格式化与高亮优化
- 高级搜索功能
- 云端同步支持

## 设计系统

本项目采用**可切换主题系统**，融合三个顶级开发工具的设计理念：

### 三大主题

| 主题 | 氛围 | 适用场景 | 快捷键 |
|------|------|----------|--------|
| 📖 **Claude** | 温暖人文 | 深度思考、阅读、对话 | ⌘T / Ctrl+T |
| ⚡ **Cursor** | 精密工程 | 编码、调试、开发 | ⌘T / Ctrl+T |
| 🌙 **Warp** | 极简深色 | 夜间工作、专注模式 | ⌘T / Ctrl+T |

### 主题切换

- 点击界面右上角的主题切换器
- 使用快捷键 `⌘T` (Mac) 或 `Ctrl+T` (Windows/Linux)
- 主题偏好自动保存到本地存储

### 设计资源

- **[THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md)** - 主题系统架构（新建）
- **[DESIGN_GUIDE.md](./DESIGN_GUIDE.md)** - 综合设计系统指南
- **[DESIGN.md](./DESIGN.md)** - Claude 设计系统
- **[cursor/DESIGN.md](./cursor/DESIGN.md)** - Cursor 设计系统
- **[warp/DESIGN.md](./warp/DESIGN.md)** - Warp 设计系统

## 开发指南

详细的架构文档请查看 [CLAUDE.md](./CLAUDE.md)。

### 使用 AI 助手构建 UI

#### 指定主题构建

```
请参考 THEME_ARCHITECTURE.md，
使用 Claude 主题构建对话界面：
- 羊皮纸背景 (#f5f4ed)
- 赤陶色强调 (#c96442)
- Georgia 标题 + system-ui UI
- 环形阴影 + 8px 圆角
```

#### 主题感知构建

```
请使用当前激活的主题（data-theme 属性）
构建一个响应式的卡片组件，
确保在 Claude/Cursor/Warp 三个主题下都能正常显示。
```

### 模块文档

每个模块都有详细的 `CLAUDE.md` 文档：

- [Electron 主进程](./src/main/CLAUDE.md)
- [AI 对话界面](./src/renderer/modules/chat-ui/CLAUDE.md)
- [代码编辑器](./src/renderer/modules/code-editor/CLAUDE.md)
- [文件树](./src/renderer/modules/file-tree/CLAUDE.md)
- [任务可视化](./src/renderer/modules/task-viz/CLAUDE.md)
- [会话管理](./src/renderer/modules/session-mgr/CLAUDE.md)
- [IPC 通信桥接](./src/ipc-bridge/CLAUDE.md)
- [状态管理](./src/stores/CLAUDE.md)
- [共享工具](./src/shared/CLAUDE.md)

## 贡献指南

1. 阅读根级 `CLAUDE.md` 了解整体架构
2. 查看相关模块的 `CLAUDE.md` 了解具体职责
3. 遵循编码规范与测试策略
4. 提交前运行 `pnpm type-check` 和 `pnpm lint`

## 项目信息

- **作者**: 外星动物（常智）
- **组织**: IoTchange
- **联系**: 14455975@qq.com
- **版权**: Copyright (C) 2026 IoTchange - All Rights Reserved
- **版本**: v0.1.0
- **GitHub**: https://github.com/changzhi777/claudecode_ui_app
- **许可证**: MIT

## 许可证

MIT License

Copyright (c) 2026 IoTchange

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

**项目状态**: 🟢 基础架构完成
**文档版本**: v0.0.1
**最后更新**: 2026-04-22
