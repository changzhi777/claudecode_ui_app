# 代码片段库

**版本**：v0.5.0
**更新日期**：2026-04-22
**作者**：BB小子 🤙

---

## 📋 目录

1. [React Hooks](#react-hooks)
2. [Zustand Stores](#zustand-stores)
3. [IPC Handlers](#ipc-handlers)
4. [CLI Process](#cli-process)
5. [Worker Threads](#worker-threads)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## 🪝 React Hooks

### useLocalStorage - 本地存储Hook

```typescript
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}

// 使用
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

---

### useDebounce - 防抖Hook

```typescript
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用
const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

---

### useAsync - 异步操作Hook

```typescript
import { useState, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useAsync<T>(asyncFunction: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    asyncFunction()
      .then((data) => {
        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      mounted = false;
    };
  }, [asyncFunction]);

  return state;
}

// 使用
const { data, loading, error } = useAsync(() => fetchUser());
```

---

## 🗃️ Zustand Stores

### 基础Store模板

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface State {
  items: string[];
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  clearItems: () => void;
}

export const useItemStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (item) => set((state) => ({
        items: state.items.filter((i) => i !== item)
      })),
      clearItems: () => set({ items: [] }),
    }),
    {
      name: 'item-storage',
    }
  )
);
```

---

### 带Selector的Store

```typescript
import { create } from 'zustand';

interface State {
  user: { name: string; email: string } | null;
  setUser: (user: State['user']) => void;
}

export const useUserStore = create<State>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// 使用Selector优化性能
const userName = useUserStore((state) => state.user?.name);
```

---

### 带中间件的Store

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface State {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCountStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
      }),
      {
        name: 'count-storage',
      }
    ),
    { name: 'CountStore' }
  )
);
```

---

## 🔌 IPC Handlers

### 基础IPC Handler

```typescript
import { ipcHandler } from './IPCUtils';

interface Request {
  param1: string;
  param2: number;
}

interface Response {
  result: string;
}

export function initMyHandlers() {
  ipcHandler<Request, Response>('my-channel', async (request) => {
    // 处理请求
    const result = `处理结果: ${request.param1}`;

    return { result };
  });
}
```

---

### 带错误处理的Handler

```typescript
import { ipcHandler } from './IPCUtils';

ipcHandler('risky-operation', async (params) => {
  try {
    const result = await performRiskyOperation(params);
    return { success: true, data: result };
  } catch (error) {
    console.error('操作失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});
```

---

### 带验证的Handler

```typescript
import { ipcHandler } from './IPCUtils';

interface ValidatedRequest {
  email: string;
  age: number;
}

ipcHandler('validated-operation', async (request: ValidatedRequest) => {
  // 验证输入
  if (!request.email.includes('@')) {
    throw new Error('无效的邮箱地址');
  }

  if (request.age < 0 || request.age > 150) {
    throw new Error('无效的年龄');
  }

  // 处理请求
  return { success: true };
});
```

---

## 🖥️ CLI Process

### 启动CLI进程

```typescript
import { spawn } from 'child_process';

export function startCLIProcess(config: CLIConfig) {
  const args = [
    '--print',
    '--input-format', 'stream-json',
    '--output-format', 'stream-json',
    '--verbose'
  ];

  const process = spawn(config.executablePath, args, {
    env: { ...process.env, ...config.env },
    cwd: config.cwd || process.cwd()
  });

  process.stdout.on('data', (data) => {
    console.log('CLI输出:', data.toString());
  });

  process.stderr.on('data', (data) => {
    console.error('CLI错误:', data.toString());
  });

  process.on('exit', (code) => {
    console.log(`CLI进程退出，代码: ${code}`);
  });

  return process;
}
```

---

### 发送消息到CLI

```typescript
function sendToCLI(process: ChildProcess, message: string) {
  if (process.stdin.writable) {
    process.stdin.write(message + '\n');
  } else {
    console.error('CLI stdin不可写');
  }
}
```

---

### 解析CLI输出

```typescript
interface CLIMessage {
  type: 'content' | 'error' | 'status';
  content: string;
  timestamp: number;
}

function parseCLIMessage(output: string): CLIMessage | null {
  try {
    return JSON.parse(output);
  } catch {
    return null;
  }
}

// 使用
process.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    const message = parseCLIMessage(line);
    if (message) {
      handleCLIMessage(message);
    }
  });
});
```

---

## 🧵 Worker Threads

### 创建CLI Worker

```typescript
// cli-worker.ts
import { expose } from 'threads/worker';

expose({
  async sendMessage(message: string): Promise<string> {
    // 处理消息
    return `处理结果: ${message}`;
  },

  async getStatus(): Promise<{ running: boolean }> {
    return { running: true };
  }
});
```

---

### 使用Worker

```typescript
import { spawn, Worker } from 'threads';

async function initWorker() {
  const worker = await spawn(new Worker('./cli-worker.ts'));

  // 发送消息
  const result = await worker.sendMessage('测试消息');

  // 获取状态
  const status = await worker.getStatus();

  // 清理
  await Thread.terminate(worker);
}
```

---

### Worker池管理

```typescript
interface WorkerPool {
  workers: Worker[];
  available: Worker[];
  addWorker: () => Promise<void>;
  getWorker: () => Worker | null;
  releaseWorker: (worker: Worker) => void;
}

export function createWorkerPool(maxSize: number): WorkerPool {
  const workers: Worker[] = [];
  const available: Worker[] = [];

  return {
    workers,
    available,

    async addWorker() {
      if (this.workers.length >= maxSize) return;

      const worker = await spawn(new Worker('./cli-worker.ts'));
      this.workers.push(worker);
      this.available.push(worker);
    },

    getWorker() {
      return this.available.pop() || null;
    },

    releaseWorker(worker) {
      this.available.push(worker);
    }
  };
}
```

---

## ⚠️ Error Handling

### 统一错误处理

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 使用
throw new AppError('文件未找到', 'FILE_NOT_FOUND', 404);
```

---

### 错误边界组件

```typescript
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('错误边界捕获:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1>出错了</h1>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 错误恢复机制

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`第${i + 1}次尝试失败:`, error);

      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 指数退避
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// 使用
const result = await withRetry(() => fetchAPI());
```

---

## 🧪 Testing

### 组件测试模板

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('应该正确渲染', () => {
    render(<MyComponent title="测试" />);
    expect(screen.getByText('测试')).toBeInTheDocument();
  });

  it('应该处理点击事件', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole('button');
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

### Store测试模板

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useMyStore } from './myStore';

describe('MyStore', () => {
  beforeEach(() => {
    // 重置Store状态
    useMyStore.setState({
      items: [],
    });
  });

  it('应该添加项目', () => {
    const store = useMyStore.getState();

    store.addItem('项目1');

    expect(useMyStore.getState().items).toEqual(['项目1']);
  });

  it('应该删除项目', () => {
    const store = useMyStore.getState();

    store.addItem('项目1');
    store.removeItem('项目1');

    expect(useMyStore.getState().items).toEqual([]);
  });
});
```

---

### IPC Handler测试模板

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ipcMain } from 'electron';
import { initMyHandlers } from './my-handlers';

