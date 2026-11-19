import { forwardRef, useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/cn';

export interface RateProps {
  value?: number;
  defaultValue?: number;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  character?: React.ReactNode;
  tooltips?: string[];
  onChange?: (value: number) => void;
  onHoverChange?: (value: number) => void;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export const Rate = forwardRef<HTMLDivElement, RateProps>(function Rate(
  {
    value,
    defaultValue = 0,
    count = 5,
    allowHalf,
    allowClear = true,
    disabled,
    character,
    tooltips,
    onChange,
    onHoverChange,
    className,
    style,
    size = 20,
  },
  ref,
) {
  const [inner, setInner] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const current = value ?? inner;
  const display = hover ?? current;

  const set = (next: number) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label="评分"
      className={cn('inline-flex items-center gap-1', disabled && 'cursor-not-allowed', className)}
      style={style}
      onMouseLeave={() => {
        setHover(null);
        onHoverChange?.(0);
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        const index = i + 1;
        const filled = display >= index;
        const half = !filled && allowHalf && display >= index - 0.5;
        return (
          <span
            key={i}
            role="radio"
            aria-checked={Math.ceil(current) === index}
            aria-label={tooltips?.[i] ?? `${index} 星`}
            tabIndex={disabled ? -1 : 0}
            title={tooltips?.[i]}
            onMouseMove={(e) => {
              if (disabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const isLeft = e.clientX - rect.left < rect.width / 2;
              const next = allowHalf && isLeft ? index - 0.5 : index;
              setHover(next);
              onHoverChange?.(next);
            }}
            onClick={(e) => {
              if (disabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const isLeft = e.clientX - rect.left < rect.width / 2;
              const next = allowHalf && isLeft ? index - 0.5 : index;
              set(allowClear && next === current ? 0 : next);
            }}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                set(allowClear && index === current ? 0 : index);
              }
              if (e.key === 'ArrowRight') set(Math.min(count, current + 1));
              if (e.key === 'ArrowLeft') set(Math.max(0, current - 1));
            }}
            className="ax-focus relative inline-grid cursor-pointer place-items-center rounded-[4px] outline-none"
            style={{ width: size, height: size }}
          >
            <span className="absolute inset-0 text-line-strong">
              <span className="block size-full" style={{ width: size, height: size }}>
                {character ?? <Star className="size-full" strokeWidth={1.5} fill="currentColor" />}
              </span>
            </span>
            <span
              className="absolute inset-y-0 left-0 overflow-hidden text-accent"
              style={{ width: half ? size / 2 : filled ? size : 0 }}
            >
              <span className="block" style={{ width: size, height: size }}>
                {character ?? <Star className="size-full" strokeWidth={1.5} fill="currentColor" />}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
});
