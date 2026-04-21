import { useEffect, useState } from 'react';
import { Key, Server, Shield, Palette, Plug } from 'lucide-react';
import type { ElectronAPI } from '../../global.d.ts';

interface ClaudeConfig {
  apiToken?: string;
  baseUrl?: string;
  permissions?: {
    allow: string[];
    deny: string[];
  };
  enabledPlugins?: Record<string, boolean>;
  outputStyle?: string;
  environment?: Record<string, string>;
}

interface ModelConfig {
  models?: Array<{
    pattern: string;
    display_name: string;
    context_limit: number;
  }>;
  context_modifiers?: Array<{
    pattern: string;
    display_suffix: string;
    context_limit: number;
  }>;
}

interface ConfigData {
  claude: ClaudeConfig;
  models: ModelConfig;
}

export function SettingsPanel() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [apiKey, setApiKey] = useState<{ key: string; masked: string } | null>(null);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);

      // 读取完整配置
      const configData = await (window.electronAPI as ElectronAPI).invoke('config:readAll');
      setConfig(configData as ConfigData);

      // 读取 API Key
      const apiKeyData = await (window.electronAPI as ElectronAPI).invoke('config:getApiKey');
      setApiKey(apiKeyData as { key: string; masked: string });

      // 读取当前模型
      const model = await (window.electronAPI as ElectronAPI).invoke('config:getCurrentModel');
      setCurrentModel(model as string);
    } catch (error) {
      console.error('[SettingsPanel] 加载配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-bg-tertiary rounded w-1/4"></div>
          <div className="h-20 bg-bg-tertiary rounded"></div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <p className="text-text-secondary">无法加载配置</p>
      </div>
    );
  }

  const { claude } = config;

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Claude CLI 配置</h2>
        <button
          onClick={loadConfig}
          className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
        >
          刷新
        </button>
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-text-secondary">
          <Key size={16} />
          <h3 className="text-sm font-medium">API Key</h3>
        </div>
        <div className="p-3 bg-bg-secondary rounded border border-bg-tertiary">
          <code className="text-sm text-text-primary font-mono">
            {apiKey?.masked || '未配置'}
          </code>
        </div>
      </div>

      {/* Base URL */}
      {claude.baseUrl && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Server size={16} />
            <h3 className="text-sm font-medium">Base URL</h3>
          </div>
          <div className="p-3 bg-bg-secondary rounded border border-bg-tertiary">
            <code className="text-sm text-text-primary font-mono break-all">
              {claude.baseUrl}
            </code>
          </div>
        </div>
      )}

      {/* 当前模型 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-text-secondary">
          <Palette size={16} />
          <h3 className="text-sm font-medium">当前模型</h3>
        </div>
        <div className="p-3 bg-bg-secondary rounded border border-bg-tertiary">
          <span className="text-sm text-text-primary font-mono">
            {currentModel || 'claude-sonnet-4-20250514'}
          </span>
        </div>
      </div>

      {/* 输出样式 */}
      {claude.outputStyle && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Palette size={16} />
            <h3 className="text-sm font-medium">输出样式</h3>
          </div>
          <div className="p-3 bg-bg-secondary rounded border border-bg-tertiary">
            <span className="text-sm text-text-primary">
              {claude.outputStyle}
            </span>
          </div>
        </div>
      )}

      {/* 权限配置 */}
      {claude.permissions && claude.permissions.allow.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Shield size={16} />
            <h3 className="text-sm font-medium">允许的工具</h3>
            <span className="text-xs text-text-tertiary">
              ({claude.permissions.allow.length} 个)
            </span>
          </div>
          <div className="p-3 bg-bg-secondary rounded border border-bg-tertiary">
            <div className="flex flex-wrap gap-2">
              {claude.permissions.allow.slice(0, 10).map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-1 text-xs font-mono bg-color-primary/10 text-color-primary rounded"
                >
                  {tool}
                </span>
              ))}
              {claude.permissions.allow.length > 10 && (
                <span className="px-2 py-1 text-xs text-text-tertiary">
                  +{claude.permissions.allow.length - 10} 更多
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 启用的插件 */}
      {claude.enabledPlugins && Object.keys(claude.enabledPlugins).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Plug size={16} />
            <h3 className="text-sm font-medium">启用的插件</h3>
            <span className="text-xs text-text-tertiary">
              ({Object.keys(claude.enabledPlugins).length} 个)
            </span>
          </div>
          <div className="p-3 bg-bg-secondary rounded border border-bg-tertiary">
            <div className="space-y-2">
              {Object.entries(claude.enabledPlugins).map(([plugin, enabled]) => (
                <div
                  key={plugin}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-text-primary font-mono">{plugin}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      enabled
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-text-tertiary/10 text-text-tertiary'
                    }`}
                  >
                    {enabled ? '启用' : '禁用'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 环境变量 */}
      {claude.environment && Object.keys(claude.environment).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Shield size={16} />
            <h3 className="text-sm font-medium">环境变量</h3>
            <span className="text-xs text-text-tertiary">
              ({Object.keys(claude.environment).length} 个)
            </span>
          </div>
          <div className="p-3 bg-bg-secondary rounded border border-bg-tertiary max-h-60 overflow-y-auto">
            <div className="space-y-1">
              {Object.entries(claude.environment).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start gap-2 text-sm font-mono"
                >
                  <span className="text-color-primary shrink-0">{key}=</span>
                  <span className="text-text-secondary break-all">
                    {key.includes('TOKEN') || key.includes('KEY')
                      ? '***已屏蔽***'
                      : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
