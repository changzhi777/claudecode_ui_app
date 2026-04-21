# ClaudeCode UI App - 主题系统架构

> 基于 Claude、Cursor、Warp 三大设计理念的可切换主题系统

---

## 设计理念

**Be Water, My Friend** — 如水般适应不同心境：

- 📖 **Claude 主题** - 温暖人文，适合深度思考与阅读
- ⚡ **Cursor 主题** - 精密工程，适合编码与调试
- 🌙 **Warp 主题** - 极简深色，适合夜间工作

---

## 主题类型定义

```typescript
// src/shared/types/theme.ts

export type ThemeID = 'claude' | 'cursor' | 'warp';

export interface Theme {
  id: ThemeID;
  name: string;
  description: string;
  designer: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
}

export interface ThemeColors {
  // 主色
  primary: string;
  secondary: string;
  accent: string;

  // 背景
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };

  // 文本
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };

  // 语义
  semantic: {
    error: string;
    success: string;
    warning: string;
    info: string;
  };

  // 组件特定
  components: {
    chat: {
      userBubble: string;
      aiBubble: string;
      inputBg: string;
    };
    editor: {
      bg: string;
      gutter: string;
      lineHighlight: string;
    };
    fileTree: {
      bg: string;
      selectedItem: string;
      hover: string;
    };
  };
}

export interface ThemeTypography {
  families: {
    display: string;
    ui: string;
    body: string;
    code: string;
  };
  sizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface ThemeSpacing {
  unit: number; // 基础单位（px）
  scale: number[]; // 间距比例尺
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  focus: string;
}

export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}
```

---

## 主题配置数据

