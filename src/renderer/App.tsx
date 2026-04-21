import { ThemeProvider } from './components/ThemeProvider';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { ViewSwitcher } from './components/ViewSwitcher';
import { useThemeStore } from '@stores/themeStore';
import { useThemeShortcut } from './hooks/useThemeShortcut';
import { useViewShortcut } from './hooks/useViewShortcut';
import { ChatUI } from './modules/chat-ui/ChatUI';
import { Workspace } from './modules/workspace/Workspace';
import { TaskVizContainer } from './modules/task-viz/TaskVizContainer';
import { useViewStore } from '@stores/viewStore';

function AppContent() {
  const { currentTheme } = useThemeStore();
  const { currentView } = useViewStore();
  useThemeShortcut(); // 启用快捷键
  useViewShortcut(); // 启用视图切换快捷键

  return (
    <div className="app h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-bg-tertiary bg-bg-secondary">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-medium text-text-primary">
            ClaudeCode UI
          </h1>
          <span className="text-xs text-text-tertiary px-2 py-1 rounded bg-bg-tertiary">
            v0.2.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ViewSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 主内容区 */}
        <main className="flex-1 overflow-hidden">
          {currentView === 'chat' && <ChatUI />}
          {currentView === 'workspace' && <Workspace />}
        </main>

        {/* 任务可视化（侧边栏） */}
        <TaskVizContainer />
      </div>

      <footer className="px-6 py-2 border-t border-bg-tertiary bg-bg-secondary text-center text-xs text-text-tertiary">
        <p>
          视图: <span className="font-medium">{currentView === 'chat' ? '对话' : '工作区'}</span> •
          主题: <span className="font-medium">{currentTheme}</span> •
          快捷键: ⌘T 切换主题 • ⌘K 切换视图 •
          由 BB 小子构建 🤙
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
