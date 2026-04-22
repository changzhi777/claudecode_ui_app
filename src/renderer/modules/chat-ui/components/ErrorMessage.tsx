import React from 'react';
import { AlertCircle, RefreshCcw, X, WifiOff, Clock, AlertTriangle } from 'lucide-react';

/**
 * 错误类型
 */
type ErrorType = 'network' | 'timeout' | 'parse' | 'permission' | 'unknown';

/**
 * 错误配置
 */
interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  color: string;
  bgColor: string;
  suggestion: string;
  canRetry: boolean;
}

/**
 * 错误类型配置映射
 */
const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  network: {
    icon: <WifiOff className="w-5 h-5" />,
    title: '网络错误',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    suggestion: '请检查网络连接后重试',
    canRetry: true
  },
  timeout: {
    icon: <Clock className="w-5 h-5" />,
    title: '请求超时',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    suggestion: '服务器响应超时，请稍后重试',
    canRetry: true
  },
  parse: {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: '数据解析错误',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    suggestion: '返回数据格式异常，请重试或联系技术支持',
    canRetry: true
  },
  permission: {
    icon: <AlertCircle className="w-5 h-5" />,
    title: '权限不足',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    suggestion: '您没有权限执行此操作，请检查API Key配置',
    canRetry: false
  },
  unknown: {
    icon: <AlertCircle className="w-5 h-5" />,
    title: '未知错误',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    suggestion: '发生未知错误，请重试或联系技术支持',
    canRetry: true
  }
};

interface ErrorMessageProps {
  error: string;
  type?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * 错误提示组件
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  type = 'unknown',
  onRetry,
  onDismiss
}) => {
  // 根据错误消息自动检测错误类型
  const detectErrorType = (errorMessage: string): ErrorType => {
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
      return 'network';
    }
    if (lowerError.includes('timeout') || lowerError.includes('超时')) {
      return 'timeout';
    }
    if (lowerError.includes('parse') || lowerError.includes('json') || lowerError.includes('解析')) {
      return 'parse';
    }
    if (lowerError.includes('permission') || lowerError.includes('unauthorized') || lowerError.includes('401') || lowerError.includes('403')) {
      return 'permission';
    }

    return 'unknown';
  };

  const errorType = type || detectErrorType(error);
  const config = ERROR_CONFIGS[errorType];

  return (
    <div className={`mx-auto max-w-2xl my-4 p-4 rounded-lg border ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className={config.color}>
          {config.icon}
        </div>

        {/* 内容 */}
        <div className="flex-1">
          <h4 className={`font-semibold ${config.color} mb-1`}>
            {config.title}
          </h4>

          <p className="text-sm text-gray-700 mb-2">
            {error}
          </p>

          <p className="text-xs text-gray-600 mb-3">
            💡 {config.suggestion}
          </p>

          {/* 操作按钮 */}
          {config.canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              重试
            </button>
          )}
        </div>

        {/* 关闭按钮 */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
