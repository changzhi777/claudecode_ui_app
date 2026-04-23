import { useThemeStore } from '@stores';
import type { ThemeID } from '@shared/types/theme';

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

export function ThemeSwitcher() {
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-2 bg-bg-secondary rounded-lg p-1 shadow-sm">
      {(Object.keys(themeMeta) as ThemeID[]).map((themeId) => {
        const meta = themeMeta[themeId];
        const isActive = currentTheme === themeId;

        return (
          <button
            key={themeId}
            onClick={() => setTheme(themeId)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
              isActive
                ? 'bg-bg-tertiary shadow-sm'
                : 'hover:bg-bg-tertiary/50'
            }`}
            title={meta.description}
          >
            <span className="text-lg">{meta.icon}</span>
            <span className="text-sm font-medium">{meta.name}</span>
          </button>
        );
      })}
    </div>
  );
}
