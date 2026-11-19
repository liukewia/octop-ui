import { forwardRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

export interface BreadcrumbItemType {
  key?: React.Key;
  title?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  menu?: { items: { key: string; label: React.ReactNode }[] };
  className?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItemType[];
  separator?: React.ReactNode;
  params?: Record<string, unknown>;
  itemRender?: (
    item: BreadcrumbItemType,
    params: Record<string, unknown>,
    items: BreadcrumbItemType[],
    paths: string[],
  ) => React.ReactNode;
}

const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items = [], separator, params, itemRender, className, children, ...rest },
  ref,
) {
  const sep = separator ?? <ChevronRight className="size-3.5 shrink-0 text-fg-disabled" />;
  return (
    <nav ref={ref} aria-label="面包屑" className={cn('min-w-0', className)} {...rest}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm text-fg-tertiary">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.key ?? index} className="inline-flex items-center gap-1.5">
              {itemRender ? (
                itemRender(item, params ?? {}, items, [])
              ) : item.href || item.onClick ? (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(
                    'ax-focus rounded-inner px-0.5 transition-colors hover:text-fg',
                    last ? 'font-medium text-fg' : 'text-fg-tertiary',
                    item.className,
                  )}
                  aria-current={last ? 'page' : undefined}
                >
                  {item.title}
                </a>
              ) : (
                <span className={cn('px-0.5', last ? 'font-medium text-fg' : 'text-fg-tertiary', item.className)}>
                  {item.title}
                </span>
              )}
              {!last && sep}
            </li>
          );
        })}
        {children}
      </ol>
    </nav>
  );
});

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  href?: string;
  separator?: React.ReactNode;
}

const BreadcrumbItem = forwardRef<HTMLSpanElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { href, children, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn('inline-flex items-center gap-1.5', className)} {...rest}>
      {href ? (
        <a href={href} className="ax-focus rounded-inner text-fg-tertiary transition-colors hover:text-fg">
          {children}
        </a>
      ) : (
        <span>{children}</span>
      )}
      <ChevronRight className="size-3.5 text-fg-disabled" />
    </span>
  );
});

export const Breadcrumb = Object.assign(BreadcrumbRoot, { Item: BreadcrumbItem });
