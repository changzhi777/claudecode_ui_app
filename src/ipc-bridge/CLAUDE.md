# IPC 通信桥接模块

[根目录](../../CLAUDE.md) > **src/ipc-bridge**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 04:03:38 | 初始化 | 创建 IPC 通信模块文档 |

---

## 模块职责

搭建 Electron 主进程与渲染进程的通信桥梁：

1. **频道定义**：声明所有 IPC 频道名称与类型
2. **类型安全**：TypeScript 类型定义与验证
3. **错误处理**：统一的错误捕获与处理机制
4. **超时控制**：防止 IPC 调用阻塞
5. **日志记录**：记录所有 IPC 通信（调试用）

---

## 入口与启动

### 文件结构
```
src/ipc-bridge/
├── channels.ts          # 频道定义
├── types.ts             # TypeScript 类型
├── main-handlers.ts     # 主进程处理器
├── renderer-invokers.ts # 渲染进程调用器
└── utils.ts             # 工具函数
```

### 频道定义
**src/ipc-bridge/channels.ts**:
```typescript
// IPC 频道命名空间
export const IPC_CHANNELS = {
  // CLI 进程管理
  CLI_START: 'cli:start',
  CLI_STOP: 'cli:stop',
  CLI_SEND: 'cli:send',
  CLI_MESSAGE: 'cli:message',    // 主进程 → 渲染进程
  CLI_ERROR: 'cli:error',

  // 文件操作
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_WATCH: 'file:watch',
  FILE_UNWATCH: 'file:unwatch',

  // 应用配置
  APP_GET_CONFIG: 'app:get-config',
  APP_SET_CONFIG: 'app:set-config',

  // 窗口控制
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
} as const;
```

---

## 对外接口

### 主进程处理器
**src/ipc-bridge/main-handlers.ts**:
```typescript
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from './channels';

export function registerIPCHandlers() {
  // CLI 进程启动
  ipcMain.handle(IPC_CHANNELS.CLI_START, async (event, config) => {
    try {
      const process = startCLIProcess(config);
      return { success: true, pid: process.pid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 文件读取
  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (event, path) => {
    try {
      const content = await readFile(path);
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ... 更多处理器
}
```

### 渲染进程调用器
**src/ipc-bridge/renderer-invokers.ts**:
```typescript
import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './channels';

export const ipcInvoker = {
  // CLI 操作
  startCLI: (config: CLIConfig) =>
    ipcRenderer.invoke(IPC_CHANNELS.CLI_START, config),

  stopCLI: () =>
    ipcRenderer.invoke(IPC_CHANNELS.CLI_STOP),

  sendToCLI: (message: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.CLI_SEND, message),

  // 文件操作
  readFile: (path: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, path),

  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, path, content),

  // 监听事件
  onCLIMessage: (callback: (message: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.CLI_MESSAGE, (_, message) => callback(message));
  },
};
```

---

## 关键依赖与配置

### 核心依赖
- `electron`: IPC 通信
- `zod`: 类型验证（可选）

### 类型定义
**src/ipc-bridge/types.ts**:
```typescript
// 请求/响应类型
interface IPCRequest<T = any> {
  id: string;
  channel: string;
  payload: T;
}

interface IPCResponse<T = any> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
}

// CLI 相关类型
interface CLIConfig {
  executablePath: string;
  args: string[];
  env?: Record<string, string>;
  cwd?: string;
}

// 文件操作类型
interface FileReadRequest {
  path: string;
  encoding?: string;
}

interface FileWriteRequest {
  path: string;
  content: string;
  encoding?: string;
}
```

---

## 数据流设计

### 请求流程
```
Renderer Process          Main Process          CLI Process
     |                        |                      |
     |  invoke('cli:start')   |                      |
     |--------------------->   |                      |
     |                        |  spawn()             |
     |                        |------------------->  |
     |                        |                      |
     |  { success, pid }       |                      |
     |<---------------------   |                      |
     |                        |                      |
```

### 事件推送流程
```
CLI Process               Main Process          Renderer Process
     |                        |                      |
     |  stdout data           |                      |
     |--------------------->   |                      |
     |                        |  'cli:message'       |
     |                        |------------------->  |
     |                        |                      |
     |                        |                      |  update UI
```

---

## 错误处理

### 统一错误格式
```typescript
interface IPCError {
  code: string;
  message: string;
  details?: any;
}

// 错误码枚举
enum IPCErrorCode {
  CLI_NOT_FOUND = 'CLI_NOT_FOUND',
  CLI_START_FAILED = 'CLI_START_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TIMEOUT = 'TIMEOUT',
}
```

### 错误处理示例
```typescript
// 主进程
ipcMain.handle(IPC_CHANNELS.FILE_READ, async (event, path) => {
  try {
    const content = await fs.promises.readFile(path, 'utf-8');
    return { success: true, content };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { success: false, error: { code: 'FILE_NOT_FOUND', message: 'File not found' } };
    }
    return { success: false, error: { code: 'UNKNOWN', message: error.message } };
  }
});

// 渲染进程
const result = await ipcInvoker.readFile('/path/to/file');
if (!result.success) {
  console.error(`[${result.error.code}] ${result.error.message}`);
}
```

---

## 测试与质量

### 单元测试
- IPC 处理器逻辑测试
- 类型验证测试
- 错误处理测试

### 集成测试
- 主进程与渲染进程通信测试
- 超时处理测试

### 测试文件
```
ipc-bridge/
├── __tests__/
│   ├── channels.test.ts
│   ├── main-handlers.test.ts
│   └── renderer-invokers.test.ts
```

---

## 常见问题 (FAQ)

### Q: 如何防止 IPC 调用阻塞？
A: 使用 `ipcRenderer.invoke` 异步调用，设置超时机制（如 30 秒）。

### Q: 如何处理大量数据传输？
A: 将大数据分块传输，或使用共享内存（SharedArrayBuffer）。

### Q: 如何保证类型安全？
A: 使用 TypeScript 严格模式，可选集成 `zod` 进行运行时类型验证。

---

## 相关文件清单

- `src/ipc-bridge/channels.ts` - 频道定义
- `src/ipc-bridge/types.ts` - 类型定义
- `src/ipc-bridge/main-handlers.ts` - 主进程处理器
- `src/ipc-bridge/renderer-invokers.ts` - 渲染进程调用器

---

## 下一步行动

1. ⬜ 定义所有 IPC 频道
2. ⬜ 实现主进程处理器
3. ⬜ 实现渲染进程调用器
4. ⬜ 添加错误处理与超时机制
5. ⬜ 编写集成测试

---

**模块状态**: 🟡 规划中
**负责人**: 待分配
**最后更新**: 2026-04-22 04:03:38
