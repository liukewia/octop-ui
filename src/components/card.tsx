import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  size?: 'default' | 'small';
  cover?: React.ReactNode;
  actions?: React.ReactNode[];
  loading?: boolean;
  /** antd 5.24+ 的 variant，覆盖 bordered */
  variant?: 'outlined' | 'borderless';
  headStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    title,
    extra,
    bordered = true,
    hoverable,
    size = 'default',
    cover,
    actions,
    loading,
    variant,
    className,
    children,
    headStyle,
    bodyStyle,
    ...rest
  },
  ref,
) {
  const outlined = variant ? variant === 'outlined' : bordered;
  return (
    <div
      ref={ref}
      className={cn(
        // 卡片：12 圆角 + 8% 描边，没有任何投影
        'overflow-hidden rounded-container bg-surface',
        outlined && 'border border-line',
        hoverable && 'transition-[border-color,box-shadow] duration-[125ms] hover:border-line-strong hover:shadow-pop',
        className,
      )}
      {...rest}
    >
      {(title || extra) && (
        <div
          className={cn(
            'flex items-center justify-between gap-3',
            size === 'small' ? 'px-4 py-3' : 'px-5 py-4',
            outlined && 'border-b border-line-soft',
          )}
          style={headStyle}
        >
          <div className="min-w-0 truncate text-lg font-semibold text-fg">{title}</div>
          {extra && <div className="shrink-0">{extra}</div>}
        </div>
      )}
      {cover}
      <div className={cn(size === 'small' ? 'p-4' : 'p-5', !title && !cover && !extra && 'p-5')} style={bodyStyle}>
        {loading ? <CardSkeleton /> : children}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-stretch border-t border-line-soft">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex flex-1 items-center justify-center py-3 text-fg-secondary transition-colors hover:bg-muted-soft [&:not(:last-child)]:border-e [&:not(:last-child)]:border-line-soft"
            >
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="ax-skeleton h-4 w-1/3 animate-breathe" />
      <div className="ax-skeleton h-3 w-full animate-breathe" />
      <div className="ax-skeleton h-3 w-2/3 animate-breathe" />
    </div>
  );
}

export interface CardMetaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const CardMeta = forwardRef<HTMLDivElement, CardMetaProps>(function CardMeta(
  { avatar, title, description, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('flex items-start gap-3', className)} {...rest}>
      {avatar && <div className="shrink-0">{avatar}</div>}
      <div className="min-w-0">
        {title && <div className="truncate text-base font-medium text-fg">{title}</div>}
        {description && <div className="mt-0.5 text-sm text-fg-secondary">{description}</div>}
      </div>
    </div>
  );
});

export const Card = Object.assign(CardRoot, { Meta: CardMeta });
