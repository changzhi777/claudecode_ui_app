import { useEffect } from 'react';
import { useThemeStore } from '@stores/themeStore';

export function useThemeShortcut() {
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
}
