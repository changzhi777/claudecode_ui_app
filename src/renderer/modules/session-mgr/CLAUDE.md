# 会话管理模块

[根目录](../../../CLAUDE.md) > [src/renderer](../../) > **modules/session-mgr**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 04:03:38 | 初始化 | 创建会话管理模块文档 |

---

## 模块职责

管理用户与 AI 的对话会话：

1. **会话列表**：展示所有历史会话
2. **会话切换**：在不同会话间快速切换
3. **会话创建**：新建对话会话
4. **会话删除**：删除不需要的会话
5. **会话持久化**：保存到本地存储
6. **会话搜索**：按关键词搜索会话

---

## 入口与启动

### 主组件
**文件路径**: `src/renderer/modules/session-mgr/index.tsx`

```typescript
// 组件结构（待实现）
export function SessionManager() {
  return (
    <div className="h-full flex flex-col">
      <SessionHeader />
      <SessionList />
      <SessionSearch />
      <NewSessionButton />
    </div>
  );
}
```

### 子组件
- `SessionList.tsx` - 会话列表
- `SessionItem.tsx` - 单个会话项
- `SessionSearch.tsx` - 搜索框
- `SessionHeader.tsx` - 标题栏

---

## 对外接口

### Props 接口

```typescript
interface SessionManagerProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionCreate: () => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newName: string) => void;
}

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: () => void;
}
```

### 数据结构

```typescript
interface Session {
  id: string;
  title: string;              // 会话标题（自动生成或用户自定义）
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  messages: Message[];        // 关联的消息列表
  metadata?: {
    model?: string;
    totalTokens?: number;
    tags?: string[];
  };
}

interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;
  filter: string;             // 搜索关键词
}
```

---

## 关键依赖与配置

### 核心依赖
- `zustand`: 状态管理
- `date-fns`: 时间格式化
- `lucide-react`: 图标库

### 持久化配置
使用 `localStorage` 或 `electron-store`：

```typescript
// 保存到本地
export function saveSessions(sessions: Session[]) {
  localStorage.setItem('sessions', JSON.stringify(sessions));
}

// 从本地加载
export function loadSessions(): Session[] {
  const data = localStorage.getItem('sessions');
  return data ? JSON.parse(data) : [];
}
```

---

## UI/UX 设计要点

### 布局结构
```
┌─────────────────────────────────────┐
│ 💬 Sessions                   [+]  │ <- 标题栏
├─────────────────────────────────────┤
│ 🔍 Search sessions...              │ <- 搜索框
├─────────────────────────────────────┤
│ 📄 Fix React bug          2m ago   │ <- 会话列表
│ 📄 Code review            1h ago   │
│ 📄 Feature implementation  3h ago  │
│ 📄 Debug login issue      Yesterday│
└─────────────────────────────────────┘
```

### 会话标题生成规则
```typescript
// 自动生成标题（基于第一条用户消息）
function generateSessionTitle(firstMessage: string): string {
  const maxLength = 30;
  const cleaned = firstMessage
    .replace(/[^\w\s]/g, '')
    .trim();
  return cleaned.length > maxLength
    ? cleaned.substring(0, maxLength) + '...'
    : cleaned;
}
```

### 交互规范
1. **单击会话项**：切换到该会话
2. **右键会话项**：显示菜单（重命名、删除）
3. **双击会话项**：重命名会话
4. **搜索框**：实时过滤会话列表
5. **新建按钮**：创建新会话并切换

---

## 测试与质量

### 单元测试
- 会话创建与删除测试
- 会话切换测试
- 搜索过滤测试

### 集成测试
- 持久化存储测试
- 与消息模块集成测试

### 测试文件
```
session-mgr/
├── __tests__/
│   ├── SessionManager.test.tsx
│   ├── SessionList.test.tsx
│   └── SessionSearch.test.tsx
```

---

## 常见问题 (FAQ)

### Q: 如何处理会话数量过多？
A: 限制最多显示 50 个会话，旧会话自动归档到历史记录。

### Q: 如何导出会话？
A: 提供"导出会话"功能，将会话导出为 Markdown 或 JSON 文件。

### Q: 如何同步到云端？
A: 预留接口，未来可集成云端存储（如 GitHub Gist、自建服务器）。

---

## 相关文件清单

- `src/renderer/modules/session-mgr/index.tsx` - 主组件
- `src/renderer/modules/session-mgr/SessionList.tsx` - 会话列表
- `src/renderer/modules/session-mgr/SessionItem.tsx` - 会话项
- `src/stores/session.ts` - Zustand store

---

## 下一步行动

1. ⬜ 创建基础组件结构
2. ⬜ 实现会话列表渲染
3. ⬜ 添加会话创建与切换逻辑
4. ⬜ 实现搜索过滤功能
5. ⬜ 集成本地持久化

---

**模块状态**: 🟡 规划中
**负责人**: 待分配
**最后更新**: 2026-04-22 04:03:38
