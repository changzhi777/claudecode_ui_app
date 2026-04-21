# Zustand 状态管理模块

[根目录](../../CLAUDE.md) > **src/stores**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 04:03:38 | 初始化 | 创建状态管理模块文档 |

---

## 模块职责

管理应用的全局状态：

1. **会话状态**：管理对话会话与消息
2. **任务状态**：追踪任务执行进度
3. **文件状态**：管理打开的文件与编辑器状态
4. **UI 状态**：主题、布局、面板显示/隐藏

---

## 入口与启动

### 文件结构
```
src/stores/
├── index.ts             # 导出所有 store
├── session.ts           # 会话状态
├── task.ts              # 任务状态
├── file.ts              # 文件状态
├── ui.ts                # UI 状态
└── types.ts             # 共享类型
```

### 使用示例
```typescript
// 在组件中使用
import { useSessionStore } from '@/stores';

function ChatWindow() {
  const messages = useSessionStore(state => state.messages);
  const sendMessage = useSessionStore(state => state.sendMessage);

  return (
    <div>
      {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
      <button onClick={() => sendMessage('Hello')}>Send</button>
    </div>
  );
}
```

---

## 对外接口

### 会话 Store
**src/stores/session.ts**:
```typescript
interface SessionState {
  // 状态
  sessions: Session[];
  activeSessionId: string | null;
  filter: string;

  // 操作
  createSession: () => string;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newName: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;

  // 计算属性
  getActiveSession: () => Session | undefined;
  getMessages: (sessionId: string) => Message[];
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // 初始状态
  sessions: [],
  activeSessionId: null,
  filter: '',

  // 操作实现
  createSession: () => {
    const newSession: Session = {
      id: generateId(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
      messages: [],
    };
    set(state => ({ sessions: [...state.sessions, newSession] }));
    return newSession.id;
  },

  // ... 更多操作
}));
```

### 任务 Store
**src/stores/task.ts**:
```typescript
interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;

  // 操作
  createTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setActiveTask: (taskId: string) => void;
  cancelTask: (taskId: string) => void;
  pauseTask: (taskId: string) => void;
  addTaskLog: (taskId: string, log: TaskLog) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  activeTaskId: null,

  createTask: (task) => {
    const newTask: Task = {
      id: generateId(),
      ...task,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
      logs: [],
    };
    set(state => ({ tasks: [...state.tasks, newTask] }));
  },

  // ... 更多操作
}));
```

### 文件 Store
**src/stores/file.ts**:
```typescript
interface FileState {
  openFiles: EditorFile[];
  activeFileId: string | null;

  // 操作
  openFile: (file: EditorFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  openFiles: [],
  activeFileId: null,

  openFile: (file) => {
    const exists = get().openFiles.find(f => f.path === file.path);
    if (!exists) {
      set(state => ({ openFiles: [...state.openFiles, file] }));
    }
    set({ activeFileId: file.id });
  },

  // ... 更多操作
}));
```

### UI Store
**src/stores/ui.ts**:
```typescript
interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  panelWidth: number;
  fontSize: number;

  // 操作
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setPanelWidth: (width: number) => void;
  setFontSize: (size: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  panelWidth: 300,
  fontSize: 14,

  toggleTheme: () => {
    set(state => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    }));
  },

  // ... 更多操作
}));
```

---

## 关键依赖与配置

### 核心依赖
- `zustand`: 状态管理库
- `immer`: 不可变状态更新（Zustand 内置）

### 持久化中间件
```typescript
import { persist } from 'zustand/middleware';

// 持久化会话状态
export const useSessionStore = create(
  persist<SessionState>(
    (set, get) => ({
      // ... state & actions
    }),
    {
      name: 'session-storage', // localStorage key
    }
  )
);

// 持久化 UI 状态
export const useUIStore = create(
  persist<UIState>(
    (set) => ({
      // ... state & actions
    }),
    {
      name: 'ui-storage',
    }
  )
);
```

---

## 数据模型

### 共享类型
**src/stores/types.ts**:
```typescript
// 会话相关
interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  messages: Message[];
}

interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
  };
}

// 任务相关
interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  progress: number;
  startTime: number;
  endTime?: number;
  logs: TaskLog[];
}

type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

// 文件相关
interface EditorFile {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  isDirty?: boolean;
}
```

---

## 最佳实践

### 状态拆分原则
1. **按功能拆分**：会话、任务、文件、UI 各自独立
2. **避免嵌套**：状态扁平化，避免深层嵌套
3. **派生状态**：使用 Selector 计算派生状态

### Selector 示例
```typescript
// 获取当前会话的消息
const messages = useSessionStore(state => {
  const activeSession = state.sessions.find(s => s.id === state.activeSessionId);
  return activeSession?.messages || [];
});

// 获取运行中的任务
const runningTasks = useTaskStore(state =>
  state.tasks.filter(t => t.status === 'running')
);
```

### 异步操作
```typescript
// 在 store 中处理异步操作
interface SessionState {
  // ...
  sendMessage: (content: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // ...
  sendMessage: async (content) => {
    const activeSessionId = get().activeSessionId;
    if (!activeSessionId) return;

    // 添加用户消息
    const userMessage: Message = {
      id: generateId(),
      sessionId: activeSessionId,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    get().addMessage(activeSessionId, userMessage);

    // 调用 IPC 发送到 CLI
    const result = await ipcInvoker.sendToCLI(content);
    if (result.success) {
      // 处理 AI 响应
      const aiMessage: Message = {
        id: generateId(),
        sessionId: activeSessionId,
        role: 'assistant',
        content: result.data.response,
        timestamp: Date.now(),
      };
      get().addMessage(activeSessionId, aiMessage);
    }
  },
}));
```

---

## 测试与质量

### 单元测试
- Store 初始化测试
- Action 执行测试
- Selector 计算测试

### 测试文件
```
stores/
├── __tests__/
│   ├── session.test.ts
│   ├── task.test.ts
│   ├── file.test.ts
│   └── ui.test.ts
```

---

## 常见问题 (FAQ)

### Q: 如何在组件外访问 store？
A: 直接调用 store 函数获取状态：`const sessions = useSessionStore.getState().sessions;`

### Q: 如何处理跨模块的状态依赖？
A: 在一个 store 中监听另一个 store 的变化，或使用 React useEffect 协调。

### Q: 如何优化性能？
A: 使用 Selector 精确订阅需要的状态片段，避免不必要的重渲染。

---

## 相关文件清单

- `src/stores/index.ts` - 导出所有 store
- `src/stores/session.ts` - 会话状态
- `src/stores/task.ts` - 任务状态
- `src/stores/file.ts` - 文件状态
- `src/stores/ui.ts` - UI 状态
- `src/stores/types.ts` - 共享类型

---

## 下一步行动

1. ⬜ 实现会话 Store
2. ⬜ 实现任务 Store
3. ⬜ 实现文件 Store
4. ⬜ 实现 UI Store
5. ⬜ 添加持久化中间件

---

**模块状态**: 🟡 规划中
**负责人**: 待分配
**最后更新**: 2026-04-22 04:03:38
