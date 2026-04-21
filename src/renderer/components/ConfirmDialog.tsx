import { createPortal } from 'react-dom';
import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const TYPE_STYLES = {
  danger: {
    icon: <AlertTriangle size={32} className="text-red-500" />,
    confirmBtn: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    icon: <AlertTriangle size={32} className="text-yellow-500" />,
    confirmBtn: 'bg-yellow-500 hover:bg-yellow-600',
  },
  info: {
    icon: <AlertTriangle size={32} className="text-blue-500" />,
    confirmBtn: 'bg-blue-500 hover:bg-blue-600',
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'info',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const styles = TYPE_STYLES[type];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCancel}
      />

      {/* 对话框 */}
      <div className="relative bg-bg-secondary rounded-2xl shadow-2xl border border-bg-tertiary max-w-md w-full mx-4 animate-scale-in">
        {/* 关闭按钮 */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 hover:bg-bg-tertiary rounded-lg transition-colors"
        >
          <X size={20} className="text-text-secondary" />
        </button>

        {/* 内容 */}
        <div className="p-6">
          {/* 图标 */}
          <div className="flex justify-center mb-4">
            {styles.icon}
          </div>

          {/* 标题 */}
          <h2 className="text-xl font-display font-medium text-text-primary text-center mb-3">
            {title}
          </h2>

          {/* 消息 */}
          <p className="text-text-secondary text-center mb-6">
            {message}
          </p>

          {/* 按钮 */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-bg-tertiary rounded-lg hover:bg-bg-tertiary transition-colors text-text-primary font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// 简化的 Hook
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'info'
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: () => {
          onConfirm();
          resolve(true);
          setDialog((prev) => ({ ...prev, isOpen: false }));
        },
      });
    });
  };

  const handleClose = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    dialog,
    confirm,
    handleClose,
  };
}
