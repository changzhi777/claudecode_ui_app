# AI 对话界面模块

[面包屑导航](../) / 模块 / AI 对话界面

---

## 模块概述

负责 AI 对话交互的核心 UI 模块，提供类似 ChatGPT 的对话体验。

**职责**：
- 消息展示（用户/AI 气泡）
- 消息输入与发送
- 会话管理（新建/切换/删除）
- 加载状态显示

---

## 组件结构

```
chat-ui/
├── ChatUI.tsx                 # 主容器组件
├── components/
│   ├── ChatMessageList.tsx   # 消息列表
│   ├── MessageBubble.tsx     # 消息气泡
│   └── ChatInput.tsx         # 输入框
└── CLAUDE.md                  # 本文档
```

---

## 对外接口

### Props

无（顶层组件，直接使用）

### 状态管理

使用 `useChatStore` 管理对话状态：

```typescript
import { useChatStore } from '@stores/chatStore';

const {
  sessions,           // 所有会话
  currentSessionId,   // 当前会话 ID
  isLoading,          // 加载状态
  createSession,      // 创建会话
  addMessage,         // 添加消息
} = useChatStore();
```

---

## 样式规范

### 主题适配

组件使用 CSS 变量适配三大主题：

```css
/* Claude 主题 */
--chat-user-bubble: #c96442;  /* 赤陶色 */
--chat-ai-bubble: #faf9f5;    /* 象牙白 */
--chat-input-bg: #ffffff;     /* 纯白 */

/* Cursor 主题 */
--chat-user-bubble: #f54e00;  /* 橙色 */
--chat-ai-bubble: #f7f7f4;    /* 米白 */
--chat-input-bg: #ffffff;     /* 纯白 */

/* Warp 主题 */
--chat-user-bubble: #353534;  /* 土灰 */
--chat-ai-bubble: rgba(255, 255, 255, 0.08);  /* 半透明 */
--chat-input-bg: #353534;     /* 土灰 */
```

### 气泡样式

```css
/* 用户气泡 */
bg-chat-user-bubble
text-white
rounded-2xl
max-w-[80%]

/* AI 气泡 */
bg-chat-ai-bubble
text-text-primary
rounded-2xl
max-w-[80%]
```

---

## 交互行为

### 消息发送

1. 用户输入 → Enter 发送
2. Shift+Enter → 换行
3. 显示加载状态
4. 接收 AI 响应
5. 自动滚动到底部

### 快捷操作

- ⌘N / Ctrl+N - 新建对话
- ⌘T / Ctrl+T - 切换主题

---

## 数据流

```
用户输入
  ↓
ChatInput.onSend(content)
  ↓
useChatStore.addMessage({ role: 'user', content })
  ↓
setLoading(true)
  ↓
IPC 调用 ClaudeCode CLI（TODO）
  ↓
接收 AI 响应
  ↓
useChatStore.addMessage({ role: 'assistant', content })
  ↓
setLoading(false)
```

---

## 测试策略

### 单元测试

- MessageBubble 渲染不同角色
- ChatInput 快捷键行为
- 自动滚动功能

### 集成测试

- 完整对话流程
- 会话切换
- 消息持久化

---

## 依赖关系

### 外部依赖

- `zustand` - 状态管理
- `lucide-react` - 图标库

### 内部依赖

- `@stores/chatStore` - 对话状态
- `@shared/types/chat` - 类型定义

---

## 下一步计划

- [ ] 集成 ClaudeCode CLI IPC
- [ ] 支持代码高亮
- [ ] 消息流式输出
- [ ] 会话历史侧边栏
- [ ] 导出对话功能

---

**模块状态**: ✅ 核心功能完成
**最后更新**: 2026-04-22
