import { Children, useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { useMediaQuery } from '../lib/hooks';

export interface CarouselProps {
  children?: React.ReactNode;
  autoplay?: boolean;
  autoplaySpeed?: number;
  dots?: boolean;
  arrows?: boolean;
  infinite?: boolean;
  speed?: number;
  easing?: string;
  afterChange?: (current: number) => void;
  beforeChange?: (from: number, to: number) => void;
  initialSlide?: number;
  className?: string;
  style?: React.CSSProperties;
  dotPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export function Carousel({
  children,
  autoplay = false,
  autoplaySpeed = 3000,
  dots = true,
  arrows = false,
  infinite = true,
  speed = 300,
  easing,
  afterChange,
  beforeChange,
  initialSlide = 0,
  className,
  style,
  dotPosition = 'bottom',
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const [{ index: requested, wrap }, setSlide] = useState({ index: initialSlide, wrap: false });
  const index = Math.max(0, Math.min(requested, count - 1));
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const go = useCallback((next: number) => {
    if (count <= 1) return;
    const target = infinite
      ? (next + count) % count
      : Math.min(Math.max(0, next), count - 1);
    if (target === index) return;
    beforeChange?.(index, target);
    setSlide({ index: target, wrap: next !== target });
    afterChange?.(target);
  }, [count, infinite, index, beforeChange, afterChange]);

  useEffect(() => {
    if (!autoplay || reducedMotion || count <= 1 || (!infinite && index === count - 1)) return;
    const timer = window.setTimeout(() => go(index + 1), autoplaySpeed);
    return () => window.clearTimeout(timer);
  }, [autoplay, autoplaySpeed, count, go, index, infinite, reducedMotion]);

  return (
    <div
      className={cn('group relative overflow-hidden rounded-container bg-canvas', className)}
      style={style}
      role="region"
      aria-roledescription="carousel"
    >
      <div
        className={cn('flex h-full ease-standard', wrap ? 'transition-none' : 'transition-transform')}
        style={{
          transform: `translateX(-${index * 100}%)`,
          transitionDuration: `${speed}ms`,
          transitionTimingFunction: easing,
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn('w-full shrink-0', wrap && i === index && speed > 0 && 'animate-in fade-in-0 duration-[180ms] ease-standard')}
            aria-hidden={i !== index}
          >
            {slide}
          </div>
        ))}
      </div>

      {arrows && count > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张"
            onClick={() => go(index - 1)}
            className="ax-press ax-focus absolute start-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-fg shadow-med backdrop-blur-sm transition-opacity hover:bg-surface"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={() => go(index + 1)}
            className="ax-press ax-focus absolute end-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-fg shadow-med backdrop-blur-sm transition-opacity hover:bg-surface"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}

      {dots && count > 1 && (
        <div
          className={cn(
            'absolute flex',
            dotPosition === 'bottom' && 'inset-x-0 bottom-3 justify-center',
            dotPosition === 'top' && 'inset-x-0 top-3 justify-center',
            dotPosition === 'left' && 'inset-y-0 start-3 flex-col justify-center',
            dotPosition === 'right' && 'inset-y-0 end-3 flex-col justify-center',
          )}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`第 ${i + 1} 张`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={cn(
                'ax-focus group/dot grid size-6 place-items-center rounded-full',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
