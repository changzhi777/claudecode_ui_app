/**
 * 懒加载图片组件
 * 使用 Intersection Observer API 延迟加载图片
 */

import { useEffect, useRef, useState } from 'react';
import { Skeleton } from './Skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  threshold?: number;
}

export function LazyImage({ src, alt, className, threshold = 0.1 }: LazyImageProps) {
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

  return (
    <div ref={imgRef} className={className} style={{ minHeight: '100px' }}>
      {isVisible ? (
        <img src={imageSrc} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
}
