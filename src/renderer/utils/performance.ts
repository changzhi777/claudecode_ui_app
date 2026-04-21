/**
 * 性能优化工具函数
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 性能测量 Hook
 */
export function usePerformanceMeasure(name: string) {
  const startTime = useRef<number>();

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  }, [name]);

  return { start, end };
}

/**
 * 虚拟列表 Hook
 */
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

/**
 * 懒加载图片 Hook
 */
export function useLazyImage(src: string, threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, threshold]);

  return { imgRef, isVisible, imageSrc };
}

/**
 * 缓存函数结果 Hook
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  fn: T,
  deps: any[] = []
): T {
  return useCallback(fn, deps) as T;
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private measures: Map<string, number[]> = new Map();

  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0] as PerformanceMeasure;
    const duration = measure.duration;

    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);

    // 清理 marks
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);

    return duration;
  }

  getAverageMeasure(name: string): number {
    const durations = this.measures.get(name);
    if (!durations || durations.length === 0) {
      return 0;
    }
    return durations.reduce((sum, d) => sum + d, 0) / durations.length;
  }

  getAllMeasures(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};

    this.measures.forEach((durations, name) => {
      result[name] = {
        average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        count: durations.length,
      };
    });

    return result;
  }

  clear(): void {
    this.measures.clear();
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();
