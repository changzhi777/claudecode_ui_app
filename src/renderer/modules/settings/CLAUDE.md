# 设置面板模块

[根目录](../../../CLAUDE.md) > [src/renderer](../../) > **modules/settings**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 06:50:00 | 初始化 | 创建设置面板模块，实现Claude CLI配置读取 |

---

## 模块职责

提供 Claude CLI 配置的可视化展示和管理：

1. **配置读取**：从 `~/.claude/settings.json` 读取配置
2. **API Key展示**：脱敏显示 API Token
3. **模型信息**：显示当前使用的模型
4. **权限配置**：展示允许的工具列表
5. **插件管理**：显示启用的插件
6. **环境变量**：展示相关环境变量

---

## 入口与启动

### 主组件
**文件路径**: `src/renderer/modules/settings/SettingsPanel.tsx`

```typescript
import { SettingsPanel } from '@renderer/modules/settings';

function App() {
  return (
    <div>
      <SettingsPanel />
    </div>
  );
}
```

### 使用示例

```typescript
// 在应用中使用
import { SettingsPanel } from '@renderer/modules/settings';

export function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <SettingsPanel />
    </div>
  );
}
```

---

## 对外接口

### IPC 频道

| 频道名 | 方向 | 返回类型 | 说明 |
|--------|------|---------|------|
| `config:readClaude` | Renderer → Main | `ClaudeConfig` | 读取 Claude 配置 |
| `config:readModels` | Renderer → Main | `ModelConfig` | 读取模型配置 |
| `config:readAll` | Renderer → Main | `{ claude, models }` | 读取完整配置 |
| `config:getCurrentModel` | Renderer → Main | `string` | 获取当前模型 |
| `config:getApiKey` | Renderer → Main | `{ key, masked }` | 获取 API Key（脱敏） |

### 配置数据结构

```typescript
interface ClaudeConfig {
  apiToken?: string;           // API Token
  baseUrl?: string;            // Base URL
  model?: string;              // 默认模型
  permissions?: {
    allow: string[];           // 允许的工具
    deny: string[];            // 禁止的工具
  };
  enabledPlugins?: Record<string, boolean>;  // 启用的插件
  outputStyle?: string;        // 输出样式
  environment?: Record<string, string>;      // 环境变量
}

interface ModelConfig {
  models?: Array<{
    pattern: string;           // 模型匹配模式
    display_name: string;      // 显示名称
    context_limit: number;     // 上下文限制
  }>;
  context_modifiers?: Array<{
    pattern: string;           // 修饰符模式
    display_suffix: string;    // 显示后缀
    context_limit: number;     // 上下文限制
  }>;
}
```

---

## 关键依赖与配置

### 核心依赖
- `lucide-react`: 图标库
- `toml`: TOML 配置文件解析（主进程）

### 配置文件路径

**主进程** (`src/main/ipc/config-handlers.ts`):
```typescript
const CLAUDE_CONFIG_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const CLAUDE_MODELS_PATH = path.join(os.homedir(), '.claude', 'ccline', 'models.toml');
```

### IPC 处理器注册

**主进程** (`src/main/index.ts`):
```typescript
import { ConfigHandlers } from './ipc/config-handlers';

let configHandlersInstance: ConfigHandlers | undefined;

app.whenReady().then(() => {
  // 初始化配置 IPC handlers
  configHandlersInstance = new ConfigHandlers();
});

app.on('before-quit', async () => {
  if (configHandlersInstance) {
    configHandlersInstance.dispose();
  }
});
```

---

## UI/UX 设计要点

### 视觉层次

```
┌─────────────────────────────────────┐
│ Claude CLI 配置           [刷新]    │
├─────────────────────────────────────┤
│ 🔑 API Key                          │
│ ┌─────────────────────────────────┐ │
│ │ a7678d18*******************7f4e  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🌐 Base URL                         │
│ ┌─────────────────────────────────┐ │
│ │ https://open.bigmodel.cn/api... │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🎨 当前模型                         │
│ ┌─────────────────────────────────┐ │
│ │ claude-sonnet-4-20250514        │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🛡️ 允许的工具 (47)                  │
│ ┌─────────────────────────────────┐ │
│ │ Bash  Edit  Read  Write ...    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 交互规范

1. **自动加载**：组件挂载时自动加载配置
2. **手动刷新**：点击"刷新"按钮重新加载配置
3. **加载状态**：显示骨架屏动画
4. **错误处理**：配置加载失败时显示友好提示

### API Key 脱敏规则

```typescript
// 原始 Key: a7678d1859db45a081a6caf801359436
// 脱敏后:   a7678d18***************9436
const masked = `${key.substring(0, 8)}${'*'.repeat(key.length - 12)}${key.substring(key.length - 4)}`;
```

---

## 数据流

```
SettingsPanel 挂载
    ↓
调用 loadConfig()
    ↓
├─→ invoke('config:readAll')    → ConfigHandlers → settings.json
├─→ invoke('config:getApiKey')  → ConfigHandlers → 脱敏处理
└─→ invoke('config:getCurrentModel') → ConfigHandlers → 环境变量
    ↓
更新组件状态
    ↓
渲染配置信息
```

---

## 测试与质量

### 单元测试
- 配置读取测试
- API Key 脱敏测试
- 错误处理测试

### 集成测试
- IPC 通信测试
- 配置文件解析测试

### 测试文件
```
settings/
├── __tests__/
│   ├── SettingsPanel.test.tsx
│   └── config-handlers.test.ts
```

---

## 常见问题 (FAQ)

### Q: 配置文件不存在会怎样？
A: 返回空对象，UI 显示"未配置"。

### Q: 如何修改配置？
A: 当前版本只支持读取，修改功能待实现。

### Q: API Key 安全吗？
A: 完全脱敏显示，只暴露前8位和后4位。

### Q: 支持热重载吗？
A: 支持手动刷新，点击"刷新"按钮即可重新加载配置。

---

## 相关文件清单

- `src/main/ipc/config-handlers.ts` - 配置读取 IPC 处理器
- `src/renderer/modules/settings/SettingsPanel.tsx` - 设置面板组件
- `src/renderer/modules/settings/index.tsx` - 模块导出
- `~/.claude/settings.json` - Claude CLI 配置文件
- `~/.claude/ccline/models.toml` - 模型配置文件

---

## 下一步行动

1. ✅ 实现配置读取功能
2. ⬜ 添加配置修改功能
3. ⬜ 实现配置验证
4. ⬜ 添加配置导入/导出
5. ⬜ 支持多个配置文件切换

---

**模块状态**: ✅ 核心功能完成
**最后更新**: 2026-04-22 06:50:00
