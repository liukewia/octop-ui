import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { ArrowUpRight, ChevronDown, Globe } from 'lucide-react';
import { cn } from '../../lib/cn';
import { HoverCard } from '../advanced/hover-card';
import { readDomain } from './sources';

export interface AgentWebSource {
  key?: React.Key;
  id?: string;
  title: ReactNode;
  url: string;
  /** 命中的那一两句 */
  snippet?: ReactNode;
  /** 站点图标；不给就用首字母色块顶上 */
  favicon?: string;
  domain?: ReactNode;
}

export type AgentWebSearchStatus = 'searching' | 'done';

/* ------------------------------------------------------------------ 图标 */

const HUES = [
  'bg-hue-gray-bg text-hue-gray-fg',
  'bg-hue-blue-bg text-hue-blue-fg',
  'bg-hue-teal-bg text-hue-teal-fg',
  'bg-hue-green-bg text-hue-green-fg',
  'bg-hue-purple-bg text-hue-purple-fg',
  'bg-hue-orange-bg text-hue-orange-fg',
  'bg-hue-pink-bg text-hue-pink-fg',
];

function hashCode(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * 站点图标。没有图标时用域名首字母配一块色 —— 比一枚灰色地球好认，
 * 也比拉一张可能 404 的 favicon 稳。
 */
export function AgentSiteIcon({ source, size = 16, className }: { source: AgentWebSource; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const domain = String(source.domain ?? readDomain(source.url) ?? '');
  const hue = HUES[hashCode(domain) % HUES.length];

  return (
    <span className={cn('inline-flex flex-none items-center justify-center', className)} style={{ width: size, height: size }} aria-hidden>
      {source.favicon && !failed ? (
        <img
          src={source.favicon}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full rounded-[4px] object-cover"
        />
      ) : (
        <span
          className={cn(
            'flex size-full items-center justify-center rounded-[4px] font-semibold uppercase leading-none',
            hue,
          )}
          style={{ fontSize: Math.max(8, Math.round(size * 0.56)) }}
        >
          {domain.replace(/^www\./, '').slice(0, 1) || '·'}
        </span>
      )}
    </span>
  );
}

/** 环形进度套在地球外面：搜索这一步的「还剩多少」 */
function GlobeRing({ value }: { value: number }) {
  const r = 7.7;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <span className="relative inline-flex size-[18px] flex-none items-center justify-center">
      <svg viewBox="0 0 20 20" className="absolute inset-0 size-[18px] -rotate-90" aria-hidden>
        <circle cx="10" cy="10" r={r} fill="none" stroke="var(--ax-line)" strokeWidth="1.4" />
        <circle
          cx="10"
          cy="10"
          r={r}
          fill="none"
          stroke="var(--ax-accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 320ms var(--ax-ease-standard)' }}
        />
      </svg>
      <Globe className="size-2.5 text-fg-secondary" strokeWidth={2.2} aria-hidden />
    </span>
  );
}

/* ------------------------------------------------------------------ 搜索条 */

export interface AgentWebSearchProps {
  /** 搜到的结果；搜索中可以是空数组，一条条往里长 */
  sources?: AgentWebSource[];
  /** antd 习惯的别名 */
  items?: AgentWebSource[];
  status?: AgentWebSearchStatus;
  /** 搜索中显示在标签里的查询词 */
  query?: string;
  /** 换掉默认文案（默认「正在搜索网页」/「已搜索 n 个来源」） */
  label?: ReactNode;
  /** 0~1 的进度；不传时按 sources / expect 自动算 */
  progress?: number;
  /** 卡片与引用是否开新页 */
  linked?: boolean;
  /** 搜索中预留几格占位 */
  expect?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSourceClick?: (source: AgentWebSource, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 一次联网搜索的「壳」：一颗搜索胶囊（环形进度 + 站点图标 + 条数），
 * 展开是来源卡片。搜索中占位格留着，结果一条条长进来，而不是最后一起蹦出来。
 */
export function AgentWebSearch({
  sources,
  items,
  status = 'searching',
  query,
  label,
  progress,
  linked = true,
  expect = 4,
  open,
  defaultOpen = false,
  onOpenChange,
  onSourceClick,
  className,
  style,
}: AgentWebSearchProps) {
  const list = sources ?? items ?? [];
  const [inner, setInner] = useState(defaultOpen);
  const expanded = open ?? inner;
  const searching = status === 'searching';
  const slots = searching ? Math.max(0, expect - list.length) : 0;
  const ratio = progress ?? (expect > 0 ? list.length / Math.max(expect, list.length) : 0);

  const setOpen = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };

  const heading = label ?? (searching ? '正在搜索网页' : `已搜索 ${list.length} 个来源`);

  return (
    <div
      data-slot="web-search"
      data-status={status}
      className={cn('flex w-full min-w-0 max-w-[560px] flex-col', className)}
      style={style}
    >
      <button
        type="button"
        onClick={() => setOpen(!expanded)}
        aria-expanded={expanded}
        aria-label={typeof heading === 'string' ? heading : '搜索来源'}
        className={cn(
          'ax-focus ax-press group/fan inline-flex h-9 max-w-full items-center gap-2 self-start rounded-full border border-line bg-surface ps-2 pe-2.5',
          'text-xs text-fg-secondary transition-colors duration-[125ms] ease-standard hover:border-line-strong hover:text-fg',
        )}
      >
        <GlobeRing value={searching ? ratio : 1} />

        <span className="flex min-w-0 items-center gap-1.5">
          <span className={cn('truncate font-medium', searching ? 'shimmer text-fg' : 'text-fg')}>{heading}</span>
          {searching && query && (
            <span className="hidden max-w-[180px] truncate text-fg-tertiary sm:inline">「{query}」</span>
          )}
        </span>

        {list.length > 0 && (
          <span className="ax-fan ms-0.5 inline-flex flex-none items-center">
            {list.slice(0, 3).map((source, i) => (
              <span
                key={source.key ?? source.id ?? source.url ?? i}
                className="ax-fan-item rounded-[5px] ring-2 ring-surface"
                style={{ zIndex: 3 - i } as React.CSSProperties}
              >
                <AgentSiteIcon source={source} size={16} />
              </span>
            ))}
          </span>
        )}

        <ChevronDown
          className={cn(
            'size-3.5 flex-none text-fg-tertiary transition-transform duration-[165ms] ease-standard',
            expanded && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="mt-2 grid min-w-0 gap-1.5 sm:grid-cols-2">
          {list.map((source, i) => {
            const domain = source.domain ?? readDomain(source.url);
            const body = (
              <>
                <span className="flex items-center gap-1.5 text-[11px] text-fg-tertiary">
                  <AgentSiteIcon source={source} size={12} />
                  <span className="min-w-0 truncate">{domain}</span>
                  {linked && (
                    <ArrowUpRight className="ms-auto size-3 flex-none opacity-0 transition-opacity duration-[125ms] group-hover/card:opacity-100" aria-hidden />
                  )}
                </span>
                <span className="line-clamp-2 min-w-0 text-xs font-medium leading-snug text-fg">{source.title}</span>
                {source.snippet && (
                  <span className="line-clamp-2 min-w-0 text-[11px] leading-relaxed text-fg-tertiary">{source.snippet}</span>
                )}
              </>
            );

            const shell =
              'group/card ax-focus flex min-w-0 flex-col gap-1 rounded-element border border-line bg-surface p-2.5 text-start no-underline transition-colors duration-[125ms] ease-standard hover:border-line-strong hover:bg-muted-soft';

            return linked ? (
              <a
                key={source.key ?? source.id ?? source.url ?? i}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => onSourceClick?.(source, i)}
                className={cn(shell, 'animate-in fade-in-0 slide-in-from-bottom-1 duration-[260ms] ease-standard')}
                style={{ animationDelay: `${Math.min(i, 6) * 55}ms`, animationFillMode: 'both' }}
              >
                {body}
              </a>
            ) : (
              <button
                key={source.key ?? source.id ?? source.url ?? i}
                type="button"
                onClick={() => onSourceClick?.(source, i)}
                className={cn(shell, 'animate-in fade-in-0 slide-in-from-bottom-1 duration-[260ms] ease-standard')}
                style={{ animationDelay: `${Math.min(i, 6) * 55}ms`, animationFillMode: 'both' }}
              >
                {body}
              </button>
            );
          })}

          {Array.from({ length: slots }).map((_, i) => (
            <div
              key={`slot-${i}`}
              aria-hidden
              className="flex min-h-[74px] flex-col justify-center gap-2 rounded-element border border-dashed border-line bg-canvas p-2.5"
            >
              <span className="h-2 w-1/3 animate-pulse rounded-full bg-muted" />
              <span className="h-2 w-4/5 animate-pulse rounded-full bg-muted" />
              <span className="h-2 w-2/3 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ 引用 */

export interface AgentWebSearchCitationProps {
  source: AgentWebSource;
  /** 编号引用时显示在域名前 */
  index?: number;
  linked?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 正文里的行内引用：站点图标 + 域名（+ 序号）。悬停给一张小卡，
 * 键盘用户可以直接点进原页面。
 */
export function AgentWebSearchCitation({
  source,
  index,
  linked = true,
  className,
  style,
}: AgentWebSearchCitationProps) {
  const domain = source.domain ?? readDomain(source.url);
  const inner = (
    <>
      <AgentSiteIcon source={source} size={12} />
      {index !== undefined && <span className="tabular-nums text-fg-tertiary">{index}</span>}
      <span className="max-w-[120px] truncate">{domain}</span>
    </>
  );

  const shell =
    'inline-flex max-w-full items-center gap-1 rounded-[5px] bg-muted px-1.5 py-[1px] align-[0.05em] text-[11px] font-medium text-fg-secondary no-underline transition-colors duration-[125ms] ease-standard hover:bg-muted-strong hover:text-fg';

  const chip = linked ? (
    <a href={source.url} target="_blank" rel="noreferrer" className={cn(shell, 'ax-focus', className)} style={style}>
      {inner}
    </a>
  ) : (
    <span className={cn(shell, className)} style={style}>
      {inner}
    </span>
  );

  if (!source.title && !source.snippet) return chip;

  return (
    <HoverCard
      placement="top"
      openDelay={100}
      className="inline-flex"
      content={
        <div className="flex w-[248px] flex-col gap-1.5 p-0.5">
          <div className="flex items-start gap-1.5">
            <AgentSiteIcon source={source} size={14} className="mt-0.5" />
            <span className="min-w-0 text-xs font-medium leading-snug text-fg">{source.title}</span>
          </div>
          {source.snippet && <p className="m-0 text-[11px] leading-relaxed text-fg-secondary">{source.snippet}</p>}
          <div className="flex items-center gap-1 text-[11px] text-fg-tertiary">
            <Globe className="size-3 flex-none" aria-hidden />
            <span className="min-w-0 truncate">{domain}</span>
          </div>
        </div>
      }
    >
      {chip}
    </HoverCard>
  );
}

/* ------------------------------------------------------------------ 回答 */

function countChars(node: ReactNode): number {
  if (node === null || node === undefined || typeof node === 'boolean') return 0;
  if (typeof node === 'string') return node.length;
  if (typeof node === 'number') return String(node).length;
  if (Array.isArray(node)) return node.reduce<number>((sum, child) => sum + countChars(child), 0);
  if (isValidElement(node)) return countChars((node.props as { children?: ReactNode }).children);
  return 0;
}

interface Budget {
  left: number;
  done: boolean;
}

function renderTyped(node: ReactNode, budget: Budget): ReactNode {
  if (node === null || node === undefined || typeof node === 'boolean') return null;

  if (typeof node === 'string') {
    if (budget.left <= 0) return null;
    const take = Math.min(node.length, budget.left);
    budget.left -= take;
    return node.slice(0, take);
  }

  if (typeof node === 'number') {
    return renderTyped(String(node), budget);
  }

  if (Array.isArray(node)) {
    return Children.map(node, (child) => renderTyped(child, budget));
  }

  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    // 没有文字的节点（引用、图标）整块落下，不等它「打字」
    if (props.children === undefined) return budget.left > 0 || budget.done ? node : null;

    if (countChars(props.children) > 0 && budget.left <= 0 && !budget.done) return null;

    return cloneElement(node as ReactElement<{ children?: ReactNode }>, undefined, renderTyped(props.children, budget));
  }

  return node;
}

export interface AgentWebSearchAnswerProps {
  /** 段落、列表、粗体都会逐字打出来；引用整块落下 */
  children: ReactNode;
  /** 显式给 true 才开始打字；不给就是静态全文 */
  play?: boolean;
  /** 平均每秒字符数，默认 42；落后越多追得越快 */
  speed?: number;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 搜索之后的回答：正文自己打字，引用不参与打字。
 * 新追加的段落会排队接着打，所以可以直接把流式增长的 children 丢进来。
 */
export function AgentWebSearchAnswer({
  children,
  play,
  speed = 42,
  onComplete,
  className,
  style,
}: AgentWebSearchAnswerProps) {
  const total = useMemo(() => countChars(children), [children]);
  const [typed, setTyped] = useState(() => (play ? 0 : total));
  const doneRef = useRef(false);

  // 不给 play 就是静态：正文之后又长了，也要立刻整段补上，不能停在旧长度
  useEffect(() => {
    if (!play) setTyped(total);
  }, [play, total]);

  useEffect(() => {
    if (!play) {
      doneRef.current = false;
      return undefined;
    }
    if (typed >= total) return undefined;

    const delay = 26 + Math.random() * 22;
    const cps = speed * (1 + Math.min(3, (total - typed) / 160));
    const step = Math.max(1, Math.round((cps * delay) / 1000));

    const id = window.setTimeout(() => setTyped((prev) => Math.min(total, prev + step)), delay);
    return () => window.clearTimeout(id);
  }, [play, typed, total, speed]);

  useEffect(() => {
    if (!play) return;
    if (typed >= total && !doneRef.current) {
      doneRef.current = true;
      onComplete?.();
    }
  }, [play, typed, total, onComplete]);

  const budget: Budget = { left: typed, done: typed >= total };

  return (
    <div
      data-slot="web-search-answer"
      className={cn(
        'min-w-0 text-md leading-[1.72] text-fg',
        '[&>p]:m-0 [&>p+p]:mt-2.5 [&_strong]:font-semibold [&_ul]:my-1 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:ps-5',
        className,
      )}
      style={style}
    >
      {typed > 0 ? renderTyped(children, budget) : null}
    </div>
  );
}
