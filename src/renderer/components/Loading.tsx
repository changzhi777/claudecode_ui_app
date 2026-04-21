import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 size={SIZE_MAP[size]} className="animate-spin text-color-primary" />
      {text && <p className="text-sm text-text-secondary">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

// 内联加载器
export function InlineLoading({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <Loader2 size={16} className="animate-spin" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}

// 骨架屏加载器
export function SkeletonLoader({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-bg-tertiary rounded animate-pulse"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}
