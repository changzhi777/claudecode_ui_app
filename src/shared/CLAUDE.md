# 共享工具模块

[根目录](../../CLAUDE.md) > **src/shared**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 04:03:38 | 初始化 | 创建共享工具模块文档 |

---

## 模块职责

提供主进程与渲染进程共享的工具函数与类型定义：

1. **类型定义**：全局 TypeScript 类型
2. **常量定义**：应用级常量
3. **工具函数**：通用工具函数
4. **验证器**：数据验证与转换

---

## 入口与启动

### 文件结构
```
src/shared/
├── index.ts             # 导出所有模块
├── types.ts             # 全局类型定义
├── constants.ts         # 常量定义
├── utils.ts             # 工具函数
└── validators.ts        # 数据验证器
```

### 导出示例
```typescript
// src/shared/index.ts
export * from './types';
export * from './constants';
export * from './utils';
export * from './validators';

// 使用
import { generateId, formatDate, Message } from '@/shared';
```

---

## 对外接口

### 类型定义
**src/shared/types.ts**:
```typescript
// 全局类型
export interface AppConfig {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  cliPath: string;
  projectPath: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model?: string;
  tokens?: number;
  duration?: number;
}

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  progress: number;
  startTime: number;
  endTime?: number;
  logs: TaskLog[];
}

export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface TaskLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}
```

### 常量定义
**src/shared/constants.ts**:
```typescript
// 应用信息
export const APP_NAME = 'ClaudeCode UI';
export const APP_VERSION = '0.1.0';

// 文件限制
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_MESSAGE_LENGTH = 10000;

// 超时设置
export const IPC_TIMEOUT = 30000; // 30s
export const CLI_STARTUP_TIMEOUT = 10000; // 10s

// UI 常量
export const DEFAULT_FONT_SIZE = 14;
export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 24;

// 颜色主题
export const THEMES = {
  light: 'light',
  dark: 'dark',
  auto: 'auto',
} as const;

// 文件图标映射
export const FILE_ICONS: Record<string, string> = {
  'ts': 'file-ts',
  'tsx': 'file-react',
  'js': 'file-js',
  'json': 'file-json',
  'md': 'file-markdown',
  // ... 更多映射
};
```

### 工具函数
**src/shared/utils.ts**:
```typescript
// ID 生成器
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

// 时间格式化
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 代码高亮语言检测
export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop();
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'rs': 'rust',
    'go': 'go',
    'json': 'json',
    'md': 'markdown',
  };
  return languageMap[ext || ''] || 'plaintext';
}

// 消息内容截断
export function truncateMessage(content: string, maxLength = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

### 数据验证器
**src/shared/validators.ts**:
```typescript
// 验证配置对象
export function validateConfig(config: unknown): config is AppConfig {
  if (typeof config !== 'object' || config === null) return false;

  const c = config as Partial<AppConfig>;
  return (
    typeof c.theme === 'string' &&
    ['light', 'dark', 'auto'].includes(c.theme) &&
    typeof c.fontSize === 'number' &&
    c.fontSize >= 10 &&
    c.fontSize <= 24 &&
    typeof c.cliPath === 'string' &&
    typeof c.projectPath === 'string'
  );
}

// 验证消息对象
export function validateMessage(message: unknown): message is Message {
  if (typeof message !== 'object' || message === null) return false;

  const m = message as Partial<Message>;
  return (
    typeof m.id === 'string' &&
    typeof m.sessionId === 'string' &&
    typeof m.role === 'string' &&
    ['user', 'assistant', 'system'].includes(m.role) &&
    typeof m.content === 'string' &&
    typeof m.timestamp === 'number'
  );
}

// 验证文件路径
export function validateFilePath(path: string): boolean {
  // 基本路径验证
  if (!path || typeof path !== 'string') return false;

  // 检查是否包含非法字符
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(path)) return false;

  return true;
}
```

---

## 关键依赖与配置

### 核心依赖
- 无外部依赖（纯工具函数）

### TypeScript 配置
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 使用示例

### 在主进程中使用
```typescript
// src/main/cli/process.ts
import { generateId, IPC_STARTUP_TIMEOUT } from '@/shared';

export function startCLIProcess(config: CLIConfig) {
  const processId = generateId('cli');
  const timeout = IPC_STARTUP_TIMEOUT;

  // ... 启动逻辑
}
```

### 在渲染进程中使用
```typescript
// src/renderer/modules/chat-ui/MessageBubble.tsx
import { formatDate, truncateMessage } from '@/shared';

function MessageBubble({ message }: { message: Message }) {
  return (
    <div>
      <div className="text-xs text-gray-500">
        {formatDate(message.timestamp)}
      </div>
      <div>{truncateMessage(message.content, 200)}</div>
    </div>
  );
}
```

---

## 测试与质量

### 单元测试
- 工具函数测试
- 验证器测试
- 类型守卫测试

### 测试文件
```
shared/
├── __tests__/
│   ├── utils.test.ts
│   ├── validators.test.ts
│   └── types.test.ts
```

---

## 常见问题 (FAQ)

### Q: 为什么需要共享模块？
A: 主进程与渲染进程可能需要相同的类型定义和工具函数，共享模块避免代码重复。

### Q: 如何确保类型同步？
A: TypeScript 编译时会检查类型一致性，确保主进程与渲染进程使用相同类型。

### Q: 如何扩展工具函数？
A: 在 `src/shared/utils.ts` 中添加新函数，并在 `index.ts` 中导出。

---

## 相关文件清单

- `src/shared/index.ts` - 导出所有模块
- `src/shared/types.ts` - 类型定义
- `src/shared/constants.ts` - 常量定义
- `src/shared/utils.ts` - 工具函数
- `src/shared/validators.ts` - 数据验证器

---

## 下一步行动

1. ⬜ 定义所有全局类型
2. ⬜ 实现常用工具函数
3. ⬜ 添加数据验证器
4. ⬜ 编写单元测试
5. ⬜ 集成到主进程与渲染进程

---

**模块状态**: 🟡 规划中
**负责人**: 待分配
**最后更新**: 2026-04-22 04:03:38
