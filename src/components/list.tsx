import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface ListProps<ItemType = any> extends React.HTMLAttributes<HTMLDivElement> {
  dataSource?: ItemType[];
  renderItem?: (item: ItemType, index: number) => React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  bordered?: boolean;
  split?: boolean;
  loading?: boolean;
  size?: 'default' | 'small' | 'large';
  itemLayout?: 'horizontal' | 'vertical';
  grid?: { gutter?: number | [number, number]; column?: number; xs?: number; sm?: number; md?: number; lg?: number };
  locale?: { emptyText?: React.ReactNode };
}

const ListRoot = forwardRef<HTMLDivElement, ListProps>(function List(
  {
    dataSource = [],
    renderItem,
    header,
    footer,
    bordered,
    split = true,
    loading,
    size = 'default',
    itemLayout = 'horizontal',
    grid,
    locale,
    className,
    children,
    ...rest
  },
  ref,
) {
  const padding = size === 'small' ? 'px-4 py-3' : size === 'large' ? 'px-6 py-5' : 'px-5 py-4';

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-container bg-surface',
        bordered && 'border border-line',
        className,
      )}
      {...rest}
    >
      {header && <div className={cn('border-b border-line-soft font-semibold text-fg', padding)}>{header}</div>}
      {loading ? (
        <div className="space-y-3 p-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="ax-skeleton size-9 animate-breathe rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="ax-skeleton h-3 w-1/3 animate-breathe" />
                <div className="ax-skeleton h-3 w-2/3 animate-breathe" />
              </div>
            </div>
          ))}
        </div>
      ) : dataSource.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-fg-disabled">
          {locale?.emptyText ?? '暂无数据'}
        </div>
      ) : grid ? (
        <div
          className="grid gap-3 p-4"
          style={{
            gridTemplateColumns: `repeat(${grid.column ?? 1}, minmax(0, 1fr))`,
            gap: typeof grid.gutter === 'number' ? grid.gutter : undefined,
          }}
        >
          {dataSource.map((item, index) => (
            <div key={index} className={cn(itemLayout === 'vertical' && 'flex flex-col')}>
              {renderItem?.(item, index)}
            </div>
          ))}
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {dataSource.map((item, index) => (
            <li
              key={index}
              className={cn(
                split && index > 0 && 'border-t border-line-soft',
                size === 'small' ? 'px-4 py-3' : 'px-5 py-4',
              )}
            >
              {renderItem?.(item, index)}
            </li>
          ))}
        </ul>
      )}
      {children}
      {footer && <div className={cn('border-t border-line-soft text-fg-secondary', padding)}>{footer}</div>}
    </div>
  );
});

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: React.ReactNode[];
  extra?: React.ReactNode;
  itemLayout?: 'horizontal' | 'vertical';
}

const ListItem = forwardRef<HTMLDivElement, ListItemProps>(function ListItem(
  { actions, extra, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('flex items-start gap-4', className)} {...rest}>
      <div className="min-w-0 flex-1">{children}</div>
      {extra && <div className="shrink-0">{extra}</div>}
      {actions && actions.length > 0 && (
        <ul className="m-0 flex shrink-0 list-none items-center gap-3 p-0 text-fg-secondary">
          {actions.map((action, i) => (
            <li key={i} className="flex items-center">
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export interface ListItemMetaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const ListItemMeta = forwardRef<HTMLDivElement, ListItemMetaProps>(function ListItemMeta(
  { avatar, title, description, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('flex min-w-0 items-start gap-3', className)} {...rest}>
      {avatar && <div className="shrink-0">{avatar}</div>}
      <div className="min-w-0 flex-1">
        {title && <div className="truncate text-base font-medium text-fg">{title}</div>}
        {description && <div className="mt-0.5 text-sm text-fg-secondary">{description}</div>}
      </div>
    </div>
  );
});

export const List = Object.assign(ListRoot, { Item: Object.assign(ListItem, { Meta: ListItemMeta }) });
