import { Check, ShieldAlert, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../button';

export type AgentConfirmStatus = 'pending' | 'approved' | 'denied';

export interface AgentConfirmationParam {
  label: React.ReactNode;
  value: React.ReactNode;
  /** 这一项会影响生产 / 不可回滚 */
  danger?: boolean;
}

export interface AgentConfirmationProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** 要执行的工具名，用等宽字显示 */
  tool?: React.ReactNode;
  /** 参数清单：键值一行一对 */
  params?: AgentConfirmationParam[];
  children?: React.ReactNode;
  status?: AgentConfirmStatus;
  approveText?: React.ReactNode;
  denyText?: React.ReactNode;
  onApprove?: () => void;
  onDeny?: () => void;
  /** 危险操作：图标与参数里的危险项用红色 */
  danger?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 执行前的确认卡。三个信息必须在一屏里给全：
 * 做什么（tool + 参数）、影响什么（danger 行）、拒绝会怎样（按钮文案）。
 * 确认之后卡片自己变成一行结论，不留在那里当摆设。
 */
export function AgentConfirmation({
  title = '需要你确认',
  description,
  tool,
  params,
  children,
  status = 'pending',
  approveText = '允许执行',
  denyText = '拒绝',
  onApprove,
  onDeny,
  danger,
  className,
  style,
}: AgentConfirmationProps) {
  const resolved = status !== 'pending';

  return (
    <div
      data-status={status}
      className={cn('flex w-full min-w-0 flex-col overflow-hidden rounded-container border border-line bg-surface', className)}
      style={style}
    >
      <div className="flex min-w-0 items-start gap-2.5 px-3.5 pb-2.5 pt-3">
        <span
          className={cn(
            'inline-flex size-7 flex-none items-center justify-center rounded-element',
            danger ? 'bg-[var(--ax-danger-bg)] text-[var(--ax-danger-fg)]' : 'bg-muted text-fg-secondary',
          )}
        >
          <ShieldAlert className="size-4" aria-hidden />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-fg">{title}</span>
            {tool && (
              <code className="rounded-[4px] bg-muted px-1.5 py-0.5 font-mono text-[11px] text-fg-secondary">
                {tool}
              </code>
            )}
          </div>
          {description && <p className="m-0 text-xs leading-relaxed text-fg-secondary">{description}</p>}
        </div>
      </div>

      {(params?.length || children) && (
        <div className="px-3.5 pb-3">
          {params && params.length > 0 && (
            <dl className="m-0 flex flex-col rounded-element bg-canvas px-2.5 py-1">
              {params.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex min-w-0 items-baseline gap-3 py-1.5',
                    i > 0 && 'border-t border-line',
                  )}
                >
                  <dt className="w-[84px] flex-none text-[11px] text-fg-tertiary">{p.label}</dt>
                  <dd
                    className={cn(
                      'm-0 min-w-0 flex-1 break-words font-mono text-xs',
                      p.danger ? 'text-danger' : 'text-fg',
                    )}
                  >
                    {p.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {children}
        </div>
      )}

      {resolved ? (
        <div
          className={cn(
            'flex items-center gap-1.5 border-t border-line px-3.5 py-2 text-xs',
            status === 'approved' ? 'text-success' : 'text-fg-tertiary',
          )}
        >
          {status === 'approved' ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
          {status === 'approved' ? '已允许，继续执行' : '已拒绝，这条分支不再往下走'}
        </div>
      ) : (
        <div className="flex items-center justify-end gap-1.5 border-t border-line px-3 py-2">
          <Button size="small" onClick={onDeny}>
            {denyText}
          </Button>
          <Button size="small" type="primary" onClick={onApprove}>
            {approveText}
          </Button>
        </div>
      )}
    </div>
  );
}
