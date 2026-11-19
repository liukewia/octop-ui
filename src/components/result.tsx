import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../lib/cn';

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

export interface ResultProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  status?: ResultStatus;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
}

const STATUS: Record<
  string,
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; title: string }
> = {
  success: { icon: CheckCircle2, color: 'var(--ax-success)', title: '操作成功' },
  error: { icon: XCircle, color: 'var(--ax-danger)', title: '操作失败' },
  info: { icon: Info, color: 'var(--ax-info)', title: '提示' },
  warning: { icon: Info, color: 'var(--ax-warning)', title: '请注意' },
  '404': { icon: Info, color: 'var(--ax-fg-tertiary)', title: '404' },
  '403': { icon: Info, color: 'var(--ax-fg-tertiary)', title: '403' },
  '500': { icon: XCircle, color: 'var(--ax-danger)', title: '500' },
};

export function Result({
  status = 'info',
  title,
  subTitle,
  extra,
  icon,
  className,
  children,
  ...rest
}: ResultProps) {
  const config = STATUS[status] ?? STATUS.info;
  const Icon = config.icon;
  const isCode = status === '404' || status === '403' || status === '500';

  return (
    <div className={cn('flex flex-col items-center px-4 py-10 text-center', className)} {...rest}>
      <div className="mb-5">
        {icon ??
          (isCode ? (
            <div
              className="text-4xl font-semibold tabular-nums"
              style={{ color: config.color }}
            >
              {status}
            </div>
          ) : (
            <Icon className="size-12" style={{ color: config.color }} />
          ))}
      </div>
      <div className="text-xl font-semibold text-fg">{title ?? config.title}</div>
      {subTitle && <div className="mt-2 max-w-[520px] text-md leading-relaxed text-fg-secondary">{subTitle}</div>}
      {children}
      {extra && <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{extra}</div>}
    </div>
  );
}
