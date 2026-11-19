import { Check } from 'lucide-react';
import { cn } from '../lib/cn';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepItem {
  key?: React.Key;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StepStatus;
  disabled?: boolean;
}

export interface StepsProps {
  items?: StepItem[];
  current?: number;
  initial?: number;
  status?: 'wait' | 'process' | 'finish' | 'error';
  direction?: 'horizontal' | 'vertical';
  size?: 'default' | 'small';
  progressDot?: boolean | ((iconDot: React.ReactNode, info: { index: number; status: StepStatus }) => React.ReactNode);
  onChange?: (current: number) => void;
  className?: string;
  style?: React.CSSProperties;
  labelPlacement?: 'horizontal' | 'vertical';
}

export function Steps({
  items = [],
  current = 0,
  status = 'process',
  direction = 'horizontal',
  size = 'default',
  progressDot,
  onChange,
  className,
  style,
  labelPlacement = 'horizontal',
}: StepsProps) {
  const vertical = direction === 'vertical';
  const dot = size === 'small' ? 24 : 28;

  const statusOf = (index: number): StepStatus => {
    const item = items[index];
    if (item.status) return item.status;
    if (index < current) return 'finish';
    if (index === current) return status === 'error' ? 'error' : status === 'finish' ? 'finish' : 'process';
    return 'wait';
  };

  return (
    <ol
      className={cn(
        'm-0 flex list-none p-0',
        vertical ? 'flex-col gap-0' : 'flex-row items-start',
        className,
      )}
      style={style}
    >
      {items.map((item, index) => {
        const state = statusOf(index);
        const last = index === items.length - 1;
        const finish = state === 'finish';
        const process = state === 'process';
        const error = state === 'error';

        return (
          <li
            key={item.key ?? index}
            aria-current={process ? 'step' : undefined}
            className={cn(
              'relative min-w-0',
              vertical ? 'flex gap-3 pb-6 last:pb-0' : 'flex-1',
              !last && !vertical && 'pe-2',
              item.disabled && 'opacity-60',
            )}
          >
            {!last && (
              <span
                aria-hidden
                className={cn(
                  'absolute',
                  vertical ? 'left-[13px] top-7 bottom-0 w-px' : 'h-px',
                  finish ? 'bg-accent' : 'bg-line-strong',
                )}
                style={vertical ? undefined : { left: dot, right: 0, top: dot / 2 }}
              />
            )}
            <div className="flex items-start gap-2.5">
              <div className="relative flex flex-col items-center">
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => onChange?.(index)}
                  aria-label={typeof item.title === 'string' ? item.title : `第 ${index + 1} 步`}
                  className={cn(
                    'ax-focus relative z-10 grid shrink-0 place-items-center rounded-full text-sm font-medium transition-colors duration-[125ms]',
                    progressDot ? 'size-2' : '',
                    process && !progressDot && 'bg-accent text-on-accent',
                    finish && !progressDot && 'bg-muted text-fg',
                    !process && !finish && !progressDot && 'border border-line-strong text-fg-secondary',
                    error && !progressDot && 'bg-danger-bg text-danger-fg',
                    progressDot && (process || finish ? 'bg-accent' : 'bg-fg-disabled'),
                    item.disabled ? 'cursor-not-allowed' : onchangeCursor(!!onChange),
                  )}
                  style={progressDot ? undefined : { width: dot, height: dot }}
                >
                  {progressDot
                    ? null
                    : (item.icon ??
                      (finish ? <Check className="size-3.5" strokeWidth={3} /> : <span>{index + 1}</span>))}
                </button>
              </div>
              <div className={cn('min-w-0', vertical ? 'pt-0.5' : labelPlacement === 'vertical' ? 'pt-1' : 'pt-0.5', !vertical && 'pe-4')}>
                <div
                  className={cn(
                    'truncate text-base',
                    process || finish ? 'font-medium text-fg' : 'text-fg-secondary',
                    error && 'text-danger-fg',
                  )}
                >
                  {item.title}
                </div>
                {item.description && (
                  <div className="mt-0.5 text-sm leading-relaxed text-fg-tertiary">{item.description}</div>
                )}
              </div>
            </div>
            {progressDot && progressDot !== true && (
              <div className="mt-1 text-sm text-fg-tertiary">
                {progressDot(null, { index, status: state })}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function onchangeCursor(clickable: boolean) {
  return clickable ? 'cursor-pointer' : '';
}