```typescript
// src/shared/themes/index.ts

import { Theme } from '../types/theme';

export const themes: Record<ThemeID, Theme> = {
  claude: {
    id: 'claude',
    name: 'Claude',
    description: '温暖人文，适合深度思考与阅读',
    designer: 'Anthropic',
    colors: {
      primary: '#c96442', // 赤陶色
      secondary: '#d97757', // 珊瑚色
      accent: '#3898ec', // 焦点蓝

      bg: {
        primary: '#f5f4ed', // 羊皮纸
        secondary: '#faf9f5', // 象牙白
        tertiary: '#e8e6dc', // 暖沙色
        elevated: '#ffffff', // 纯白
      },

      text: {
        primary: '#141413', // 近黑暖色
        secondary: '#5e5d59', // 橄榄灰
        tertiary: '#87867f', // 石灰灰
        inverse: '#faf9f6', // 暖白
      },

      semantic: {
        error: '#b53333', // 暖红
        success: '#1f8a65', // 鼠尾草绿
        warning: '#c08532', // 金色
        info: '#3898ec', // 蓝色
      },

      components: {
        chat: {
          userBubble: '#c96442',
          aiBubble: '#faf9f5',
          inputBg: '#ffffff',
        },
        editor: {
          bg: '#f5f4ed',
          gutter: '#e8e6dc',
          lineHighlight: '#faf9f5',
        },
        fileTree: {
          bg: '#f5f4ed',
          selectedItem: '#e8e6dc',
          hover: '#faf9f5',
        },
      },
    },

    typography: {
      families: {
        display: 'Georgia, serif',
        ui: 'system-ui, -apple-system, sans-serif',
        body: 'Anthropic Sans, system-ui, sans-serif',
        code: 'Geist Mono, ui-monospace, monospace',
      },
      sizes: {
        xs: '0.75rem',   // 12px
        sm: '0.875rem',  // 14px
        md: '1rem',      // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '2rem',   // 32px
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },

    spacing: {
      unit: 8,
      scale: [4, 8, 12, 16, 20, 24, 32, 48, 64],
    },

    shadows: {
      sm: '0px 0px 0px 1px rgba(0,0,0,0.04)',
      md: '0px 4px 12px rgba(0,0,0,0.08)',
      lg: '0px 8px 24px rgba(0,0,0,0.12)',
      xl: '0px 12px 32px rgba(0,0,0,0.16)',
      focus: '0 0 0 3px rgba(56, 152, 236, 0.1)',
    },

    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
  },

  cursor: {
    id: 'cursor',
    name: 'Cursor',
    description: '精密工程，适合编码与调试',
    designer: 'Cursor Team',
    colors: {
      primary: '#f54e00', // 橙色
      secondary: '#c08532', // 金色
      accent: '#3898ec', // 焦点蓝

      bg: {
        primary: '#f2f1ed', // 米白
        secondary: '#f7f7f4', // 浅米白
        tertiary: '#e6e5e0', // 深米白
        elevated: '#ffffff', // 纯白
      },

      text: {
        primary: '#26251e', // 暖黑
        secondary: '#5e5d59', // 橄榄灰
        tertiary: '#87867f', // 石灰灰
        inverse: '#f2f1ed', // 米白
      },

      semantic: {
        error: '#cf2d56', // 暖红
        success: '#1f8a65', // 鼠尾草绿
        warning: '#c08532', // 金色
        info: '#3898ec', // 蓝色
      },

      components: {
        chat: {
          userBubble: '#f54e00',
          aiBubble: '#f7f7f4',
          inputBg: '#ffffff',
        },
        editor: {
          bg: '#f2f1ed',
          gutter: '#e6e5e0',
          lineHighlight: '#f7f7f4',
        },
        fileTree: {
          bg: '#f2f1ed',
          selectedItem: '#e6e5e0',
          hover: '#f7f7f4',
        },
      },
    },

    typography: {
      families: {
        display: 'CursorGothic, system-ui, sans-serif',
        ui: 'system-ui, -apple-system, sans-serif',
        body: 'jjannon, Iowan Old Style, serif',
        code: 'berkeleyMono, ui-monospace, monospace',
      },
      sizes: {
        xs: '0.69rem',   // 11px
        sm: '0.875rem',  // 14px
        md: '1rem',      // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '2.25rem', // 36px
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },

    spacing: {
      unit: 8,
      scale: [1.5, 2, 2.5, 3, 4, 5, 6, 8, 12], // Cursor 精细增量
    },

    shadows: {
      sm: '0px 0px 0px 1px rgba(38, 37, 30, 0.1)',
      md: 'rgba(0,0,0,0.14) 0px 28px 70px, rgba(0,0,0,0.1) 0px 14px 32px',
      lg: 'rgba(0,0,0,0.14) 0px 28px 70px, rgba(0,0,0,0.1) 0px 14px 32px, oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px',
      xl: 'rgba(0,0,0,0.14) 0px 28px 70px, rgba(0,0,0,0.1) 0px 14px 32px, rgba(0,0,0,0.1) 0px 0px 0px 1px',
      focus: '0 0 0 3px rgba(56, 152, 236, 0.1)',
    },

    borderRadius: {
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '33.5M px', // Cursor 的极圆角
    },
  },

  warp: {
    id: 'warp',
    name: 'Warp',
    description: '极简深色，适合夜间工作',
    designer: 'Warp Team',
    colors: {
      primary: '#faf9f6', // 暖羊皮纸白
      secondary: '#afaeac', // 灰灰
      accent: '#3898ec', // 焦点蓝

      bg: {
        primary: '#141413', // 深虚空
        secondary: '#353534', // 土灰
        tertiary: '#30302e', // 暖炭
        elevated: 'rgba(255, 255, 255, 0.04)', // 霜面纱
      },

      text: {
        primary: '#faf9f6', // 暖羊皮纸白
        secondary: '#afaeac', // 灰灰
        tertiary: '#868584', // 石灰
        inverse: '#141413', // 深虚空
      },

      semantic: {
        error: '#cf2d56', // 暖红
        success: '#1f8a65', // 鼠尾草绿
        warning: '#c08532', // 金色
        info: '#3898ec', // 蓝色
      },

      components: {
        chat: {
          userBubble: '#353534',
          aiBubble: 'rgba(255, 255, 255, 0.08)',
          inputBg: '#353534',
        },
        editor: {
          bg: '#141413',
          gutter: '#353534',
          lineHighlight: 'rgba(255, 255, 255, 0.04)',
        },
        fileTree: {
          bg: '#141413',
          selectedItem: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.04)',
        },
      },
    },

    typography: {
      families: {
        display: 'Matter Regular, system-ui, sans-serif',
        ui: 'Inter, system-ui, sans-serif',
        body: 'Matter Regular, system-ui, sans-serif',
        code: 'Geist Mono, ui-monospace, monospace',
      },
      sizes: {
        xs: '0.69rem',   // 11px
        sm: '0.875rem',  // 14px
        md: '1rem',      // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '2.5rem', // 40px
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },

    spacing: {
      unit: 8,
      scale: [4, 8, 12, 16, 20, 24, 32, 48, 64],
    },

    shadows: {
      sm: 'rgba(255, 255, 255, 0.04) 0px 0px 0px 1px',
      md: 'rgba(255, 255, 255, 0.08) 0px 4px 12px',
      lg: 'rgba(255, 255, 255, 0.12) 0px 8px 24px',
      xl: 'rgba(255, 255, 255, 0.16) 0px 12px 32px',
      focus: '0 0 0 3px rgba(56, 152, 236, 0.2)',
    },

    borderRadius: {
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '50px', // Warp 的药丸形状
      full: '50px',
    },
  },
};
```

