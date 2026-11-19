import { Children, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

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
  afterChange,
  beforeChange,
  initialSlide = 0,
  className,
  style,
  dotPosition = 'bottom',
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const [index, setIndex] = useState(initialSlide);

  const go = (next: number) => {
    let target = next;
    if (infinite) target = (next + count) % count;
    else target = Math.min(Math.max(0, next), count - 1);
    if (target === index) return;
    beforeChange?.(index, target);
    setIndex(target);
    afterChange?.(target);
  };

  useEffect(() => {
    if (!autoplay || count <= 1) return;
    const timer = window.setInterval(() => {
      beforeChange?.(index, (index + 1) % count);
      setIndex((prev) => (prev + 1) % count);
      afterChange?.((index + 1) % count);
    }, autoplaySpeed);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplaySpeed, count, index]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={cn('group relative overflow-hidden rounded-container bg-canvas', className)}
      style={style}
      role="region"
      aria-roledescription="carousel"
    >
      <div
        className="flex h-full transition-transform ease-standard"
        style={{ transform: `translateX(-${index * 100}%)`, transitionDuration: `${speed}ms` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full shrink-0" aria-hidden={i !== index}>
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
            'absolute flex gap-1.5',
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
                'h-1.5 rounded-full transition-all duration-[225ms] ease-standard',
                i === index ? 'w-5 bg-accent' : 'w-1.5 bg-fg/30 hover:bg-fg/50',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
