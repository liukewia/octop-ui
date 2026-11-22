import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Tooltip } from '../tooltip';

export interface CitationProps {
  /** 上标序号，与 CitationList 里的条目对齐 */
  index?: number;
  /** 悬停时展示的来源名 */
  title?: React.ReactNode;
  url?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 行内引用标记：一个 `[n]` 小方块，悬停出全名。
 * 不做角标气泡 —— 正文里的引用要能「读过去」，不能把行高顶开。
 */
export function Citation({ index, title, url, onClick, className, style }: CitationProps) {
  const label = index === undefined ? '来源' : String(index);
  const classes = cn(
    'ax-press ax-focus mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-[4px] bg-muted px-1 align-super text-[10px] font-medium text-fg-secondary no-underline tabular-nums transition-colors duration-[125ms] ease-standard hover:bg-muted-strong hover:text-fg',
    className,
  );

  const badge = url ? (
    <a href={url} target="_blank" rel="noreferrer" onClick={onClick} className={classes} style={style}>
      {label}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={classes} style={style}>
      {label}
    </button>
  );

  if (!title) return badge;
  return (
    <Tooltip title={title} placement="top">
      {badge}
    </Tooltip>
  );
}

export interface CitationItem {
  key?: React.Key;
  /** 不传则按数组顺序编号 */
  index?: number;
  title: React.ReactNode;
  url?: string;
  /** 摘录，一到两行 */
  snippet?: React.ReactNode;
  /** 站点名，默认从 url 里取 */
  domain?: React.ReactNode;
}

export interface CitationListProps {
  items: CitationItem[];
  title?: React.ReactNode;
  /** 双列适合宽屏；默认单列 */
  columns?: 1 | 2;
  onItemClick?: (item: CitationItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

function readDomain(url?: string) {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/** 来源列表：和正文里的 [n] 一一对应，序号用同一枚小方块 */
export function CitationList({
  items,
  title,
  columns = 1,
  onItemClick,
  className,
  style,
}: CitationListProps) {
  if (!items.length) return null;

  return (
    <div className={cn('min-w-0', className)} style={style}>
      {title && <div className="mb-2 text-xs font-medium text-fg-tertiary">{title}</div>}
      <ol
        className={cn(
          'm-0 grid list-none gap-x-6 gap-y-1 p-0',
          columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        )}
      >
        {items.map((item, position) => {
          const index = item.index ?? position + 1;
          const body = (
            <>
              <span className="mt-0.5 inline-flex h-4 min-w-4 flex-none items-center justify-center rounded-[4px] bg-muted px-1 text-[10px] font-medium text-fg-secondary tabular-nums">
                {index}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-base text-fg">
                  <span className="truncate">{item.title}</span>
                  {item.url && (
                    <ArrowUpRight className="size-3 flex-none text-fg-disabled opacity-0 transition-opacity duration-[125ms] ease-standard group-hover:opacity-100" />
                  )}
                </span>
                {(item.snippet || item.domain || item.url) && (
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-tertiary">
                    {(item.domain ?? readDomain(item.url)) && (
                      <span className="truncate">{item.domain ?? readDomain(item.url)}</span>
                    )}
                    {item.snippet && <span className="truncate">{item.snippet}</span>}
                  </span>
                )}
              </span>
            </>
          );

          const rowClass =
            'group flex min-w-0 items-start gap-2 rounded-element px-1 py-1 no-underline transition-colors duration-[125ms] ease-standard hover:bg-muted-soft';

          return (
            <li key={item.key ?? index} className="min-w-0">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={rowClass}
                  onClick={() => onItemClick?.(item, index)}
                >
                  {body}
                </a>
              ) : (
                <button
                  type="button"
                  className={cn(rowClass, 'w-full text-start')}
                  onClick={() => onItemClick?.(item, index)}
                >
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