---

## 主题状态管理

```typescript
// src/stores/themeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeID, Theme } from '../shared/types/theme';
import { themes } from '../shared/themes';

interface ThemeState {
  currentTheme: ThemeID;
  theme: Theme;
  setTheme: (themeId: ThemeID) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'claude', // 默认主题
      theme: themes.claude,

      setTheme: (themeId: ThemeID) => {
        set({
          currentTheme: themeId,
          theme: themes[themeId],
        });
      },

      toggleTheme: () => {
        const { currentTheme } = get();
        const themeIds: ThemeID[] = ['claude', 'cursor', 'warp'];
        const currentIndex = themeIds.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeIds.length;
        get().setTheme(themeIds[nextIndex]);
      },
    }),
    {
      name: 'claudecode-ui-theme', // localStorage key
    }
  )
);
```

---

## 主题提供者组件

```typescript
// src/renderer/components/ThemeProvider.tsx

import React, { useEffect, useMemo } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { ThemeID } from '../../shared/types/theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme, currentTheme } = useThemeStore();

  // 应用 CSS 变量
  useEffect(() => {
    const root = document.documentElement;

    // 颜色变量
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);

    // 背景变量
    root.style.setProperty('--bg-primary', theme.colors.bg.primary);
    root.style.setProperty('--bg-secondary', theme.colors.bg.secondary);
    root.style.setProperty('--bg-tertiary', theme.colors.bg.tertiary);
    root.style.setProperty('--bg-elevated', theme.colors.bg.elevated);

    // 文本变量
    root.style.setProperty('--text-primary', theme.colors.text.primary);
    root.style.setProperty('--text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--text-tertiary', theme.colors.text.tertiary);
    root.style.setProperty('--text-inverse', theme.colors.text.inverse);

    // 语义变量
    root.style.setProperty('--color-error', theme.colors.semantic.error);
    root.style.setProperty('--color-success', theme.colors.semantic.success);
    root.style.setProperty('--color-warning', theme.colors.semantic.warning);
    root.style.setProperty('--color-info', theme.colors.semantic.info);

    // 组件变量
    root.style.setProperty('--chat-user-bubble', theme.colors.components.chat.userBubble);
    root.style.setProperty('--chat-ai-bubble', theme.colors.components.chat.aiBubble);
    root.style.setProperty('--chat-input-bg', theme.colors.components.chat.inputBg);

    root.style.setProperty('--editor-bg', theme.colors.components.editor.bg);
    root.style.setProperty('--editor-gutter', theme.colors.components.editor.gutter);
    root.style.setProperty('--editor-line-highlight', theme.colors.components.editor.lineHighlight);

    root.style.setProperty('--file-tree-bg', theme.colors.components.fileTree.bg);
    root.style.setProperty('--file-tree-selected', theme.colors.components.fileTree.selectedItem);
    root.style.setProperty('--file-tree-hover', theme.colors.components.fileTree.hover);

    // 字体变量
    root.style.setProperty('--font-display', theme.typography.families.display);
    root.style.setProperty('--font-ui', theme.typography.families.ui);
    root.style.setProperty('--font-body', theme.typography.families.body);
    root.style.setProperty('--font-code', theme.typography.families.code);

    // 阴影变量
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    root.style.setProperty('--shadow-md', theme.shadows.md);
    root.style.setProperty('--shadow-lg', theme.shadows.lg);
    root.style.setProperty('--shadow-xl', theme.shadows.xl);
    root.style.setProperty('--shadow-focus', theme.shadows.focus);

    // 圆角变量
    root.style.setProperty('--radius-sm', theme.borderRadius.sm);
    root.style.setProperty('--radius-md', theme.borderRadius.md);
    root.style.setProperty('--radius-lg', theme.borderRadius.lg);
    root.style.setProperty('--radius-xl', theme.borderRadius.xl);
    root.style.setProperty('--radius-full', theme.borderRadius.full);

    // 设置 data-theme 属性
    root.setAttribute('data-theme', currentTheme);
  }, [theme, currentTheme]);

  return <>{children}</>;
};
```

