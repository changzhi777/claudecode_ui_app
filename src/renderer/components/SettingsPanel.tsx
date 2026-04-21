/**
 * 设置界面组件
 */

import { useState } from 'react';
import { X, Palette, Keyboard, Bell, User } from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const sections: SettingsSection[] = [
  { id: 'appearance', title: '外观', icon: <Palette size={20} /> },
  { id: 'shortcuts', title: '快捷键', icon: <Keyboard size={20} /> },
  { id: 'notifications', title: '通知', icon: <Bell size={20} /> },
  { id: 'account', title: '账户', icon: <User size={20} /> },
];

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
        title="设置"
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m0-6h6m-6 0h6" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div
        className="w-full max-w-4xl h-[600px] bg-bg-secondary rounded-2xl shadow-2xl border border-bg-tertiary overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 侧边栏 */}
        <div className="w-56 border-r border-bg-tertiary p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-medium text-text-primary">设置</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-bg-tertiary rounded-lg transition-colors"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-secondary hover:bg-bg-tertiary/50'
                }`}
              >
                {section.icon}
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 内容区 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!activeSection ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-text-tertiary">
                <Palette size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">欢迎使用设置</p>
                <p className="text-sm">从左侧选择一个设置类别</p>
              </div>
            </div>
          ) : (
            <div>
              {activeSection === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-display font-medium text-text-primary mb-6">
                    外观设置
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-text-primary mb-3">主题</h3>
                      <p className="text-sm text-text-secondary mb-3">
                        选择你喜欢的主题风格
                      </p>
                      {/* 主题选择器会在这里显示 */}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'shortcuts' && (
                <div>
                  <h2 className="text-2xl font-display font-medium text-text-primary mb-6">
                    快捷键设置
                  </h2>
                  <p className="text-text-secondary">快捷键配置即将推出...</p>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-display font-medium text-text-primary mb-6">
                    通知设置
                  </h2>
                  <p className="text-text-secondary">通知配置即将推出...</p>
                </div>
              )}

              {activeSection === 'account' && (
                <div>
                  <h2 className="text-2xl font-display font-medium text-text-primary mb-6">
                    账户信息
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        用户名
                      </label>
                      <input
                        type="text"
                        value="外星动物"
                        disabled
                        className="w-full px-3 py-2 bg-bg-tertiary border border-bg-primary rounded-lg text-text-primary opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        邮箱
                      </label>
                      <input
                        type="email"
                        value="14455975@qq.com"
                        disabled
                        className="w-full px-3 py-2 bg-bg-tertiary border border-bg-primary rounded-lg text-text-primary opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
