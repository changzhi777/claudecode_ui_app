import type { Theme } from '../types/theme';

export const themes: Record<'claude' | 'cursor' | 'warp' | 'professional', Theme> = {
  claude: {
    id: 'claude',
    name: 'Claude',
    description: '温暖人文，适合深度思考与阅读',
    designer: 'Anthropic',
    colors: {
      primary: '#c96442',
      secondary: '#d97757',
      accent: '#3898ec',
      bg: {
        primary: '#f5f4ed',
        secondary: '#faf9f5',
        tertiary: '#e8e6dc',
        elevated: '#ffffff',
      },
      text: {
        primary: '#141413',
        secondary: '#5e5d59',
        tertiary: '#87867f',
        inverse: '#faf9f6',
      },
      semantic: {
        error: '#b53333',
        success: '#1f8a65',
        warning: '#c08532',
        info: '#3898ec',
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
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
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
      primary: '#f54e00',
      secondary: '#c08532',
      accent: '#3898ec',
      bg: {
        primary: '#f2f1ed',
        secondary: '#f7f7f4',
        tertiary: '#e6e5e0',
        elevated: '#ffffff',
      },
      text: {
        primary: '#26251e',
        secondary: '#5e5d59',
        tertiary: '#87867f',
        inverse: '#f2f1ed',
      },
      semantic: {
        error: '#cf2d56',
        success: '#1f8a65',
        warning: '#c08532',
        info: '#3898ec',
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
        xs: '0.69rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2.25rem',
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
      scale: [1.5, 2, 2.5, 3, 4, 5, 6, 8, 12],
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
      full: '33.5M px',
    },
  },

  warp: {
    id: 'warp',
    name: 'Warp',
    description: '极简深色，适合夜间工作',
    designer: 'Warp Team',
    colors: {
      primary: '#faf9f6',
      secondary: '#afaeac',
      accent: '#3898ec',
      bg: {
        primary: '#141413',
        secondary: '#353534',
        tertiary: '#30302e',
        elevated: 'rgba(255, 255, 255, 0.04)',
      },
      text: {
        primary: '#faf9f6',
        secondary: '#afaeac',
        tertiary: '#868584',
        inverse: '#141413',
      },
      semantic: {
        error: '#cf2d56',
        success: '#1f8a65',
        warning: '#c08532',
        info: '#3898ec',
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
        xs: '0.69rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2.5rem',
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
      xl: '50px',
      full: '50px',
    },
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    description: '专业深色，高效开发工作流',
    designer: 'ClaudeCode UI',
    colors: {
      primary: '#3B82F6',        // 蓝色 - 主色
      secondary: '#1F2937',      // 深灰 - 次要色
      accent: '#10B981',         // 绿色 - 强调色
      bg: {
        primary: '#0A0E17',      // 深黑 - 主背景
        secondary: '#111827',    // 次级背景
        tertiary: '#1F2937',     // 三级背景/边框
        elevated: '#1F2937',     // 悬浮元素
      },
      text: {
        primary: '#F9FAFB',      // 主要文本
        secondary: '#D1D5DB',    // 次要文本
        tertiary: '#9CA3AF',     // 三级文本
        inverse: '#0A0E17',      // 反色文本
      },
      semantic: {
        error: '#EF4444',        // 错误 - 红色
        success: '#10B981',      // 成功 - 绿色
        warning: '#F59E0B',      // 警告 - 黄色
        info: '#3B82F6',         // 信息 - 蓝色
      },
      components: {
        chat: {
          userBubble: '#3B82F6',     // 用户消息 - 蓝色
          aiBubble: '#1F2937',        // AI 消息 - 深灰
          inputBg: '#1F2937',         // 输入框背景
        },
        editor: {
          bg: '#0A0E17',              // 编辑器背景
          gutter: '#111827',          // 行号栏
          lineHighlight: '#1F2937',   // 当前行高亮
        },
        fileTree: {
          bg: '#0A0E17',              // 文件树背景
          selectedItem: '#1F2937',    // 选中项
          hover: '#111827',           // 悬停状态
        },
      },
    },
    typography: {
      families: {
        display: 'Inter, -apple-system, system-ui, sans-serif',
        ui: 'Inter, -apple-system, system-ui, sans-serif',
        body: 'Inter, -apple-system, system-ui, sans-serif',
        code: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
      },
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    spacing: {
      unit: 4,
      scale: [4, 8, 12, 16, 20, 24, 32, 48, 64],
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
      focus: '0 0 0 3px rgba(59, 130, 246, 0.3)',
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '9999px',
    },
  },
};
