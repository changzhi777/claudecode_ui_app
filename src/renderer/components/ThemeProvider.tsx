import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@stores';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, currentTheme } = useThemeStore();

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
    root.style.setProperty(
      '--editor-line-highlight',
      theme.colors.components.editor.lineHighlight
    );

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
}
