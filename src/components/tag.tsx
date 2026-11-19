import { forwardRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

export type PresetColor =
  | 'gray'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink';

/** antd 的历史色名映射到 Astryx 的十色板（Astryx 只有 10 个色相） */
const COLOR_ALIAS: Record<string, PresetColor> = {
  magenta: 'pink',
  volcano: 'red',
  gold: 'yellow',
  lime: 'yellow',
  geekblue: 'blue',
  success: 'green',
  processing: 'green',
  error: 'red',
  warning: 'yellow',
  default: 'gray',
};

function resolveColor(color?: string): { bg?: string; fg?: string; border?: string } {
  if (!color) return {};
  const name = COLOR_ALIAS[color] ?? color;
  if (['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'cyan', 'blue', 'purple', 'pink'].includes(name)) {
    return {
      bg: `var(--ax-hue-${name}-bg)`,
      fg: `var(--ax-hue-${name}-fg)`,
      border: 'transparent',
    };
  }
  // 自定义色：柔色底 + 同色深字，和 Astryx 的 Badge 语法一致
  return {
    bg: `color-mix(in srgb, ${color} 20%, var(--ax-surface))`,
    fg: `color-mix(in srgb, ${color} 78%, var(--ax-fg))`,
    border: 'transparent',
  };
}

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: PresetColor | string;
  closable?: boolean;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
  bordered?: boolean;
  icon?: React.ReactNode;
  /** 实心（antd 的 filled）：语义色用纯色底 */
  filled?: boolean;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { color, closable, onClose, bordered = false, icon, filled, className, children, style, ...rest },
  ref,
) {
  const token = resolveColor(color);
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex h-5 max-w-full items-center gap-1 rounded-full px-2 text-xs font-medium leading-none',
        !color && 'bg-muted text-fg-secondary',
        bordered && 'border border-line',
        className,
      )}
      style={{
        ...(token.bg ? { background: filled && color ? `var(--ax-${color})` : token.bg } : null),
        ...(token.fg ? { color: token.fg } : null),
        ...style,
      }}
      {...rest}
    >
      {icon}
      <span className="truncate">{children}</span>
      {closable && (
        <button
          type="button"
          aria-label="移除"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.(e);
          }}
          className="ax-focus -me-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
});

export interface CheckableTagProps extends Omit<TagProps, 'onClick' | 'color' | 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const CheckableTag = forwardRef<HTMLSpanElement, CheckableTagProps>(function CheckableTag(
  { checked, onChange, className, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => {
        onChange?.(!checked);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange?.(!checked);
        }
      }}
      className={cn(
        'ax-press ax-focus cursor-pointer select-none',
        checked ? 'bg-accent text-on-accent' : 'bg-muted text-fg-secondary',
        className,
      )}
      {...rest}
    />
  );
});

/* ------------------------------------------------------------------ Badge */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count?: React.ReactNode;
  dot?: boolean;
  showZero?: boolean;
  overflowCount?: number;
  status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
  text?: React.ReactNode;
  color?: string;
  size?: 'default' | 'small';
  offset?: [number, number];
}

const STATUS_COLOR = {
  success: 'var(--ax-success)',
  processing: 'var(--ax-info)',
  default: 'var(--ax-fg-disabled)',
  error: 'var(--ax-danger)',
  warning: 'var(--ax-warning)',
} as const;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    count,
    dot,
    showZero = false,
    overflowCount = 99,
    status,
    text,
    color,
    size = 'default',
    offset,
    className,
    children,
    ...rest
  },
  ref,
) {
  const numeric = typeof count === 'number' ? count : undefined;
  const hidden = !dot && (count === null || count === undefined || count === 0) && !showZero;
  const display =
    numeric !== undefined && numeric > overflowCount ? `${overflowCount}+` : count;

  const indicator = (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium leading-none tabular-nums',
        dot ? 'size-2' : size === 'small' ? 'h-4 min-w-4 px-1 text-2xs' : 'h-[18px] min-w-[18px] px-1.5 text-xs',
        !color && !status && 'bg-danger text-white',
        (count === 0 || hidden) && 'bg-fg-disabled',
        className,
      )}
      style={{
        background: color ?? (status ? STATUS_COLOR[status] : undefined),
        ...(offset ? { transform: `translate(${offset[0]}px, ${offset[1]}px)` } : null),
      }}
    >
      {!dot && !hidden && display}
    </span>
  );

  if (status) {
    return (
      <span ref={ref} className="inline-flex items-center gap-2 text-base text-fg" {...rest}>
        {indicator}
        {text && <span>{text}</span>}
      </span>
    );
  }

  if (!children) return indicator;

  return (
    <span ref={ref} className="relative inline-flex" {...rest}>
      {children}
      {!hidden && (
        <span className="absolute -end-1.5 -top-1.5 origin-bottom-left shadow-[0_0_0_2px_var(--ax-surface)]">
          {indicator}
        </span>
      )}
    </span>
  );
});
