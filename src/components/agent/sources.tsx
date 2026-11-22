import { ArrowUpRight, Link2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { HoverCard } from '../advanced/hover-card';

export interface AgentSourceItem {
  key?: React.Key;
  /** 不传则按数组顺序编号 */
  index?: number;
  title: React.ReactNode;
  url?: string;
  domain?: React.ReactNode;
  /** 引用到的那一两句话 */
  snippet?: React.ReactNode;
}

/** 从 url 里取域名，去掉 www；解析失败返回 undefined */
export function readDomain(url?: string) {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export interface AgentInlineCitationProps {
  /** 上标序号，与 AgentSources 的条目对齐 */
  index: number;
  title?: React.ReactNode;
  url?: string;
  domain?: React.ReactNode;
  snippet?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 正文里的 [n]。悬停开一张小卡：标题、域名、摘录。
 * 没有来源信息时退化成纯序号，不假装能点。
 */
export function AgentInlineCitation({
  index,
  title,
  url,
  domain,
  snippet,
  className,
  style,
}: AgentInlineCitationProps) {
  const chip = cn(
    'ax-press ax-focus mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-[4px] bg-muted px-1 align-super text-[10px] font-medium text-fg-secondary no-underline tabular-nums transition-colors duration-[125ms] ease-standard hover:bg-muted-strong hover:text-fg',
    className,
  );

  const badge = url ? (
    <a href={url} target="_blank" rel="noreferrer" className={chip} style={style} aria-label={`来源 ${index}`}>
      {index}
    </a>
  ) : (
    <span className={chip} style={style}>
      {index}
    </span>
  );

  if (!title && !snippet) return badge;

  return (
    <HoverCard
      placement="top"
      openDelay={100}
      className="inline-flex"
      content={
        <div className="flex w-[248px] flex-col gap-1.5 p-0.5">
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 inline-flex size-4 flex-none items-center justify-center rounded-[4px] bg-muted text-[10px] font-medium tabular-nums text-fg-secondary">
              {index}
            </span>
            <span className="min-w-0 text-xs font-medium leading-snug text-fg">{title}</span>
          </div>
          {snippet && <p className="m-0 text-[11px] leading-relaxed text-fg-secondary">{snippet}</p>}
          <div className="flex items-center gap-1 text-[11px] text-fg-tertiary">
            <Link2 className="size-3 flex-none" aria-hidden />
            <span className="min-w-0 truncate">{domain ?? readDomain(url)}</span>
          </div>
        </div>
      }
    >
      {badge}
    </HoverCard>
  );
}

export interface AgentSourcesProps {
  items: AgentSourceItem[];
  title?: React.ReactNode;
  /** 宽屏两列 */
  columns?: 1 | 2;
  onItemClick?: (item: AgentSourceItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** 回答下面的来源列表：序号、标题、域名。点开就是原网页。 */
export function AgentSources({
  items,
  title = '来源',
  columns = 1,
  onItemClick,
  className,
  style,
}: AgentSourcesProps) {
  if (!items.length) return null;

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)} style={style}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-fg-tertiary">
        <Link2 className="size-3.5" aria-hidden />
        <span>{title}</span>
        <span className="tabular-nums text-fg-disabled">{items.length}</span>
      </div>

      <ol
        className={cn(
          'm-0 grid list-none gap-1 p-0',
          columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        )}
      >
        {items.map((item, i) => {
          const no = item.index ?? i + 1;
          const domain = item.domain ?? readDomain(item.url);
          const Row = item.url ? 'a' : 'button';
          return (
            <li key={item.key ?? i} className="min-w-0">
              <Row
                {...(item.url ? { href: item.url, target: '_blank', rel: 'noreferrer' } : { type: 'button' as const })}
                onClick={() => onItemClick?.(item, i)}
                className="ax-focus flex min-w-0 items-start gap-2 rounded-element px-1.5 py-1.5 text-start no-underline transition-colors duration-[125ms] ease-standard hover:bg-muted"
              >
                <span className="mt-0.5 inline-flex h-4 min-w-4 flex-none items-center justify-center rounded-[4px] bg-muted px-1 text-[10px] font-medium tabular-nums text-fg-secondary">
                  {no}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="min-w-0 truncate text-xs font-medium text-fg">{item.title}</span>
                  {domain && <span className="min-w-0 truncate text-[11px] text-fg-tertiary">{domain}</span>}
                </span>
                {item.url && (
                  <ArrowUpRight className="ms-auto mt-0.5 size-3 flex-none text-fg-disabled" aria-hidden />
                )}
              </Row>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
