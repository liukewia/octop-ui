import { cn } from '../../lib/cn';
import { Tooltip } from '../tooltip';

export interface AgentContextSegment {
  key?: React.Key;
  label: React.ReactNode;
  value: number;
  /** 不传时按内置色序取 */
  color?: string;
}

export interface AgentContextProps {
  /** 已用 token */
  used: number;
  /** 窗口上限 */
  total: number;
  /** 分段构成（系统提示、工具、历史…），有就叠成一条彩条 */
  segments?: AgentContextSegment[];
  /** 超过这个比例转警示色，默认 0.8 */
  warnAt?: number;
  /** 条高度 */
  size?: 'small' | 'default';
  /** 是否显示「12.4k / 200k」这行字 */
  showLabel?: boolean;
  /** 悬浮说明的标题 */
  title?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const PALETTE = ['var(--ax-accent)', 'var(--ax-info)', 'var(--ax-success)', 'var(--ax-warning-ink)'];

function format(n: number) {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 100 ? Math.round(k) : k.toFixed(1)}k`;
}

/**
 * 上下文用量。一条细横条 + 一行数字，不画圆环 ——
 * 它是仪表盘上的一个读数，不是这一屏的主角。
 */
export function AgentContext({
  used,
  total,
  segments,
  warnAt = 0.8,
  size = 'default',
  showLabel = true,
  title = '上下文用量',
  className,
  style,
}: AgentContextProps) {
  const safeTotal = total || 1;
  const ratio = Math.min(1, Math.max(0, used / safeTotal));
  const warn = ratio >= warnAt;

  const parts =
    segments?.length
      ? segments.map((s, i) => ({ ...s, key: s.key ?? i, color: s.color ?? PALETTE[i % PALETTE.length] }))
      : [{ key: 'used', label: '已用', value: used, color: warn ? 'var(--ax-danger)' : 'var(--ax-accent)' }];

  const bar = (
    <span
      className={cn(
        'flex w-full overflow-hidden rounded-full bg-muted',
        size === 'small' ? 'h-1' : 'h-1.5',
      )}
    >
      {parts.map((p) => (
        <span
          key={p.key}
          className="h-full transition-[width] duration-[300ms] ease-standard"
          style={{ width: `${Math.min(100, (p.value / safeTotal) * 100)}%`, backgroundColor: p.color }}
        />
      ))}
    </span>
  );

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)} style={style}>
      <Tooltip
        placement="top"
        title={
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium">{title}</span>
            {parts.map((p) => (
              <span key={p.key} className="flex items-center gap-1.5 text-xs text-fg-secondary">
                <span className="size-1.5 flex-none rounded-full" style={{ backgroundColor: p.color }} />
                <span className="min-w-0 flex-1 truncate">{p.label}</span>
                <span className="tabular-nums text-fg-tertiary">{format(p.value)}</span>
              </span>
            ))}
          </div>
        }
      >
        <span className="block w-full cursor-default">{bar}</span>
      </Tooltip>

      {showLabel && (
        <span className="flex items-baseline justify-between gap-2 text-[11px] text-fg-tertiary">
          <span className="truncate">{title}</span>
          <span className={cn('flex-none tabular-nums', warn && 'text-danger')}>
            {format(used)} / {format(total)}
          </span>
        </span>
      )}
    </div>
  );
}
