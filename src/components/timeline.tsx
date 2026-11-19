import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface TimelineItemType {
  key?: React.Key;
  children?: React.ReactNode;
  color?: 'blue' | 'red' | 'green' | 'gray' | string;
  dot?: React.ReactNode;
  label?: React.ReactNode;
  position?: 'left' | 'right';
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items?: TimelineItemType[];
  mode?: 'left' | 'right' | 'alternate';
  pending?: React.ReactNode;
  pendingDot?: React.ReactNode;
  reverse?: boolean;
}

const DOT_COLOR: Record<string, string> = {
  blue: 'var(--ax-info)',
  red: 'var(--ax-danger)',
  green: 'var(--ax-success)',
  gray: 'var(--ax-fg-disabled)',
};

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { items = [], mode = 'left', pending, pendingDot, reverse, className, children, ...rest },
  ref,
) {
  const list = reverse ? [...items].reverse() : items;
  const alternate = mode === 'alternate';

  const renderItem = (item: TimelineItemType, index: number) => {
    const dotColor = item.color ? (DOT_COLOR[item.color] ?? item.color) : 'var(--ax-line-strong)';
    const onRight = alternate && index % 2 === 1;
    return (
      <li key={item.key ?? index} className="relative flex gap-3 pb-5 last:pb-0">
        {alternate && (
          <div className="w-1/2 shrink-0 pb-1 text-end text-sm text-fg-tertiary">{onRight ? null : item.label}</div>
        )}
        <div className="relative flex flex-col items-center">
          <span
            className="z-10 mt-1 grid size-2.5 shrink-0 place-items-center rounded-full"
            style={{
              background: item.dot ? undefined : dotColor,
              // 实心圆 + 一圈面色，压住背后的连接线；不是甜甜圈
              boxShadow: item.dot ? undefined : '0 0 0 3px var(--ax-surface)',
            }}
          >
            {item.dot}
          </span>
          {index < list.length - 1 && (
            <span className="absolute top-4 h-[calc(100%-8px)] w-px bg-line-strong" aria-hidden />
          )}
        </div>
        <div className={cn('min-w-0 flex-1 pb-1', alternate && 'w-1/2')}>
          {!alternate && item.label && <div className="mb-0.5 text-xs text-fg-tertiary">{item.label}</div>}
          <div className="text-base text-fg">{item.children}</div>
          {alternate && onRight && item.label && (
            <div className="mt-0.5 text-xs text-fg-tertiary">{item.label}</div>
          )}
        </div>
      </li>
    );
  };

  return (
    <ol ref={ref} className={cn('m-0 list-none p-0', className)} {...rest}>
      {list.map(renderItem)}
      {children}
      {pending !== undefined && (
        <li className="relative flex gap-3">
          <div className="relative flex flex-col items-center">
            <span className="z-10 mt-1 grid size-2.5 place-items-center rounded-full">
              {pendingDot ?? <span className="ax-spinner size-2.5 text-fg-tertiary" />}
            </span>
          </div>
          <div className="pb-1 text-base text-fg-secondary">{pending}</div>
        </li>
      )}
    </ol>
  );
});