---

## 主题切换器组件

```typescript
// src/renderer/components/ThemeSwitcher.tsx

import React from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { ThemeID } from '../../shared/types/theme';

const themeMeta: Record<
  ThemeID,
  { name: string; description: string; icon: string }
> = {
  claude: {
    name: 'Claude',
    description: '温暖人文',
    icon: '📖',
  },
  cursor: {
    name: 'Cursor',
    description: '精密工程',
    icon: '⚡',
  },
  warp: {
    name: 'Warp',
    description: '极简深色',
    icon: '🌙',
  },
};

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <div className="theme-switcher">
      {(Object.keys(themeMeta) as ThemeID[]).map((themeId) => {
        const meta = themeMeta[themeId];
        const isActive = currentTheme === themeId;

        return (
          <button
            key={themeId}
            onClick={() => setTheme(themeId)}
            className={`theme-button ${isActive ? 'active' : ''}`}
            title={meta.description}
          >
            <span className="theme-icon">{meta.icon}</span>
            <span className="theme-name">{meta.name}</span>
          </button>
        );
      })}
    </div>
  );
};
```

---

## 使用示例

```tsx
// src/renderer/App.tsx

import { ThemeProvider } from './components/ThemeProvider';
import { ThemeSwitcher } from './components/ThemeSwitcher';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <header>
          <h1>ClaudeCode UI</h1>
          <ThemeSwitcher />
        </header>

        <main>
          {/* 你的应用内容 */}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

---

## 快捷键切换

```typescript
// src/renderer/hooks/useThemeShortcut.ts

import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export const useThemeShortcut = () => {
  const { toggleTheme } = useThemeStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + T 切换主题
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTheme]);
};
```

---

## CSS 变量使用

```css
/* 使用主题变量 */

.button-primary {
  background: var(--color-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-family: var(--font-ui);
  box-shadow: var(--shadow-md);
}

.button-primary:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.button-primary:focus {
  outline: none;
  box-shadow: var(--shadow-focus);
}
```

---

## 主题预览

| 主题 | 氛围 | 适用场景 |
|------|------|----------|
| 📖 Claude | 温暖人文 | 深度思考、阅读、对话 |
| ⚡ Cursor | 精密工程 | 编码、调试、开发 |
| 🌙 Warp | 极简深色 | 夜间工作、专注模式 |

---

## 存储位置

主题偏好保存在 `localStorage`：
- Key: `claudecode-ui-theme`
- 格式: JSON

```json
{
  "state": {
    "currentTheme": "claude",
    "theme": { /* 完整主题对象 */ }
  },
  "version": 0
}
```

---

## 扩展主题

添加新主题：

```typescript
// src/shared/themes/custom.ts

import { Theme } from '../types/theme';

export const customTheme: Theme = {
  id: 'custom',
  name: 'Custom',
  description: '你的自定义主题',
  designer: 'Your Name',
  // ... 完整主题配置
};

// 添加到主题列表
// src/shared/themes/index.ts
export const themes = {
  claude: claudeTheme,
  cursor: cursorTheme,
  warp: warpTheme,
  custom: customTheme, // 新主题
};
```

---

## 性能优化

1. **主题缓存**: 使用 Zustand persist 缓存
2. **CSS 变量**: 浏览器原生优化
3. **懒加载**: 按需加载主题资源
4. **防抖切换**: 避免频繁切换导致重绘

---

## 可访问性

- ✅ 键盘快捷键 (Cmd/Ctrl + T)
- ✅ 语义化按钮标签
- ✅ 焦点管理
- ✅ 屏幕阅读器支持
- ✅ 对比度符合 WCAG AA 标准

---

**如水，主题随你心境而流。** 🤙
