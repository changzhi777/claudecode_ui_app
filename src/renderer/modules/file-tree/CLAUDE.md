# 文件树模块

[根目录](../../../CLAUDE.md) > [src/renderer](../../) > **modules/file-tree**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 04:03:38 | 初始化 | 创建文件树模块文档 |

---

## 模块职责

提供 VS Code 风格的文件树组件：

1. **目录展示**：递归渲染文件与文件夹
2. **交互操作**：点击展开/折叠、右键菜单
3. **图标映射**：根据文件类型显示对应图标
4. **搜索过滤**：快速定位文件
5. **拖拽支持**：文件/文件夹拖拽移动
6. **状态同步**：与 CLI 工作目录同步

---

## 入口与启动

### 主组件
**文件路径**: `src/renderer/modules/file-tree/index.tsx`

```typescript
// 组件结构（待实现）
export function FileTree() {
  return (
    <div className="h-full flex flex-col">
      <FileTreeHeader />
      <FileTreeSearch />
      <FileTreeNodeList />
    </div>
  );
}
```

### 子组件
- `FileTreeNode.tsx` - 单个树节点
- `FileTreeHeader.tsx` - 标题栏（项目名称、刷新按钮）
- `FileTreeSearch.tsx` - 搜索框
- `FileContextMenu.tsx` - 右键菜单

---

## 对外接口

### Props 接口

```typescript
interface FileTreeProps {
  rootPath: string;                      // 项目根路径
  onFileSelect: (path: string) => void;
  onFileDelete: (path: string) => void;
  onFileRename: (oldPath: string, newPath: string) => void;
  onFolderCreate: (parentPath: string, name: string) => void;
}

interface FileTreeNodeProps {
  node: FileNode;
  level: number;                         // 缩进层级
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}
```

### 数据结构

```typescript
interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder' | 'symlink';
  children?: FileNode[];
  isHidden?: boolean;
  isIgnored?: boolean;                   // .gitignore 忽略
}

interface FileTreeState {
  nodes: FileNode[];
  expandedPaths: Set<string>;
  selectedPath: string | null;
  filter: string;                        // 搜索关键词
}
```

---

## 关键依赖与配置

### 核心依赖
- `lucide-react`: 文件图标
- `react-virtuoso`: 虚拟滚动（大目录优化）

### 图标映射
**src/renderer/modules/file-tree/file-icons.ts**:
```typescript
export const FILE_ICONS: Record<string, React.ReactNode> = {
  'ts': <TypeScriptIcon className="text-blue-500" />,
  'tsx': <ReactIcon className="text-blue-400" />,
  'js': <JSIcon className="text-yellow-500" />,
  'json': <JSONIcon className="text-yellow-300" />,
  'md': <MarkdownIcon className="text-gray-500" />,
  // ... 更多映射
};
```

---

## UI/UX 设计要点

### 视觉层次
```
📁 src
  📁 components
    📄 Button.tsx
    📄 Input.tsx
  📁 hooks
    📄 useStore.ts
  📄 App.tsx
📄 package.json
📄 tsconfig.json
```

### 交互规范
1. **单击**：选中文件
2. **双击**：打开文件（发送到编辑器）
3. **右键**：显示上下文菜单（新建、重命名、删除）
4. **拖拽**：移动文件/文件夹
5. **搜索**：实时过滤文件列表

### 右键菜单项
```
┌─────────────────┐
│ 📄 New File     │
│ 📁 New Folder   │
├─────────────────┤
│ ✏️ Rename       │
│ 📋 Copy Path    │
├─────────────────┤
│ 🗑️ Delete       │
└─────────────────┘
```

---

## 测试与质量

### 单元测试
- 树节点渲染测试
- 展开/折叠交互测试
- 文件搜索测试

### 集成测试
- 与文件系统交互测试
- 拖拽操作测试

### 测试文件
```
file-tree/
├── __tests__/
│   ├── FileTree.test.tsx
│   ├── FileTreeNode.test.tsx
│   └── FileTreeSearch.test.tsx
```

---

## 常见问题 (FAQ)

### Q: 如何处理超大目录？
A: 使用虚拟滚动 + 懒加载子节点（仅在展开时加载）。

### Q: 如何同步 .gitignore？
A: 通过 IPC 读取 `.gitignore` 文件，解析规则并标记 `isIgnored` 节点。

### Q: 如何处理符号链接？
A: 识别 `type: 'symlink'`，显示特殊图标，可选跟随链接或显示跳转路径。

---

## 相关文件清单

- `src/renderer/modules/file-tree/index.tsx` - 主组件
- `src/renderer/modules/file-tree/FileTreeNode.tsx` - 树节点
- `src/renderer/modules/file-tree/file-icons.ts` - 图标映射
- `src/renderer/modules/file-tree/useFileTree.ts` - 自定义 Hook

---

## 下一步行动

1. ⬜ 创建基础组件结构
2. ⬜ 实现树节点递归渲染
3. ⬜ 添加展开/折叠交互
4. ⬜ 实现文件搜索过滤
5. ⬜ 集成右键菜单

---

**模块状态**: 🟡 规划中
**负责人**: 待分配
**最后更新**: 2026-04-22 04:03:38
