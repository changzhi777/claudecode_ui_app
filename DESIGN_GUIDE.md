# ClaudeCode UI App - 综合设计指南

> 基于 Claude、Cursor、Warp 三个顶级开发工具的设计理念，为 ClaudeCode CLI 打造最佳 UI 体验

**重要**: 本项目采用**可切换主题系统**，详见 [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md)

---

## 主题系统概览

| 主题 | 设计理念 | 适用场景 |
|------|----------|----------|
| 📖 **Claude** | 温暖人文，文学沙龙感 | 深度思考、阅读、AI 对话 |
| ⚡ **Cursor** | 精密工程，代码编辑器感 | 编码、调试、开发 |
| 🌙 **Warp** | 极简深色，流动专注感 | 夜间工作、专注模式 |

**切换方式**:
- 点击界面右上角主题切换器
- 快捷键 `⌘T` (Mac) / `Ctrl+T` (Windows/Linux)
- 主题偏好自动保存

---

## 设计理念融合

### 1. Claude 的温暖人文感
- **羊皮纸背景** (`#f5f4ed`) - 营造文学沙龙氛围
- **衬线标题** - Anthropic Serif，传递知识权威感
- **赤陶色强调** (`#c96442`) - 温暖、非科技感的品牌色

### 2. Cursor 的精密工程感
- **三字体系统** - Gothic (展示) + Serif (正文) + Mono (代码)
- **压缩字间距** - Display 字体 -2.16px，营造精密感
- **oklab 边框** - 感知统一的色彩空间

### 3. Warp 的深色流动感
- **温暖深色背景** - 非冷黑，而是炭木/深土色
- **Matter 字体** - 几何但亲切，Regular 为主
- **极简色彩** - 几乎单色，通过透明度创造层次

---

## 我们的设计系统

### 色彩方案

#### 浅色模式（默认）
```css
/* 背景 */
--bg-primary: #f5f4ed;      /* Claude 羊皮纸 */
--bg-secondary: #faf9f5;    /* 象牙白卡片 */
--bg-tertiary: #e8e6dc;     /* 暖沙色按钮 */

/* 文本 */
--text-primary: #141413;    /* 近黑暖色 */
--text-secondary: #5e5d59;  /* 橄榄灰 */
--text-tertiary: #87867f;   /* 石灰灰 */

/* 强调 */
--accent-brand: #c96442;    /* 赤陶色（Claude） */
--accent-action: #f54e00;   /* 橙色（Cursor） */
--accent-code: #9fc9a2;     /* 鼠尾草绿 */

/* 语义 */
--color-error: #b53333;     /* 暖红 */
--color-success: #1f8a65;   /* 鼠尾草绿 */
--color-focus: #3898ec;     /* 蓝色（仅焦点） */
```

#### 深色模式（可选）
```css
/* 背景 */
--bg-primary: #141413;      /* 深虚空 */
--bg-secondary: #353534;    /* 土灰 */
--bg-tertiary: #30302e;     /* 暖炭 */

/* 文本 */
--text-primary: #faf9f6;    /* 暖羊皮纸白 */
--text-secondary: #afaeac;  /* 灰灰 */
--text-tertiary: #868584;   /* 石灰 */

/* 强调 */
--accent-brand: #c96442;    /* 赤陶色保持 */
--accent-action: #f54e00;   /* 橙色保持 */
```

### 字体系统

#### 字体家族
```css
/* 层次 1: 标题 - Claude 风格 */
--font-display: 'Georgia', 'Anthropic Serif', serif;

/* 层次 2: UI - Cursor 风格 */
--font-ui: system-ui, -apple-system, 'CursorGothic', sans-serif;

/* 层次 3: 正文 - 混合风格 */
--font-body: 'Anthropic Sans', system-ui, sans-serif;

/* 层次 4: 代码 */
--font-code: 'Geist Mono', 'berkeleyMono', ui-monospace, monospace;
```

#### 字体层次表
| 角色 | 字体 | 大小 | 字重 | 行高 | 字间距 | 用途 |
|------|------|------|------|------|--------|------|
| Display Hero | Georgia | 64px | 500 | 1.10 | normal | 主页标题 |
| Section Heading | Georgia | 48px | 500 | 1.20 | normal | 区域标题 |
| Sub-heading | Georgia | 32px | 500 | 1.10 | normal | 卡片标题 |
| Body Large | system-ui | 18px | 400 | 1.60 | normal | 正文 |
| Body | system-ui | 16px | 400 | 1.50 | normal | UI 文本 |
| Caption | system-ui | 14px | 400 | 1.43 | normal | 元数据 |
| Code | Geist Mono | 15px | 400 | 1.60 | -0.32px | 代码 |

### 组件样式

#### 按钮
```css
/* 主要按钮 */
.btn-primary {
  background: #c96442;  /* 赤陶色 */
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font: 500 16px/1.2 system-ui;
  transition: all 0.15s ease;
}

/* 次要按钮 */
.btn-secondary {
  background: #e8e6dc;  /* 暖沙色 */
  color: #4d4c48;
  padding: 12px 24px;
  border-radius: 8px;
  font: 500 16px/1.2 system-ui;
}

/* 文本按钮 */
.btn-ghost {
  background: transparent;
  color: #c96442;
  padding: 8px 16px;
  font: 500 16px/1.2 system-ui;
}
```

#### 卡片
```css
.card {
  background: #faf9f5;  /* 象牙白 */
  border: 1px solid #f0eee6;  /* 奶油边框 */
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0px 0px 0px 1px rgba(0,0,0,0.04);
}

.card:hover {
  box-shadow: 0px 4px 12px rgba(0,0,0,0.08);
}
```

