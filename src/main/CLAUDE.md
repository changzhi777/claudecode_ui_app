# Electron 主进程模块

[根目录](../../CLAUDE.md) > **src/main**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 04:03:38 | 初始化 | 创建主进程模块文档 |

---

## 模块职责

Electron 主进程是应用的核心控制层，负责：

1. **应用生命周期管理**：启动、退出、窗口管理
2. **IPC 服务器**：处理渲染进程的请求
3. **CLI 进程管理**：启动、监控、与 ClaudeCode CLI 通信
4. **文件系统访问**：安全的文件读写操作
5. **系统级集成**：菜单、托盘、通知、快捷键

---

## 入口与启动

### 主入口文件
**文件路径**: `src/main/index.ts`

```typescript
// 基础结构（待实现）
import { app, BrowserWindow } from 'electron';
import { createIPCServers } from './ipc';
import { createMainWindow } from './windows';

app.whenReady().then(() => {
  createMainWindow();
  createIPCServers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### 启动流程
1. Electron 初始化
2. 创建主窗口
3. 注册 IPC 处理器
4. 启动 CLI 进程（可选延迟启动）
5. 加载应用配置

---

## 对外接口

### IPC 频道（由主进程处理）

| 频道名 | 方向 | 用途 |
|--------|------|------|
| `cli:start` | Renderer → Main | 启动 CLI 进程 |
| `cli:stop` | Renderer → Main | 停止 CLI 进程 |
| `cli:send` | Renderer → Main | 发送消息到 CLI |
| `cli:message` | Main → Renderer | 接收 CLI 消息 |
| `file:read` | Renderer → Main | 读取文件内容 |
| `file:write` | Renderer → Main | 写入文件 |
| `file:watch` | Renderer → Main | 监听文件变化 |
| `app:config` | Renderer → Main | 获取应用配置 |
| `window:toggle` | Renderer → Main | 窗口显示/隐藏 |

### 主进程 API 暴露

```typescript
// 窗口管理
export function createMainWindow(): BrowserWindow;
export function getMainWindow(): BrowserWindow | undefined;
export function toggleWindow(): void;

// CLI 进程管理
export function startCLIProcess(config: CLIConfig): ChildProcess;
export function stopCLIProcess(): void;
export function sendToCLI(message: string): void;

// 文件操作
export async function readFile(path: string): Promise<string>;
export async function writeFile(path: string, content: string): Promise<void>;
export function watchFile(path: string, callback: (event: string, filename?: string) => void): void;
```

---

## 关键依赖与配置

### 核心依赖
- `electron`: 桌面框架
- `electron-vite`: 构建工具
- `chokidar`: 文件监听

### 配置文件
**electron.vite.config.ts**:
```typescript
export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/preload/index.ts')
        }
      }
    }
  }
});
```

---

## 目录结构

```
src/main/
├── index.ts              # 主入口
├── ipc/                  # IPC 处理器
│   ├── index.ts          # IPC 注册
│   ├── cli-handlers.ts   # CLI 相关 IPC
│   ├── file-handlers.ts  # 文件操作 IPC
│   └── app-handlers.ts   # 应用级 IPC
├── cli/                  # CLI 进程管理
│   ├── process.ts        # 进程启动/停止
│   ├── stdio.ts          # stdio 通信
│   └── parser.ts         # 消息解析
├── windows/              # 窗口管理
│   ├── main.ts           # 主窗口
│   └── config.ts         # 窗口配置
├── menu/                 # 菜单栏
│   └── template.ts       # 菜单模板
├── tray/                 # 系统托盘
│   └── icon.ts           # 托盘图标
└── config/               # 应用配置
    └── default.ts        # 默认配置
```

---

## 数据模型

### CLIConfig
```typescript
interface CLIConfig {
  executablePath: string;  // CLI 可执行文件路径
  args: string[];          // 启动参数
  env?: Record<string, string>;  // 环境变量
  cwd?: string;            // 工作目录
}
```

### WindowConfig
```typescript
interface WindowConfig {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  frame?: boolean;
  title?: string;
}
```

---

## 测试与质量

### 单元测试
- IPC 处理器逻辑测试
- CLI 进程管理测试
- 文件操作测试

### 集成测试
- 主进程与渲染进程通信测试
- CLI 进程启动与消息流测试

### 测试命令
```bash
# 主进程测试
pnpm test:main

# IPC 通信测试
pnpm test:ipc
```

---

## 常见问题 (FAQ)

### Q: 如何处理 CLI 进程崩溃？
A: 监听 `exit` 和 `error` 事件，自动重启并通知渲染进程。

### Q: 如何防止主进程阻塞？
A: 将耗时操作（如大文件读写）放入 Worker 线程或使用异步 API。

### Q: 如何安全地暴露文件系统访问？
A: 在 IPC 处理器中验证路径，限制在项目目录内，使用 `fs.promises` 异步 API。

---

## 相关文件清单

- `src/main/index.ts` - 主入口
- `src/main/ipc/index.ts` - IPC 注册中心
- `src/main/cli/process.ts` - CLI 进程管理
- `src/main/windows/main.ts` - 主窗口创建

---

## 下一步行动

1. ⬜ 实现 `src/main/index.ts` 基础结构
2. ⬜ 创建 IPC 注册中心
3. ⬜ 实现 CLI 进程管理器
4. ⬜ 配置主窗口参数
5. ⬜ 添加进程崩溃恢复机制

---

**模块状态**: 🟡 规划中
**负责人**: 待分配
**最后更新**: 2026-04-22 04:03:38
