# ClaudeCode UI App - 用户使用手册

**版本**: v0.2.0  
**更新日期**: 2026-04-22

---

## 📖 快速开始

### 安装与启动

```bash
# 克隆项目
git clone <repository-url>
cd claudecode_ui_app

# 安装依赖
pnpm install

# 开发模式启动
pnpm dev

# 构建应用
pnpm build

# 打包应用
pnpm package:mac    # macOS
pnpm package:win    # Windows
pnpm package:linux  # Linux
```

---

## 🎯 核心功能使用指南

### 1. AI 对话功能

#### 发送消息
- 在底部输入框输入您的消息
- 按 `Enter` 发送
- 按 `Shift+Enter` 换行
- 支持多行输入

#### 流式响应
- AI 回复实时流式显示
- 三点跳动动画表示思考中
- 工具调用卡片实时更新状态

#### 快捷操作
- `⌘N` / `Ctrl+N` - 新建对话
- `⌘T` / `Ctrl+T` - 切换主题

### 2. 代码编辑功能

#### 打开文件
- 点击左侧文件树中的文件
- CLI 读取文件时自动打开
- 支持多标签页切换

#### 编辑操作
- `⌘S` / `Ctrl+S` - 保存文件
- `⌘W` / `Ctrl+W` - 关闭当前标签
- `⌘/` - 切换注释

#### 编辑器特性
- 语法高亮（支持 20+ 语言）
- 代码折叠
- 查找替换
- 格式化代码
- Minimap 预览

### 3. 文件管理功能

#### 文件树操作
- 单击 - 选中文件
- 双击 - 打开文件
- 右侧小箭头 - 展开/折叠目录

#### 右键菜单
- 新建文件/文件夹
- 重命名
- 复制路径
- 删除

#### 实时同步
- CLI 文件操作自动刷新文件树
- 编辑器修改实时反映

### 4. 任务管理功能

#### 任务状态
- ⏳ 等待中 - 灰色
- 🔄 运行中 - 蓝色（旋转动画）
- ✅ 已完成 - 绿色
- ❌ 失败 - 红色

#### 任务详情
- 点击任务卡片展开详情
- 查看输入参数
- 查看输出结果
- 查看错误信息

### 5. 成本统计功能

#### 统计指标
- 💰 总成本 - 基于 API 定价估算
- 📊 总 Token - 输入+输出 Token 总量
- 📈 总请求 - API 调用次数
- ⚡ 平均响应 - 平均响应时间

#### 模型使用
- 不同模型的使用分布
- 各模型的 Token 和成本统计

### 6. 设置功能

#### 配置信息
- API Key（脱敏显示）
- Base URL
- 当前模型
- 输出样式

#### 权限配置
- 允许的工具列表
- 禁止的工具列表

#### 插件管理
- 启用的插件列表
- 插件状态（启用/禁用）

---

## ⚙️ 配置说明

### Claude CLI 配置文件位置

```bash
~/.claude/settings.json     # 主配置
~/.claude/ccline/models.toml  # 模型配置
```

### 配置示例

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-api-key",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "MODEL": "claude-sonnet-4-20250514"
  },
  "permissions": {
    "allow": ["Bash", "Read", "Write", "Edit"],
    "deny": []
  },
  "outputStyle": "engineer-professional"
}
```

---

## 🔧 故障排除

### 常见问题

#### Q: 应用无法启动？
A: 
1. 检查 Node.js 版本（需要 >= 18）
2. 删除 `node_modules` 重新安装
3. 清理缓存：`rm -rf .vite dist`

#### Q: CLI 连接失败？
A:
1. 检查 Claude CLI 是否已安装：`claude --version`
2. 检查配置文件是否存在
3. 查看控制台错误信息

#### Q: 文件树不显示？
A:
1. 确认项目路径正确
2. 检查文件权限
3. 点击刷新按钮

#### Q: 代码编辑器无法加载？
A:
1. 检查网络连接（Monaco 需要下载）
2. 清理浏览器缓存
3. 重启应用

---

## ⌨️ 快捷键大全

### 全局快捷键
- `⌘N` / `Ctrl+N` - 新建对话
- `⌘T` / `Ctrl+T` - 切换主题
- `⌘Q` / `Ctrl+Q` - 退出应用

### 编辑器快捷键
- `⌘S` / `Ctrl+S` - 保存文件
- `⌘W` / `Ctrl+W` - 关闭标签
- `⌘/` - 切换注释
- `⌘D` - 选中相同单词
- `⌘F` - 查找
- `⌘H` - 替换

### 文件树快捷键
- `→` / `Space` - 展开目录
- `←` / `Backspace` - 折叠目录
- `Enter` - 打开文件
- `Delete` - 删除文件

---

## 📊 性能优化建议

### 大项目优化
- 使用虚拟滚动（自动启用）
- 关闭不必要的文件夹
- 定期清理会话历史

### 内存优化
- 关闭不使用的标签页
- 定期重启应用
- 清理浏览器缓存

### 网络优化
- 使用稳定的网络连接
- 配置 API Base URL（如需要）
- 启用请求缓存

---

## 🎨 主题切换

### 主题模式
- **Claude** - 温暖色调，默认主题
- **Cursor** - 橙色调，专业风格
- **Warp** - 暗色调，极简风格

### 切换方式
- 点击右上角主题按钮
- 使用快捷键 `⌘T` / `Ctrl+T`
- 设置面板中切换

---

## 🔒 隐私与安全

### API Key 安全
- API Key 脱敏显示（只显示前8位和后4位）
- 本地存储，不上传服务器
- 建议定期轮换 API Key

### 数据隐私
- 所有数据存储在本地
- 不收集用户数据
- 不上传代码到云端

### 权限管理
- 默认宽松模式（完全信任项目目录）
- 可在配置文件中调整权限
- 建议定期审查工具权限

---

## 📚 更多资源

### 官方文档
- [ClaudeCode CLI 文档](https://github.com/anthropics/claude-code)
- [Electron 文档](https://www.electronjs.org/docs)
- [React 文档](https://react.dev)

### 社区支持
- [GitHub Issues](https://github.com/changzhi777/claudecode-ui-app/issues)
- [讨论区](https://github.com/changzhi777/claudecode-ui-app/discussions)

---

## 🆕 更新日志

### v0.2.0 (2026-04-22)
- ✅ 完整的 Claude CLI 对接
- ✅ 文件操作实时同步
- ✅ 任务管理可视化
- ✅ 成本统计面板
- ✅ 配置管理功能
- ✅ 性能优化（代码分割、懒加载）
- ✅ 单元测试框架

### v0.1.3 (2026-04-22)
- ✅ 基础 UI 框架
- ✅ Monaco Editor 集成
- ✅ 文件树组件

---

**文档维护者**: BB小子 🤙  
**最后更新**: 2026-04-22 07:45:00
