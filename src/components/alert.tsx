import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../lib/cn';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  type?: AlertType;
  message?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  showIcon?: boolean;
  icon?: React.ReactNode;
  closable?: boolean;
  closeIcon?: React.ReactNode;
  onClose?: (e: React.MouseEvent) => void;
  action?: React.ReactNode;
  banner?: boolean;
  variant?: 'soft' | 'outline';
}

const HUE: Record<AlertType, { bg: string; fg: string; border: string }> = {
  info: { bg: 'var(--ax-hue-blue-bg)', fg: 'var(--ax-hue-blue-fg)', border: 'var(--ax-hue-blue-bg)' },
  success: { bg: 'var(--ax-hue-green-bg)', fg: 'var(--ax-hue-green-fg)', border: 'var(--ax-hue-green-bg)' },
  warning: { bg: 'var(--ax-hue-yellow-bg)', fg: 'var(--ax-hue-yellow-fg)', border: 'var(--ax-hue-yellow-bg)' },
  error: { bg: 'var(--ax-hue-red-bg)', fg: 'var(--ax-hue-red-fg)', border: 'var(--ax-hue-red-bg)' },
};

const DEFAULT_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

export function Alert({
  type = 'info',
  message,
  title,
  description,
  showIcon = false,
  icon,
  closable,
  closeIcon,
  onClose,
  action,
  banner,
  variant = 'soft',
  className,
  ...rest
}: AlertProps) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  const hue = HUE[type];
  const Icon = DEFAULT_ICON[type];
  const heading = title ?? message;

  return (
    <div
      role="alert"
      className={cn(
        // Astryx Banner：12 圆角、12/16 内边距、无描边，同族深字压在柔色底上
        'flex items-start gap-3 rounded-container px-4 py-3 text-base',
        banner && 'rounded-none',
        variant === 'outline' && 'border bg-transparent',
        className,
      )}
      style={{
        background: variant === 'outline' ? 'transparent' : hue.bg,
        color: hue.fg,
        borderColor: variant === 'outline' ? hue.bg : undefined,
      }}
      {...rest}
    >
      {(showIcon || icon) && (
        <span className="mt-0.5 shrink-0">
          {icon ?? <Icon className="size-4" style={{ color: hue.fg }} />}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {heading && <div className="font-medium leading-5">{heading}</div>}
        {description && (
          <div className={cn('text-sm leading-relaxed', heading ? 'mt-1' : '')}>{description}</div>
        )}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
      {closable && (
        <button
          type="button"
          aria-label="关闭"
          onClick={(e) => {
            onClose?.(e);
            setClosed(true);
          }}
          className="ax-focus -me-1 -mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-inner hover:bg-black/5 dark:hover:bg-white/10"
        >
          {closeIcon ?? <X className="size-3.5" />}
        </button>
      )}
    </div>
  );
}
