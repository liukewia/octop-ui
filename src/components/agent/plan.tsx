import { Circle, CircleCheck, CircleDashed, CircleX, LoaderCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { normalizeAgentStatus, type AgentStepStatus } from './trace';

export interface AgentPlanItem {
  key?: React.Key;
  title: React.ReactNode;
  description?: React.ReactNode;
  status?: AgentStepStatus | 'wait' | 'process' | 'finish' | 'skipped';
}

export interface AgentPlanProps {
  items: AgentPlanItem[];
  title?: React.ReactNode;
  /** 顶部进度条 + n/m，默认开 */
  progress?: boolean;
  /** 已完成的条目划掉 */
  strikeDone?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function iconFor(status: AgentStepStatus | 'skipped', skipped?: boolean) {
  if (skipped) return <CircleDashed className="size-4 text-fg-disabled" aria-hidden />;
  if (status === 'running') return <LoaderCircle className="size-4 animate-spin text-accent [animation-duration:525ms]" aria-hidden />;
  if (status === 'success') return <CircleCheck className="size-4 text-success" aria-hidden />;
  if (status === 'error') return <CircleX className="size-4 text-danger" aria-hidden />;
  return <Circle className="size-4 text-fg-disabled" aria-hidden />;
}

/**
 * 计划：先摆出要做哪几步，再逐条点亮。
 * 顶部只给一个进度条和 n/m —— 计划是承诺，不是仪表盘。
 */
export function AgentPlan({
  items,
  title = '计划',
  progress = true,
  strikeDone = false,
  className,
  style,
}: AgentPlanProps) {
  const done = items.filter(
    (i) => i.status !== 'skipped' && normalizeAgentStatus(i.status as AgentStepStatus) === 'success',
  ).length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-2.5', className)} style={style}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-fg-secondary">{title}</span>
          <span className="flex-none text-xs tabular-nums text-fg-tertiary">
            {done}/{items.length}
          </span>
        </div>
        {progress && (
          <span className="flex h-1 w-full overflow-hidden rounded-full bg-muted">
            <span
              className={cn(
                'h-full rounded-full transition-[width] duration-[300ms] ease-standard',
                percent === 100 ? 'bg-success' : 'bg-accent',
              )}
              style={{ width: `${percent}%` }}
            />
          </span>
        )}
      </div>

      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {items.map((item, i) => {
          const skipped = item.status === 'skipped';
          const status = normalizeAgentStatus(item.status as AgentStepStatus);
          return (
            <li key={item.key ?? i} className="flex min-w-0 items-start gap-2" data-status={status}>
              <span className="mt-0.5 flex-none">{iconFor(status, skipped)}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span
                  className={cn(
                    'min-w-0 text-sm leading-snug',
                    skipped
                      ? 'text-fg-disabled line-through'
                      : status === 'success'
                        ? 'text-fg-secondary'
                        : status === 'pending'
                          ? 'text-fg-tertiary'
                          : 'text-fg',
                    strikeDone && status === 'success' && 'line-through',
                  )}
                >
                  {item.title}
                </span>
                {item.description && (
                  <span className="min-w-0 text-xs leading-relaxed text-fg-tertiary">{item.description}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
