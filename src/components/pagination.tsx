import { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/cn';

export interface PaginationProps {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  simple?: boolean;
  showQuickJumper?: boolean;
  hideOnSinglePage?: boolean;
  size?: 'default' | 'small';
  className?: string;
  style?: React.CSSProperties;
  align?: 'start' | 'center' | 'end';
}

function rangeOf(current: number, pageSize: number, total: number): [number, number] {
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);
  return [start, end];
}

function pages(current: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const list: (number | 'gap')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(count - 1, current + 1);
  if (left > 2) list.push('gap');
  for (let i = left; i <= right; i += 1) list.push(i);
  if (right < count - 1) list.push('gap');
  list.push(count);
  return list;
}

export function Pagination({
  current,
  defaultCurrent = 1,
  pageSize,
  defaultPageSize = 10,
  total = 0,
  onChange,
  onShowSizeChange,
  showSizeChanger,
  pageSizeOptions = [10, 20, 50, 100],
  showTotal,
  simple,
  showQuickJumper,
  hideOnSinglePage,
  size = 'default',
  className,
  style,
  align = 'end',
}: PaginationProps) {
  const [innerPage, setInnerPage] = useState(defaultCurrent);
  const [innerSize, setInnerSize] = useState(defaultPageSize);
  const page = current ?? innerPage;
  const sizeValue = pageSize ?? innerSize;
  const count = Math.max(1, Math.ceil(total / sizeValue));

  if (hideOnSinglePage && count <= 1) return null;

  const go = (next: number) => {
    const target = Math.min(Math.max(1, next), count);
    if (current === undefined) setInnerPage(target);
    onChange?.(target, sizeValue);
  };

  const changeSize = (next: number) => {
    if (pageSize === undefined) setInnerSize(next);
    onShowSizeChange?.(page, next);
    onChange?.(1, next);
  };

  const itemCls = cn(
    'ax-press ax-focus inline-flex items-center justify-center rounded-element text-base tabular-nums transition-colors',
    size === 'small' ? 'h-8 min-w-8 px-1.5' : 'h-9 min-w-9 px-2',
  );

  if (simple) {
    return (
      <div className={cn('flex items-center gap-2', className)} style={style}>
        <button type="button" aria-label="上一页" disabled={page <= 1} onClick={() => go(page - 1)} className={cn(itemCls, 'text-fg-secondary hover:bg-muted disabled:text-fg-disabled')}>
          <ChevronLeft className="size-4" />
        </button>
        <span className="inline-flex h-9 items-center rounded-element bg-muted px-3 text-base tabular-nums text-fg">
          {page} / {count}
        </span>
        <button type="button" aria-label="下一页" disabled={page >= count} onClick={() => go(page + 1)} className={cn(itemCls, 'text-fg-secondary hover:bg-muted disabled:text-fg-disabled')}>
          <ChevronRight className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <nav
      aria-label="分页"
      className={cn(
        'flex flex-wrap items-center gap-2',
        align === 'start' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'end' && 'justify-end',
        className,
      )}
      style={style}
    >
      {showTotal && (
        <span className="me-auto text-sm text-fg-tertiary">
          {showTotal(total, rangeOf(page, sizeValue, total))}
        </span>
      )}
      <button
        type="button"
        aria-label="上一页"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className={cn(itemCls, 'text-fg-secondary hover:bg-muted-soft disabled:pointer-events-none disabled:text-fg-disabled')}
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages(page, count).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="inline-flex size-9 items-center justify-center text-fg-disabled">
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => go(item)}
            className={cn(
              itemCls,
              item === page
                ? 'bg-muted font-medium text-fg'
                : 'text-fg-secondary hover:bg-muted-soft',
            )}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="下一页"
        disabled={page >= count}
        onClick={() => go(page + 1)}
        className={cn(itemCls, 'text-fg-secondary hover:bg-muted-soft disabled:pointer-events-none disabled:text-fg-disabled')}
      >
        <ChevronRight className="size-4" />
      </button>
      {showSizeChanger && (
        <select
          aria-label="每页条数"
          value={sizeValue}
          onChange={(e) => changeSize(Number(e.target.value))}
          className="ax-field h-9 cursor-pointer px-2 text-sm text-fg-secondary outline-none"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option} 条/页
            </option>
          ))}
        </select>
      )}
      {showQuickJumper && (
        <span className="inline-flex items-center gap-1 text-sm text-fg-tertiary">
          跳至
          <input
            type="number"
            min={1}
            max={count}
            onKeyDown={(e) => {
              if (e.key === 'Enter') go(Number((e.target as HTMLInputElement).value));
            }}
            className="ax-field h-9 w-14 rounded-element px-2 text-center text-sm outline-none"
          />
          页
        </span>
      )}
    </nav>
  );
}
