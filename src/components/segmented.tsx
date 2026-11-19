import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface SegmentedOption {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SegmentedProps<ValueType = string | number> {
  options?: (SegmentedOption | string | number)[];
  value?: ValueType;
  defaultValue?: ValueType;
  onChange?: (value: ValueType) => void;
  block?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  shape?: 'default' | 'round';
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Astryx 的分段控件：灰槽（p4 / r10 / 40h）+ 滑块（24~32h / r6），
 * 滑块移动 225ms standard —— 比 antd 的 300ms easeInOut 更「落位」，
 * 桌面没有拖动透镜，用一次性落位最接近真站。
 */
export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  {
    options = [],
    value,
    defaultValue,
    onChange,
    block,
    disabled,
    size = 'middle',
    shape = 'default',
    className,
    style,
  },
  ref,
) {
  const normalized: SegmentedOption[] = options.map((option) =>
    typeof option === 'object' ? option : { label: option, value: option },
  );
  const [inner, setInner] = useState(defaultValue ?? normalized[0]?.value);
  const current = value ?? inner;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const active = container.querySelector<HTMLElement>('[data-segmented-active="true"]');
      if (!active) return;
      setThumb({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [current, normalized.length, block]);

  const height = size === 'small' ? 'h-8' : size === 'large' ? 'h-12' : 'h-10';
  const itemHeight = size === 'small' ? 'h-6' : size === 'large' ? 'h-10' : 'h-8';

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={cn(
        'relative inline-flex items-center gap-0.5 rounded-element bg-muted p-1',
        height,
        block && 'flex w-full',
        shape === 'round' && 'rounded-full',
        className,
      )}
      style={style}
    >
      {thumb.width > 0 && (
        <span
          aria-hidden
          className={cn(
            'absolute top-1 h-[calc(100%-8px)] rounded-inner bg-surface shadow-[0_0_0_1px_var(--ax-line-soft)]',
            'transition-[left,width] duration-[225ms] ease-standard',
            shape === 'round' && 'rounded-full',
          )}
          style={{ left: thumb.left, width: thumb.width }}
        />
      )}
      {normalized.map((option) => {
        const active = option.value === current;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled || option.disabled}
            data-segmented-active={active}
            onClick={() => {
              if (option.value === current) return;
              if (value === undefined) setInner(option.value);
              onChange?.(option.value);
            }}
            className={cn(
              'ax-focus relative z-10 inline-flex items-center justify-center gap-1.5 rounded-inner px-3 text-base transition-colors duration-[125ms]',
              itemHeight,
              block && 'flex-1',
              active ? 'font-semibold text-fg' : 'font-medium text-fg-secondary hover:text-fg',
              'disabled:cursor-not-allowed disabled:text-fg-disabled',
              shape === 'round' && 'rounded-full',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
});
