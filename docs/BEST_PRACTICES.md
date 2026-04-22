# 最佳实践指南

**版本**：v0.5.0
**更新日期**：2026-04-22
**作者**：BB小子 🤙

---

## 📋 目录

1. [代码组织](#代码组织)
2. [性能优化](#性能优化)
3. [错误处理](#错误处理)
4. [测试策略](#测试策略)
5. [安全实践](#安全实践)
6. [文档规范](#文档规范)
7. [Git工作流](#git工作流)

---

## 📁 代码组织

### 文件命名约定

```
组件文件：      PascalCase       MyComponent.tsx
工具文件：      camelCase        formatUtils.ts
类型文件：      camelCase        types.ts
常量文件：      camelCase        constants.ts
Hook文件：      camelCase        useHook.ts
Store文件：    camelCase        useStore.ts
测试文件：     *.test.ts        MyComponent.test.ts
```

### 目录结构原则

```typescript
// ✅ 好的做法 - 按功能分组
src/
  modules/
    chat-ui/
      components/
      hooks/
      utils/
      index.tsx
    code-editor/
      components/
      hooks/
      utils/
      index.tsx

// ❌ 坏的做法 - 按类型分组
src/
  components/
    ChatUI.tsx
    CodeEditor.tsx
  hooks/
    useChat.ts
    useEditor.ts
```

### 导入顺序

```typescript
// 1. 外部库
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// 2. 内部模块
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';

// 3. 相对路径
import { formatMessage } from './utils/format';
import { LocalStyles } from './styles.css';

// 4. 类型导入
import type { Message } from './types';
```

---

## ⚡ 性能优化

### React性能优化

#### 1. 使用memo避免不必要的重渲染

```typescript
// ✅ 使用memo
export const MessageItem = memo(function MessageItem({
  message,
}: MessageItemProps) {
  return <div>{message.content}</div>;
});

// ❌ 不使用memo
export function MessageItem({ message }: MessageItemProps) {
  return <div>{message.content}</div>;
}
```

#### 2. useCallback优化回调函数

```typescript
// ✅ 使用useCallback
const handleClick = useCallback((id: string) => {
  deleteMessage(id);
}, [deleteMessage]);

// ❌ 不使用useCallback
const handleClick = (id: string) => {
  deleteMessage(id);
};
```

#### 3. useMemo优化计算结果

```typescript
// ✅ 使用useMemo
const sortedMessages = useMemo(() => {
  return messages.sort((a, b) => b.timestamp - a.timestamp);
}, [messages]);

// ❌ 不使用useMemo
const sortedMessages = messages.sort((a, b) => b.timestamp - a.timestamp);
```

### 状态管理优化

#### 1. 使用Selector减少重渲染

```typescript
// ✅ 只订阅需要的数据
const messages = useChatStore((state) => state.messages);

// ❌ 订阅整个store
const { messages, loading, error } = useChatStore();
```

#### 2. 拆分Store避免全局更新

```typescript
// ✅ 按功能拆分Store
const useChatStore = create<ChatState>();
const useEditorStore = create<EditorState>();
const useFileStore = create<FileState>();

// ❌ 单一大Store
const useAppStore = create<AppState>(); // 包含所有状态
```

### 网络请求优化

#### 1. 使用防抖减少请求

```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return <input onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

#### 2. 使用缓存避免重复请求

```typescript
class APICache {
  private cache = new Map<string, { data: any; timestamp: number }>();

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

---

## ⚠️ 错误处理

### 统一错误处理模式

```typescript
// 1. 定义错误类型
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

// 2. 使用错误边界
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('错误边界捕获:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// 3. 包装异步操作
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error('操作失败:', error);
    onError?.(error as Error);
    return null;
  }
}
```

### 错误恢复策略

```typescript
// 1. 指数退避重试
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  throw lastError!;
}

// 2. 降级策略
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch {
    console.warn('主策略失败，使用降级策略');
    return await fallback();
  }
}
```

---

## 🧪 测试策略

### 测试金字塔

```
        /\
       /  \        E2E测试 (少量)
      /____\
     /      \      集成测试 (适量)
    /________\
   /          \    单元测试 (大量)
  /____________\
```

### 单元测试最佳实践

```typescript
// ✅ 好的测试 - 清晰的Given-When-Then结构
describe('MessageStore', () => {
  it('应该添加消息到store', () => {
    // Given
    const store = useMessageStore.getState();
    const message = createMockMessage();

    // When
    store.addMessage(message);

    // Then
    expect(useMessageStore.getState().messages).toContain(message);
  });
});

// ❌ 坏的测试 - 复杂难以理解
it('测试消息', () => {
  const store = useMessageStore.getState();
  const msg = { id: '1', content: 'test', timestamp: Date.now() };
  store.addMessage(msg);
  expect(useMessageStore.getState().messages.length).toBe(1);
});
```

### 测试覆盖率目标

| 类型 | 覆盖率目标 | 说明 |
|------|-----------|------|
| 核心业务逻辑 | 90%+ | CLI通信、状态管理 |
| UI组件 | 80%+ | 关键交互路径 |
| 工具函数 | 95%+ | 纯函数，易测试 |
| 整体项目 | 80%+ | 生产就绪基准 |

### Mock使用原则

```typescript
// ✅ 好的做法 - Mock外部依赖
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

// ❌ 坏的做法 - Mock被测代码
vi.mock('./myModule', () => ({
  myFunction: vi.fn(), // 不要mock你要测试的代码
}));
```

---

## 🔒 安全实践

### 输入验证

```typescript
// 1. 类型检查
function validateInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('输入必须是字符串');
  }

  if (input.length > 1000) {
    throw new Error('输入过长');
  }

  return input.trim();
}

// 2. 路径验证
function validatePath(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  const projectRoot = process.cwd();

  return normalized.startsWith(projectRoot);
}

// 3. SQL注入防护（使用参数化查询）
const result = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### 敏感数据处理

```typescript
// ✅ 好的做法 - 使用环境变量
const apiKey = process.env.ANTHROPIC_AUTH_TOKEN;

// ❌ 坏的做法 - 硬编码
const apiKey = 'sk-ant-api123-xxx';

// ✅ 好的做法 - 掩码显示
function maskApiKey(key: string): string {
  return key.slice(0, 8) + '****' + key.slice(-4);
}

// ✅ 好的做法 - 使用加密存储
const encrypted = CryptoJS.AES.encrypt(apiKey, encryptionKey);
```

### IPC通信安全

```typescript
// 1. 白名单机制
const ALLOWED_CHANNELS = [
  'cli:start',
  'cli:stop',
  'file:read',
  'file:write',
];

function isAllowedChannel(channel: string): boolean {
  return ALLOWED_CHANNELS.includes(channel);
}

// 2. 输入验证
ipcHandler('file:write', async (filePath, content) => {
  if (!validatePath(filePath)) {
    throw new Error('非法路径');
  }

  if (typeof content !== 'string') {
    throw new Error('内容必须是字符串');
  }

  await fs.writeFile(filePath, content);
});
```

---

## 📚 文档规范

### 代码注释原则

```typescript
// ✅ 好的注释 - 解释"为什么"
// 使用指数退避策略，避免在服务压力大时频繁重试
const delay = Math.pow(2, attempt) * 1000;

// ❌ 坏的注释 - 解释"是什么"（代码本身已经说明）
// 设置延迟为2的attempt次方
const delay = Math.pow(2, attempt) * 1000;

// ✅ 好的注释 - 复杂逻辑说明
/**
 * 解析CLI输出的流式JSON数据
 *
 * CLI输出格式：
 * - 每行一个JSON对象
 * - 空行表示消息结束
 * - 以"data:"开头的行是实际内容
 */
function parseCLIMessage(output: string): CLIMessage | null {
  // ...
}

// ❌ 坏的注释 - 无意义的注释
// 获取消息
const message = getMessage();
```

### JSDoc规范

```typescript
/**
 * 发送消息到CLI进程
 *
 * @param message - 要发送的消息内容
 * @param options - 可选配置
 * @param options.timeout - 超时时间（毫秒），默认30秒
 * @param options.retry - 重试次数，默认3次
 * @returns Promise<CLIMessage> CLI响应消息
 * @throws {Error} 当CLI进程未启动时抛出错误
 *
 * @example
 * ```typescript
 * const response = await sendToCLI('测试消息', {
 *   timeout: 5000,
 *   retry: 2
 * });
 * ```
 */
async function sendToCLI(
  message: string,
  options?: { timeout?: number; retry?: number }
): Promise<CLIMessage> {
  // 实现...
}
```

### README规范

每个模块/组件目录应包含：

```markdown
# 模块名称

简短描述（1-2句话）

## 功能
- 功能1
- 功能2

## 使用示例
\`\`\`typescript
// 代码示例
\`\`\`

## API
### 函数名
参数说明、返回值说明

## 注意事项
- 注意事项1
- 注意事项2
```

---

## 🌿 Git工作流

### Commit消息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type):**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或工具变动

**示例：**

```bash
git commit -m "feat(chat): 添加消息重发功能"

git commit -m "fix(cli): 修复进程内存泄漏问题"

git commit -m "docs: 更新API文档"
```

### 分支策略

```bash
main          # 主分支，生产环境代码
  ├─ develop  # 开发分支
  ├─ feature/* # 功能分支
  ├─ fix/*    # 修复分支
  └─ release/* # 发布分支
```

### Code Review清单

- [ ] 代码符合项目规范
- [ ] 测试覆盖充分
- [ ] 没有引入新的警告
- [ ] 文档已更新
- [ ] Commit消息清晰
- [ ] 没有敏感信息泄露
- [ ] 性能影响可接受
- [ ] 向后兼容性考虑

---

## 🎯 代码审查要点

### 正确性

```typescript
// ✅ 边界条件处理
function getItem<T>(items: T[], index: number): T | undefined {
  if (index < 0 || index >= items.length) {
    return undefined;
  }
  return items[index];
}

// ✅ 空值检查
function processMessage(message: string | null): string {
  if (!message) {
    return '';
  }
  return message.trim();
}
```

### 可读性

```typescript
// ✅ 有意义的命名
const getUserById = (id: string) => { /* ... */ };

// ❌ 模糊的命名
const get = (x: string) => { /* ... */ };

// ✅ 清晰的变量名
const maxRetryAttempts = 3;

// ❌ 魔法数字
const max = 3;
```

### 可维护性

```typescript
// ✅ 提取常量
const DEFAULT_TIMEOUT = 30000;
const MAX_RETRY_ATTEMPTS = 3;

setTimeout(() => {
  /* ... */
}, DEFAULT_TIMEOUT);

// ❌ 硬编码
setTimeout(() => {
  /* ... */
}, 30000);
```

---

## 🔄 重构建议

### 识别代码异味

#### 1. 重复代码（DRY原则）

```typescript
// ❌ 重复代码
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateUserEmail(user: User): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(user.email);
}

// ✅ 提取公共逻辑
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateUserEmail(user: User): boolean {
  return validateEmail(user.email);
}
```

#### 2. 过长函数

```typescript
// ❌ 过长函数（50行+）
function processCLIMessage(output: string): CLIMessage | null {
  // 50行逻辑...
}

// ✅ 拆分函数
function parseOutput(output: string): string[] {
  // 解析逻辑
}

function validateMessage(data: string): boolean {
  // 验证逻辑
}

function processCLIMessage(output: string): CLIMessage | null {
  const lines = parseOutput(output);
  if (!validateMessage(lines[0])) return null;
  // 组合逻辑
}
```

#### 3. 过早优化

```typescript
// ❌ 过早优化
function calculateHash(data: string): string {
  // 复杂的缓存逻辑，但数据量很小
}

// ✅ 先保持简单
function calculateHash(data: string): string {
  return simpleHash(data);
}

// 等性能问题出现再优化
```

---

## 📊 性能监控

### 关键指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 启动时间 | < 2s | performance.now() |
| 首次渲染 | < 1s | React DevTools |
| 响应时间 | < 100ms | Chrome DevTools |
| 内存占用 | < 400MB | process.memoryUsage() |
| CPU使用 | < 50% | process.cpuUsage() |

### 性能分析工具

```typescript
// 1. 性能标记
performance.mark('process-start');
// ... 执行操作
performance.mark('process-end');
performance.measure('process', 'process-start', 'process-end');

const measure = performance.getEntriesByName('process')[0];
console.log(`操作耗时: ${measure.duration}ms`);

// 2. 性能监控
if (measure.duration > 100) {
  console.warn('操作耗时过长:', measure.duration);
}
```

---

## 🎨 UI/UX最佳实践

### 响应式设计

```tsx
// ✅ 使用Tailwind响应式类
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>

// ❌ 硬编码尺寸
<div style={{ display: 'grid', gridTemplateColumns: '300px 300px 300px' }}>
```

### 无障碍访问

```tsx
// ✅ 语义化HTML + ARIA属性
<button
  onClick={handleClick}
  aria-label="关闭对话框"
  aria-pressed={isPressed}
>
  <CloseIcon aria-hidden="true" />
</button>

// ❌ 缺少无障碍属性
<button onClick={handleClick}>
  <CloseIcon />
</button>
```

### 加载状态

```tsx
// ✅ 显示加载状态
{loading ? (
  <Spinner aria-label="加载中..." />
) : (
  <Content data={data} />
)}

// ✅ 错误状态
{error ? (
  <ErrorMessage message={error.message} />
) : (
  <Content data={data} />
)}
```

---

## 🔄 持续改进

### 定期审查

- 每周代码审查会议
- 每月性能评估
- 每季度技术债务清理

### 知识分享

- 编写技术博客
- 举行技术分享会
- 更新项目文档

### 工具优化

- 自动化重复任务
- 改进开发工具链
- 优化CI/CD流程

---

**更新日期**：2026-04-22
**下次审查**：每月更新

Be water, my friend! 🤙
