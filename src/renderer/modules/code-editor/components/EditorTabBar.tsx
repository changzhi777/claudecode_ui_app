import { useEditorStore } from '@stores';
import { EditorTab } from './EditorTab';
import { Plus } from 'lucide-react';

export function EditorTabBar() {
  const { tabs, activeTabId, closeTab, switchTab } = useEditorStore();

  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-bg-tertiary">
        <span className="text-sm text-text-tertiary">无打开的文件</span>
        <button className="p-1.5 hover:bg-bg-tertiary rounded transition-colors" title="新建文件">
          <Plus size={16} className="text-text-secondary" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-bg-secondary border-b border-bg-tertiary overflow-x-auto">
      {tabs.map((tab) => (
        <EditorTab
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onClose={closeTab}
          onSwitch={switchTab}
        />
      ))}
      <div className="ml-auto flex items-center gap-1 px-2">
        <button className="p-1.5 hover:bg-bg-tertiary rounded transition-colors" title="新建文件">
          <Plus size={16} className="text-text-secondary" />
        </button>
      </div>
    </div>
  );
}
