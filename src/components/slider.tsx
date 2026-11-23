import { forwardRef, useState } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../lib/cn';

export type SliderValue = number | number[];

export interface SliderMarks {
  [key: number]: React.ReactNode | { style?: React.CSSProperties; label: React.ReactNode };
}

export interface SliderProps {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onChange?: (value: SliderValue) => void;
  onChangeComplete?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  range?: boolean;
  vertical?: boolean;
  reverse?: boolean;
  dots?: boolean;
  marks?: SliderMarks;
  tooltip?: { formatter?: (value?: number) => React.ReactNode; open?: boolean };
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'aria-label'?: string;
}

export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onChange,
    onChangeComplete,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    range,
    vertical,
    reverse,
    dots,
    marks,
    tooltip,
    className,
    style,
    id,
    ...aria
  },
  ref,
) {
  const initial = range ? [min, max] : min;
  const [inner, setInner] = useState<SliderValue>(defaultValue ?? value ?? initial);
  const current = value ?? inner;
  const values = Array.isArray(current) ? current : [current];
  const markPosition = (key: string) => {
    const percent = max === min ? 0 : ((Number(key) - min) / (max - min)) * 100;
    return `${Boolean(vertical) !== Boolean(reverse) ? 100 - percent : percent}%`;
  };
  const [dragging, setDragging] = useState(false);

  const commit = (next: SliderValue) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  return (
    <div
      className={cn(
        'relative w-full',
        vertical ? 'inline-flex h-44 w-auto flex-col items-center' : 'py-1.5',
        disabled && 'opacity-50',
        className,
      )}
      style={style}
    >
      <SliderPrimitive.Root
        ref={ref}
        id={id}
        value={Array.isArray(current) ? current : [current]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        orientation={vertical ? 'vertical' : 'horizontal'}
        inverted={reverse}
        minStepsBetweenThumbs={1}
        onValueChange={(next) => commit(next.length > 1 ? next : next[0])}
        onValueCommit={(next) => {
          setDragging(false);
          onChangeComplete?.(next.length > 1 ? next : next[0]);
        }}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onLostPointerCapture={() => setDragging(false)}
        className={cn(
          'relative flex touch-none select-none items-center',
          vertical ? 'h-full w-auto flex-col' : 'h-3 w-full',
        )}
        aria-label={aria['aria-label']}
      >
        <SliderPrimitive.Track
          className={cn('relative overflow-visible rounded-full bg-track', vertical ? 'h-full w-1' : 'h-1 w-full')}
        >
          <SliderPrimitive.Range
            className={cn('absolute rounded-full bg-accent', vertical ? 'w-full' : 'h-full')}
          />
          {dots && marks && Object.keys(marks).map((key) => (
            <span
              key={key}
              aria-hidden
              className={cn(
                'pointer-events-none absolute size-1 rounded-full bg-fg-tertiary',
                vertical ? 'left-1/2 -translate-x-1/2 -translate-y-1/2' : 'top-1/2 -translate-x-1/2 -translate-y-1/2',
              )}
              style={vertical ? { top: markPosition(key) } : { left: markPosition(key) }}
            />
          ))}
        </SliderPrimitive.Track>
        {values.map((val, index) => (
          <SliderPrimitive.Thumb
            key={index}
            aria-label={`${aria['aria-label'] ?? '值'} ${index + 1}`}
            className={cn(
              'ax-focus group relative block size-5 rounded-full bg-surface outline-none',
              // 圆心落在轨道中心，改轨道粗细也不会偏心
              'ring-0 transition-shadow duration-[125ms]',
            )}
          >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-accent shadow-[0_0_0_2px_var(--ax-surface)]" />
            <span
              className={cn(
                'pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-inner bg-accent px-1.5 py-0.5 text-2xs font-medium tabular-nums text-on-accent',
                'opacity-0 transition-opacity duration-[125ms]',
                (tooltip?.open ?? dragging) && 'opacity-100',
                tooltip?.open === undefined && 'group-hover:opacity-100 group-focus-visible:opacity-100',
                vertical ? 'top-full mt-2' : '-top-8',
              )}
            >
              {tooltip?.formatter ? tooltip.formatter(val) : val}
            </span>
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>

      {marks && (
        <div className={cn('relative', vertical ? 'absolute inset-y-0 left-6 w-20' : 'mt-2 h-4 w-full')}>
          {Object.entries(marks).map(([key, label]) => {
            const text =
              typeof label === 'object' && label !== null && 'label' in label
                ? (label as { label: React.ReactNode }).label
                : (label as React.ReactNode);
            return (
              <span
                key={key}
                className={cn('absolute whitespace-nowrap text-xs text-fg-tertiary', vertical ? '-translate-y-1/2' : '-translate-x-1/2')}
                style={vertical ? { top: markPosition(key) } : { left: markPosition(key) }}
              >
                {text}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});
