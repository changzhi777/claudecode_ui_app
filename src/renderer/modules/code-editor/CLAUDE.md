# 代码编辑器模块

[根目录](../../../CLAUDE.md) > [src/renderer](../../) > **modules/code-editor**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 04:03:38 | 初始化 | 创建代码编辑器模块文档 |

---

## 模块职责

集成 Monaco Editor，提供专业级代码编辑体验：

1. **编辑器实例**：Monaco Editor 初始化与配置
2. **文件管理**：打开、保存、关闭文件
3. **多标签页**：支持同时编辑多个文件
4. **语言支持**：自动识别文件类型并配置语法高亮
5. **代码操作**：格式化、折叠、查找替换
6. **主题同步**：跟随应用主题切换

---

## 入口与启动

### 主组件
**文件路径**: `src/renderer/modules/code-editor/index.tsx`

```typescript
// 组件结构（待实现）
import { Editor } from '@monaco-editor/react';

export function CodeEditor() {
  return (
    <div className="h-full flex flex-col">
      <TabBar />
      <Editor
        height="100%"
        defaultLanguage="typescript"
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
        }}
      />
    </div>
  );
}
```

### 子组件
- `TabBar.tsx` - 文件标签页
- `EditorWrapper.tsx` - Monaco Editor 封装
- `Breadcrumbs.tsx` - 面包屑导航
- `StatusBar.tsx` - 状态栏（行号、列号、编码）

---

## 对外接口

### Props 接口

```typescript
interface CodeEditorProps {
  files: EditorFile[];               // 打开的文件列表
  activeFileId: string;              // 当前激活文件
  onFileChange: (fileId: string, content: string) => void;
  onFileClose: (fileId: string) => void;
  onFileSave: (fileId: string) => void;
}

interface EditorFile {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  isDirty?: boolean;                 // 是否有未保存更改
}
```

### 编辑器配置

```typescript
interface MonacoOptions {
  theme: 'vs-light' | 'vs-dark';
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: { enabled: boolean };
  autoClosingBrackets: 'always' | 'never';
  formatOnPaste: boolean;
  formatOnType: boolean;
}
```

---

## 关键依赖与配置

### 核心依赖
- `@monaco-editor/react`: Monaco Editor React 封装
- `monaco-editor`: 编辑器核心

### 初始化配置
**src/renderer/modules/code-editor/monaco-config.ts**:
```typescript
import * as monaco from 'monaco-editor';

export function configureMonaco() {
  // 自动识别语言
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // 自定义主题
  monaco.editor.defineTheme('custom-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e1e1e',
    },
  });
}
```

---

## 数据模型

### EditorState 类型
```typescript
interface EditorState {
  files: EditorFile[];
  activeFileId: string | null;
  cursorPosition: { lineNumber: number; column: number };
  scrollPosition: { scrollLeft: number; scrollTop: number };
}

interface EditorHistory {
  undo: string[];    // 撤销栈
  redo: string[];    // 重做栈
}
```

---

## UI/UX 设计要点

### 布局结构
```
┌─────────────────────────────────────┐
│ Tab1 | Tab2 | Tab3 | +     × │       │ <- TabBar
├─────────────────────────────────────┤
│ path/to/file.ts                    │ <- Breadcrumbs
├─────────────────────────────────────┤
│                                     │
│  1  import { useState } from 'r... │
│  2                                  │
│  3  function App() {                │ <- Monaco Editor
│  4    return <div>Hello</div>;      │
│  5  }                               │
│                                     │
├─────────────────────────────────────┤
│ Ln 3, Col 12  UTF-8  TypeScript    │ <- StatusBar
└─────────────────────────────────────┘
```

### 交互规范
1. **Ctrl+S / Cmd+S** 保存文件
2. **Ctrl+W / Cmd+W** 关闭当前标签
3. **Ctrl+Tab / Ctrl+Shift+Tab** 切换标签
4. **Ctrl+/** 切换注释
5. **Ctrl+D** 选中下一个相同单词

### 快捷键配置
```typescript
const keybindings = [
  { key: 'Ctrl+S', action: 'save' },
  { key: 'Cmd+S', action: 'save' },
  { key: 'Ctrl+W', action: 'closeTab' },
  { key: 'Cmd+W', action: 'closeTab' },
];
```

---

## 测试与质量

### 单元测试
- 编辑器初始化测试
- 文件切换测试
- 内容变更测试

### 集成测试
- 与文件系统交互测试
- 保存操作测试

### 测试文件
```
code-editor/
├── __tests__/
│   ├── CodeEditor.test.tsx
│   ├── TabBar.test.tsx
│   └── MonacoWrapper.test.tsx
```

---

## 常见问题 (FAQ)

### Q: 如何处理大文件性能问题？
A: 使用 Monaco 的 `deferRendering` 延迟渲染，或提示用户文件过大建议分块。

### Q: 如何同步滚动位置？
A: 监听 `onScroll` 事件，将滚动位置保存到 Zustand store。

### Q: 如何支持代码补全？
A: 配置 Monaco 的 IntelliSense，或通过 LSP (Language Server Protocol) 连接后端服务。

---

## 相关文件清单

- `src/renderer/modules/code-editor/index.tsx` - 主组件
- `src/renderer/modules/code-editor/TabBar.tsx` - 标签页
- `src/renderer/modules/code-editor/monaco-config.ts` - Monaco 配置
- `src/renderer/modules/code-editor/useMonaco.ts` - 自定义 Hook

---

## 下一步行动

1. ⬜ 安装 `@monaco-editor/react`
2. ⬜ 创建基础组件结构
3. ⬜ 实现标签页管理
4. ⬜ 配置快捷键
5. ⬜ 集成文件保存逻辑

---

**模块状态**: 🟡 规划中
**负责人**: 待分配
**最后更新**: 2026-04-22 04:03:38
