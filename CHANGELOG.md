# 更新日志

## [0.3.0] - 2026-04-22

### ✨ 新功能

#### 任务可视化
- ✅ 实时任务进度追踪
- ✅ 任务类型图标（思考/读取/搜索/编辑/执行/分析）
- ✅ 任务状态管理（pending/running/completed/failed）
- ✅ 进度条显示
- ✅ 任务时间统计
- ✅ 可折叠侧边栏
- ✅ 任务历史记录（最近 50 个）
- ✅ 开发环境演示模式

#### IPC 通信桥接
- ✅ 完整的 IPC 类型系统
- ✅ ipcClient - 渲染进程客户端
- ✅ ipcServer - 主进程服务器
- ✅ ipcPreload - 安全的预加载脚本
- ✅ 消息队列管理
- ✅ 超时处理（30 秒）
- ✅ 开发环境模拟响应

#### 状态管理增强
- ✅ taskStore - 任务状态管理
- ✅ 任务组（TaskGroup）概念
- ✅ 自动完成检测

### 📦 依赖

**无新增依赖**

**现有**:
- @monaco-editor/react ^4.7.0
- lucide-react ^1.8.0
- react ^18.3.1
- zustand ^4.5.2

### 📝 文档

- ✅ src/shared/types/task.ts - 任务类型定义
- ✅ src/shared/types/ipc.ts - IPC 类型定义
- ✅ src/stores/taskStore.ts - 任务状态管理
- ✅ src/ipc-bridge/ - IPC 通信模块
- ✅ src/renderer/modules/task-viz/ - 任务可视化模块
- ✅ 更新 CHANGELOG.md - 完整更新日志

### 🔧 改进

- 修复 IPC 类型安全问题
- 优化任务状态更新逻辑
- 改进侧边栏交互体验
- 添加空状态提示

---

## [0.2.0] - 2026-04-22

### ✨ 新功能

#### 代码编辑器
- ✅ Monaco Editor 集成
- ✅ 多标签页支持
- ✅ 语法高亮（30+ 语言）
- ✅ 文件修改状态提示
- ✅ 保存快捷键（⌘S）
- ✅ 行号和小地图
- ✅ 状态栏（语言、编码、行列）

#### 文件树
- ✅ VS Code 风格文件树
- ✅ 目录展开/折叠
- ✅ 文件图标（File/Folder/FolderOpen）
- ✅ 点击打开文件
- ✅ 选中状态高亮
- ✅ 工具栏（新建、刷新）

#### 视图系统
- ✅ ViewSwitcher 组件（对话 ↔ 工作区）
- ✅ ⌘K 快捷键切换视图
- ✅ viewStore 状态管理
- ✅ 视图状态持久化

#### 状态管理增强
- ✅ editorStore - 编辑器状态
- ✅ viewStore - 视图状态
- ✅ 标签页 CRUD 操作
- ✅ 文件树展开状态

### 📦 依赖

**新增**:
- @monaco-editor/react ^4.7.0 - Monaco Editor 包装器
- monaco-editor ^0.55.1 - 代码编辑器核心

**现有**:
- lucide-react ^1.8.0 - 图标库
- react ^18.3.1
- zustand ^4.5.2

### 📝 文档

- ✅ src/shared/types/files.ts - 文件系统类型
- ✅ src/renderer/modules/code-editor/CLAUDE.md - 编辑器模块文档（待创建）
- ✅ src/renderer/modules/file-tree/CLAUDE.md - 文件树模块文档
- ✅ 更新 README.md - 新增代码编辑器功能

### 🔧 改进

- 修复 FileTreeItem 图标问题
- 修复 editorStore 类型错误
- 优化标签页切换体验
- 添加空状态提示

---

## [0.1.0] - 2026-04-22

### ✨ 新功能

#### 主题系统
- ✅ 三大主题：Claude（温暖人文）/ Cursor（精密工程）/ Warp（极简深色）
- ✅ 主题切换器 UI 组件
- ✅ 快捷键切换（⌘T / Ctrl+T）
- ✅ localStorage 持久化
- ✅ CSS 变量自动注入
- ✅ Tailwind CSS 集成

#### AI 对话界面
- ✅ ChatUI 主容器组件
- ✅ MessageBubble 消息气泡（用户/AI/系统）
- ✅ ChatInput 输入框（支持 Enter 发送，Shift+Enter 换行）
- ✅ ChatMessageList 消息列表（自动滚动）
- ✅ 会话管理（新建/切换/删除）
- ✅ 对话状态持久化
- ✅ 加载状态显示
- ✅ 欢迎界面（快捷操作卡片）

#### 状态管理
- ✅ Zustand store 配置
- ✅ themeStore - 主题状态管理
- ✅ chatStore - 对话状态管理
- ✅ localStorage 中间件集成

#### 项目基础
- ✅ React 18 + TypeScript 5
- ✅ Vite 5 构建工具
- ✅ Tailwind CSS 3
- ✅ Electron 30 集成
- ✅ ESLint + Prettier
- ✅ 路径别名配置
- ✅ 完整目录结构

### 📦 依赖

**新增**:
- lucide-react ^1.8.0 - 图标库

**核心**:
- react ^18.3.1
- react-dom ^18.3.1
- zustand ^4.5.2

### 📝 文档

- ✅ THEME_ARCHITECTURE.md - 主题系统完整架构
- ✅ DESIGN_GUIDE.md - 综合设计指南
- ✅ CLAUDE.md - 项目架构文档
- ✅ README.md - 项目说明
- ✅ src/renderer/modules/chat-ui/CLAUDE.md - 对话模块文档
- ✅ 设计系统：DESIGN.md (Claude/Cursor/Warp)

### 🎨 设计

- 主题色彩系统（每主题 50+ CSS 变量）
- 字体层次系统（Display/UI/Body/Code）
- 组件样式系统（按钮/卡片/输入框）
- 深度与阴影系统（环形阴影）
- 响应式断点配置

### 🔧 开发工具

- TypeScript 类型检查
- ESLint 代码检查
- Prettier 代码格式化
- Vite HMR 热更新
- 路径别名（@/@shared/@renderer/@stores/@components）

### 🚀 脚本

```bash
pnpm dev              # Web 开发模式
pnpm electron:dev     # Electron 桌面应用
pnpm type-check       # 类型检查
pnpm lint             # 代码检查
pnpm format           # 代码格式化
```

### 📊 项目统计

- **总文件数**: 30+
- **代码行数**: 2000+
- **组件数**: 10+
- **主题数**: 3
- **状态 Store**: 2

---

## [0.4.0] - 计划中

### 🚧 待开发

- [ ] ClaudeCode CLI 实际集成
- [ ] 文件内容实际加载
- [ ] 会话历史侧边栏
- [ ] 导出对话功能
- [ ] 代码格式化
- [ ] 流式输出
- [ ] 搜索功能
- [ ] 快捷键系统完善

---

## 关于

**项目**: ClaudeCode UI App
**作者**: 外星动物（常智） / IoTchange
**联系**: 14455975@qq.com
**技术栈**: React + Electron + Vite + Tailwind + Zustand + Monaco Editor
**设计理念**: Be Water, My Friend - 如水般适应不同心境
**版权**: Copyright (C) 2026 IoTchange - All Rights Reserved