describe('IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该处理请求', async () => {
    const mockCallback = vi.fn().mockResolvedValue({ result: '成功' });

    ipcMain.handle = vi.fn().mockImplementation((channel, callback) => {
      if (channel === 'my-channel') {
        mockCallback();
      }
    });

    initMyHandlers();

    expect(ipcMain.handle).toHaveBeenCalledWith(
      'my-channel',
      expect.any(Function)
    );
  });
});
```

---

### Mock函数模板

```typescript
import { vi } from 'vitest';

// Mock函数
const mockFunction = vi.fn();

// Mock返回值
mockFunction.mockReturnValue('返回值');

// Mock异步返回值
mockFunction.mockResolvedValue('异步返回值');

// Mock实现
mockFunction.mockImplementation((arg) => arg * 2);

// Mock多次调用
mockFunction
  .mockReturnValueOnce('第一次')
  .mockReturnValueOnce('第二次')
  .mockReturnValue('默认值');
```

---

## 🎨 样式片段

### Tailwind响应式布局

```tsx
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
  p-4
">
  {items.map((item) => (
    <div key={item.id} className="bg-white rounded-lg shadow p-4">
      {item.content}
    </div>
  ))}
</div>
```

---

### 暗色模式支持

```tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border border-gray-200 dark:border-gray-700
">
  内容
</div>
```

---

### 动画过渡

```tsx
<div className="
  transition-all
  duration-300
  ease-in-out
  hover:scale-105
  active:scale-95
">
  交互元素
</div>
```

---

## 📝 表单处理

### 受控输入组件

```tsx
import { useState } from 'react';

function FormInput() {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('提交:', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="border rounded px-3 py-2"
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

---

### 表单验证Hook

```typescript
import { useState } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  rules: Partial<Record<keyof T, ValidationRule>>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = (key: keyof T, value: string): string | null => {
    const rule = rules[key];
    if (!rule) return null;

    if (rule.required && !value) {
      return '此字段必填';
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `至少需要${rule.minLength}个字符`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return '格式不正确';
    }

    if (rule.custom && !rule.custom(value)) {
      return '验证失败';
    }

    return null;
  };

  const handleChange = (key: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    const error = validate(key, value);
    setErrors((prev) => ({ ...prev, [key]: error || undefined }));
  };

  return { values, errors, handleChange, setValues };
}
```

---

## 🔄 数据流

### 数据获取模式

```typescript
async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
}

// 使用
const data = await fetchData<User[]>('/api/users');
```

---

### 数据缓存策略

```typescript
class DataCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = 60000) {
    this.ttl = ttl;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
```

---

## 🚀 性能优化

### 虚拟滚动列表

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: string[] }) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Memo优化

```tsx
import { memo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
}: {
  data: ComplexData;
}) {
  // 复杂计算
  return <div>{/* ... */}</div>;
});
```

---

---

**更新日期**：2026-04-22
**下次更新**：发现新代码片段时

Be water, my friend! 🤙
