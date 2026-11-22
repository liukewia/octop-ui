import { cn } from '../../lib/cn';

export type StatusDotType = 'success' | 'processing' | 'warning' | 'error' | 'default';

export interface StatusDotProps {
  status?: StatusDotType;
  /** 点后面的说明文字 */
  text?: React.ReactNode;
  /** 状态点外侧的呼吸环；processing 默认开 */
  pulse?: boolean;
  size?: 'small' | 'middle' | 'large';
  /** 覆盖颜色，用于自定义状态 */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const COLOR: Record<StatusDotType, string> = {
  success: 'var(--ax-success)',
  processing: 'var(--ax-info)',
  warning: 'var(--ax-warning-ink)',
  error: 'var(--ax-danger)',
  default: 'var(--ax-fg-disabled)',
};

const DOT_SIZE = { small: 6, middle: 8, large: 10 } as const;

/**
 * 状态点：一个实心圆 + 一条说明，比 Badge 更轻（没有底、没有描边）。
 * processing 用呼吸环而不是旋转，因为这里表达的是「还在跑」，不是「在加载」。
 */
export function StatusDot({
  status = 'default',
  text,
  pulse,
  size = 'middle',
  color,
  className,
  style,
}: StatusDotProps) {
  const fill = color ?? COLOR[status];
  const breathing = pulse ?? status === 'processing';
  const dot = DOT_SIZE[size];

  return (
    <span className={cn('inline-flex items-center gap-1.5 align-middle', className)} style={style}>
      <span className="relative inline-flex flex-none items-center justify-center" style={{ width: dot, height: dot }}>
        {breathing && (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full opacity-60"
            style={{ background: fill }}
          />
        )}
        <span
          aria-hidden
          className="relative rounded-full"
          style={{ width: dot, height: dot, background: fill }}
        />
      </span>
      {text !== undefined && text !== null && (
        <span className="min-w-0 truncate text-base text-fg-secondary">{text}</span>
      )}
    </span>
  );
}
