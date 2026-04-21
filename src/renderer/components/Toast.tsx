import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

const TOAST_ICONS = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
};

const TOAST_STYLES = {
  success: 'bg-green-500 border-green-600',
  error: 'bg-red-500 border-red-600',
  info: 'bg-blue-500 border-blue-600',
  warning: 'bg-yellow-500 border-yellow-600',
};

function ToastItem({ id, type, title, message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border text-white min-w-[320px] max-w-md animate-slide-in ${TOAST_STYLES[type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {TOAST_ICONS[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

let toastId = 0;
export const toast = {
  show: (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastId}`;
    const event = new CustomEvent('toast-show', {
      detail: { id, type, title, message, duration },
    });
    window.dispatchEvent(event);
    return id;
  },
  success: (title: string, message?: string) => toast.show('success', title, message),
  error: (title: string, message?: string) => toast.show('error', title, message),
  info: (title: string, message?: string) => toast.show('info', title, message),
  warning: (title: string, message?: string) => toast.show('warning', title, message),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleShow = (e: CustomEvent) => {
      setToasts((prev) => [...prev, e.detail]);
    };

    window.addEventListener('toast-show', handleShow as EventListener);
    return () => window.removeEventListener('toast-show', handleShow as EventListener);
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={handleClose} />
      ))}
    </div>,
    document.body
  );
}