#### 输入框
```css
.input {
  background: #ffffff;
  border: 1px solid #e8e6dc;
  border-radius: 8px;
  padding: 12px 16px;
  font: 400 16px/1.5 system-ui;
  color: #141413;
}

.input:focus {
  outline: none;
  border-color: #3898ec;  /* 蓝色焦点环 */
  box-shadow: 0 0 0 3px rgba(56, 152, 236, 0.1);
}
```

### 间距系统

采用 **8px 基础网格** + Cursor 的精细增量：
```css
/* 基础间距 */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;

/* 精细增量（Cursor 风格）*/
--space-xs: 2px;
--space-sm: 6px;
```

### 深度与阴影

#### 环形阴影系统（Claude 风格）
```css
/* 提升 1: 卡片 */
--shadow-card: 0px 0px 0px 1px rgba(0,0,0,0.04);

/* 提升 2: 悬浮 */
--shadow-float: 0px 4px 12px rgba(0,0,0,0.08);

/* 提升 3: 弹出 */
--shadow-popover: 0px 8px 24px rgba(0,0,0,0.12);

/* 焦点环 */
--shadow-focus: 0 0 0 3px rgba(56, 152, 236, 0.1);
```

### 动效原则

1. **时长**: 150ms - 300ms（Cursor 标准）
2. **缓动**: `ease-out` 为主
3. **属性**: 优先 `transform` 和 `opacity`
4. **交互**: 悬浮时轻微提升（`translateY(-2px)`）

---

## 模块特定设计

### 1. AI 对话界面
- **风格**: Claude 的文学沙龙感
- **背景**: 羊皮纸色 (#f5f4ed)
- **消息气泡**:
  - 用户: 赤陶色 (#c96442)
  - AI: 象牙白卡片 (#faf9f5)
- **字体**: Georgia 标题 + system-ui 正文
- **代码块**: 暖色背景 + Geist Mono

### 2. 代码编辑器
- **风格**: Cursor 的精密工程感
- **字体**: Geist Mono / berkeleyMono
- **主题**: 深色（Warp 风格）
- **行号**: 石灰灰 (#868584)
- **语法高亮**: 鼠尾草绿系（#9fc9a2, #9fbbe0, #c0a8dd）

### 3. 文件树
- **风格**: Warp 的极简深色
- **背景**: 深虚空 (#141413)
- **选中**: 半透明白色 (rgba(255,255,255,0.08))
- **图标**: 单色，无装饰

### 4. 任务可视化
- **风格**: Cursor 的时间线色彩
- **状态颜色**:
  - 思考中: #dfa88f（暖桃色）
  - 搜索: #9fc9a2（鼠尾草绿）
  - 读取: #9fbbe0（软蓝）
  - 编辑: #c0a8dd（淡紫）
- **进度条**: 赤陶色渐变

---

## 响应式断点

```css
/* 移动端 */
--breakpoint-mobile: 640px;

/* 平板 */
--breakpoint-tablet: 768px;

/* 桌面 */
--breakpoint-desktop: 1024px;

/* 大屏 */
--breakpoint-wide: 1280px;
```

---

## 可访问性

### 对比度
- 正文文本: 最少 4.5:1
- 大号文本: 最少 3:1
- 交互元素: 最少 3:1

### 触摸目标
- 最小尺寸: 44×44px
- 推荐尺寸: 48×48px

### 键盘导航
- 所有交互元素可键盘访问
- 焦点环可见（蓝色 #3898ec）
- Tab 顺序逻辑

---

## AI 助手使用指南

### 方式 1: 指定主题构建

```
请参考 THEME_ARCHITECTURE.md，
使用 Claude 主题构建对话界面：
- 羊皮纸背景 (#f5f4ed)
- 赤陶色强调 (#c96442)
- Georgia 标题 + system-ui UI
- 环形阴影 + 8px 圆角
```

### 方式 2: 主题感知构建

```
请使用当前激活的主题（data-theme 属性）
构建一个响应式的卡片组件，
确保在 Claude/Cursor/Warp 三个主题下都能正常显示。
使用 CSS 变量而非硬编码颜色。
```

### 方式 3: 多主题适配

```
请参考 DESIGN_GUIDE.md 和 THEME_ARCHITECTURE.md，
构建一个主题感知的按钮组件：
- 使用 var(--color-primary) 等变量
- 适配浅色/深色模式
- 考虑三种主题的视觉差异
```

---

## 主题系统最佳实践

### ✅ 推荐做法

```css
/* 使用 CSS 变量 */
.button {
  background: var(--color-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-md);
}

/* 响应当前主题 */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color, transparent);
}
```

### ❌ 避免做法

```css
/* 硬编码颜色 */
.button {
  background: #c96442; /* 仅 Claude 主题有效 */
  color: #ffffff;
}

/* 不考虑主题切换 */
.card {
  background: #faf9f5; /* Claude 特有颜色 */
}
```

### 🎯 主题感知设计

```tsx
// 读取当前主题
const currentTheme = document.documentElement.getAttribute('data-theme');

// 根据主题调整行为
const getGreeting = () => {
  switch (currentTheme) {
    case 'claude':
      return '欢迎回来，准备开始深度思考？';
    case 'cursor':
      return 'Ready to code? Let\'s ship.';
    case 'warp':
      return '进入流状态';
  }
};
```

---

## 设计资源链接

- **Claude Design**: `/DESIGN.md`
- **Cursor Design**: `/cursor/DESIGN.md`
- **Warp Design**: `/warp/DESIGN.md`
- **0xdesign Plugin**: https://github.com/0xdesign/design-plugin
- **getdesign.md**: https://getdesign.md/

---

## 版本

- **创建日期**: 2026-04-22
- **基于**: Claude + Cursor + Warp 设计系统
- **维护者**: BB 小子 🤙
