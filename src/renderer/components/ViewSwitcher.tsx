import { useViewStore } from '@stores/viewStore';
import { MessageSquare, Code2 } from 'lucide-react';
import type { ViewID } from '@stores/viewStore';

const viewMeta: Record<
  ViewID,
  { name: string; icon: React.ReactNode; description: string }
> = {
  chat: {
    name: '对话',
    icon: <MessageSquare size={18} />,
    description: 'AI 对话界面',
  },
  workspace: {
    name: '工作区',
    icon: <Code2 size={18} />,
    description: '代码编辑器',
  },
};

export function ViewSwitcher() {
  const { currentView, setView } = useViewStore();

  return (
    <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1 shadow-sm">
      {(Object.keys(viewMeta) as ViewID[]).map((viewId) => {
        const meta = viewMeta[viewId];
        const isActive = currentView === viewId;

        return (
          <button
            key={viewId}
            onClick={() => setView(viewId)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
              isActive ? 'bg-bg-tertiary shadow-sm' : 'hover:bg-bg-tertiary/50'
            }`}
            title={meta.description}
          >
            <span>{meta.icon}</span>
            <span className="text-sm font-medium">{meta.name}</span>
          </button>
        );
      })}
    </div>
  );
}
