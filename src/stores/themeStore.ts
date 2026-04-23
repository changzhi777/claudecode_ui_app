import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeID, Theme } from '@shared/types/theme';
import { themes } from '@shared/themes';

interface ThemeState {
  currentTheme: ThemeID;
  theme: Theme;
  setTheme: (themeId: ThemeID) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'professional',
      theme: themes.professional,

      setTheme: (themeId: ThemeID) => {
        set({
          currentTheme: themeId,
          theme: themes[themeId],
        });
      },

      toggleTheme: () => {
        const { currentTheme } = get();
        const themeIds: ThemeID[] = ['professional', 'claude', 'cursor', 'warp'];
        const currentIndex = themeIds.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeIds.length;
        get().setTheme(themeIds[nextIndex]);
      },
    }),
    {
      name: 'claudecode-ui-theme',
    }
  )
);
