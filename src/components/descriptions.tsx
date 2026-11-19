import { Children, forwardRef, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface DescriptionsItemType {
  key?: React.Key;
  label?: React.ReactNode;
  children?: React.ReactNode;
  span?: number;
}

export interface DescriptionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  items?: DescriptionsItemType[];
  column?: number | Record<string, number>;
  bordered?: boolean;
  size?: 'default' | 'middle' | 'small';
  layout?: 'horizontal' | 'vertical';
  colon?: boolean;
  labelStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

const DescriptionsRoot = forwardRef<HTMLDivElement, DescriptionsProps>(function Descriptions(
  {
    title,
    extra,
    items,
    column = 3,
    bordered,
    size = 'default',
    layout = 'horizontal',
    colon = true,
    labelStyle,
    contentStyle,
    className,
    children,
    ...rest
  },
  ref,
) {
  const cols = typeof column === 'number' ? column : 3;
  const sizeCls = size === 'small' ? 'px-3 py-2 text-sm' : size === 'middle' ? 'px-4 py-2.5' : 'px-4 py-3';

  const fromChildren: DescriptionsItemType[] = [];
  if (!items && children) {
    const walk = (nodes: ReactNode) => {
      Children.forEach(nodes, (node) => {
        if (!isValidElement(node)) return;
        const element = node as ReactElement<DescriptionsItemType>;
        if (element.type === DescriptionsItem) fromChildren.push(element.props);
        else if (element.props?.children) walk(element.props.children as ReactNode);
      });
    };
    walk(children);
  }
  const list = items ?? fromChildren;

  return (
    <div ref={ref} className={cn('w-full', className)} {...rest}>
      {(title || extra) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-fg">{title}</div>
          {extra}
        </div>
      )}
      <div
        className={cn(
          'grid',
          bordered && 'overflow-hidden rounded-container border border-line',
        )}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {list.map((item, index) => {
          const span = item.span ?? 1;
          return (
            <div
              key={item.key ?? index}
              className={cn(
                'flex min-w-0',
                layout === 'vertical' ? 'flex-col gap-1' : 'items-baseline gap-3',
                bordered && 'border-line-soft [&:not(:last-child)]:border-b',
                !bordered && 'py-1.5',
                bordered && sizeCls,
              )}
              style={{ gridColumn: `span ${Math.min(span, cols)} / span ${Math.min(span, cols)}` }}
            >
              <div
                className={cn(
                  'shrink-0 text-fg-secondary',
                  layout === 'vertical' ? 'text-xs' : 'w-[92px] text-end',
                  bordered && layout === 'horizontal' && 'bg-muted-soft px-3 py-1',
                )}
                style={labelStyle}
              >
                {item.label}
                {colon && layout === 'horizontal' ? '：' : ''}
              </div>
              <div className={cn('min-w-0 flex-1 break-words text-fg')} style={contentStyle}>
                {item.children}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export const DescriptionsItem = forwardRef<HTMLDivElement, DescriptionsItemType>(
  function DescriptionsItem(_props, _ref) {
    return null;
  },
);

export const Descriptions = Object.assign(DescriptionsRoot, { Item: DescriptionsItem });
