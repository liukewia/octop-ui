import { cn } from '../lib/cn';

export type ProgressStatus = 'normal' | 'success' | 'exception' | 'active';

export interface ProgressProps {
  percent?: number;
  type?: 'line' | 'circle' | 'dashboard';
  status?: ProgressStatus;
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  size?: number | 'small' | 'default';
  format?: (percent?: number, successPercent?: number) => React.ReactNode;
  success?: { percent?: number; strokeColor?: string };
  steps?: number | { count: number; gap?: number };
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const STATUS_COLOR: Record<string, string | undefined> = {
  success: 'var(--ax-success)',
  exception: 'var(--ax-danger)',
};

export function Progress({
  percent = 0,
  type = 'line',
  status = 'normal',
  showInfo = true,
  strokeColor,
  trailColor,
  strokeWidth,
  size = 'default',
  format,
  success,
  steps,
  className,
  style,
  ...aria
}: ProgressProps) {
  const value = Math.min(100, Math.max(0, percent));
  const color = strokeColor ?? STATUS_COLOR[status] ?? 'var(--ax-accent)';
  const trail = trailColor ?? 'var(--ax-line-strong)';
  const label = format ? format(percent, success?.percent) : `${Math.round(value)}%`;

  if (type === 'line' && steps) {
    const count = typeof steps === 'number' ? steps : steps.count;
    const gap = typeof steps === 'number' ? 2 : (steps.gap ?? 2);
    const filled = Math.round((value / 100) * count);
    return (
      <div className={cn('flex w-full items-center gap-3', className)} style={style} {...aria}>
        <div className="flex w-full" style={{ gap }}>
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-[125ms]"
              style={{ background: i < filled ? color : trail }}
            />
          ))}
        </div>
        {showInfo && <span className="shrink-0 text-sm tabular-nums text-fg-secondary">{label}</span>}
      </div>
    );
  }

  if (type === 'line') {
    const height = typeof size === 'number' ? size : size === 'small' ? 4 : 6;
    return (
      <div
        className={cn('flex w-full items-center gap-3', className)}
        style={style}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={aria['aria-label']}
      >
        <div
          className="relative w-full overflow-hidden rounded-full"
          style={{ height, background: trail }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-[300ms] ease-standard"
            style={{
              width: `${value}%`,
              background: color,
              ...(status === 'active' ? { animation: 'ax-breathe 400ms steps(10,end) infinite alternate' } : null),
            }}
          />
        </div>
        {showInfo && <span className="shrink-0 text-sm tabular-nums text-fg-secondary">{label}</span>}
      </div>
    );
  }

  const box = typeof size === 'number' ? size : size === 'small' ? 64 : 104;
  const thickness = strokeWidth ?? (box <= 64 ? 5 : 8);
  const r = (box - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const gap = type === 'dashboard' ? circumference * 0.25 : 0;
  const dash = (circumference - gap) * (value / 100);
  const indicatorColor = STATUS_COLOR[status] ?? 'var(--ax-fg)';

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)} style={style} {...aria}>
      <div className="relative" style={{ width: box, height: box }}>
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="-rotate-90">
          <circle
            cx={box / 2}
            cy={box / 2}
            r={r}
            fill="none"
            stroke={trail}
            strokeWidth={thickness}
            strokeDasharray={`${circumference - gap} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-[300ms] ease-standard"
          />
        </svg>
        {showInfo && (
          <div className="absolute inset-0 grid place-items-center text-base font-medium tabular-nums" style={{ color: indicatorColor }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ProgressCircleProps extends ProgressProps {
  width?: number;
}

export function ProgressCircle({ width = 120, ...rest }: ProgressCircleProps) {
  return <Progress {...rest} type="circle" size={width} />;
}
