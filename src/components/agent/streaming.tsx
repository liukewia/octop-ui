import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, RefreshCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Tooltip } from '../tooltip';

export type AgentStreamStatus = 'streaming' | 'done' | 'stopped';

export type AgentStreamFeedback = 'up' | 'down' | null;

/* ------------------------------------------------------------------ 解析
 * 流式渲染不能「先露出 ** 再合并」，所以不能对着半截字符串跑 markdown。
 * 做法：全文一次解析成 block → token，token 记下自己在原文里的起止偏移；
 * 渲染时按「已揭示到第几个字符」裁剪 token，样式在落字那一刻就已经是
 * 粗体 / 代码 / 链接，raw 符号永远不出现在屏幕上。
 * ------------------------------------------------------------------- */

type InlineKind = 'text' | 'bold' | 'code' | 'link';

interface InlineToken {
  kind: InlineKind;
  text: string;
  href?: string;
  /** 原文偏移（含 ** ` [ ]( ) 这些标记），用来和揭示位置对齐 */
  start: number;
  end: number;
}

type BlockKind = 'p' | 'h' | 'ul' | 'ol' | 'code';

interface Block {
  kind: BlockKind;
  start: number;
  end: number;
  level?: number;
  tokens?: InlineToken[];
  items?: InlineToken[][];
  code?: string;
  codeStart?: number;
}

const INLINE_RE = /\*\*([^*\n]+)\*\*|`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

function parseInline(raw: string, base: number): InlineToken[] {
  const out: InlineToken[] = [];
  let last = 0;
  INLINE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE_RE.exec(raw)) !== null) {
    const start = base + m.index;
    if (m.index > last) {
      out.push({ kind: 'text', text: raw.slice(last, m.index), start: base + last, end: start });
    }
    if (m[1] !== undefined) {
      out.push({ kind: 'bold', text: m[1], start, end: start + m[0].length });
    } else if (m[2] !== undefined) {
      out.push({ kind: 'code', text: m[2], start, end: start + m[0].length });
    } else {
      out.push({ kind: 'link', text: m[3], href: m[4], start, end: start + m[0].length });
    }
    last = m.index + m[0].length;
  }
  if (last < raw.length) {
    out.push({ kind: 'text', text: raw.slice(last), start: base + last, end: base + raw.length });
  }
  return out;
}

const HEADING_RE = /^(#{1,4})\s+/;
const FENCE_RE = /^```(\w*)/;
const BULLET_RE = /^\s*[-*+]\s+/;
const ORDERED_RE = /^\s*\d+[.)]\s+/;

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n');
  const starts: number[] = [];
  let cursor = 0;
  for (const line of lines) {
    starts.push(cursor);
    cursor += line.length + 1;
  }

  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const lineStart = starts[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = FENCE_RE.exec(line);
    if (fence) {
      const codeStart = lineStart + line.length + 1;
      const body: string[] = [];
      let j = i + 1;
      while (j < lines.length && !/^```/.test(lines[j])) {
        body.push(lines[j]);
        j += 1;
      }
      const closed = j < lines.length;
      const end = closed ? starts[j] + lines[j].length : text.length;
      blocks.push({ kind: 'code', start: lineStart, end, code: body.join('\n'), codeStart });
      i = closed ? j + 1 : j;
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      const contentStart = lineStart + heading[0].length;
      blocks.push({
        kind: 'h',
        start: lineStart,
        end: lineStart + line.length,
        level: heading[1].length,
        tokens: parseInline(line.slice(heading[0].length), contentStart),
      });
      i += 1;
      continue;
    }

    if (BULLET_RE.test(line) || ORDERED_RE.test(line)) {
      const ordered = ORDERED_RE.test(line);
      const items: InlineToken[][] = [];
      let j = i;
      let end = lineStart;
      while (j < lines.length) {
        const row = lines[j];
        const re = ordered ? ORDERED_RE : BULLET_RE;
        if (!re.test(row)) break;
        const marker = re.exec(row)![0];
        items.push(parseInline(row.slice(marker.length), starts[j] + marker.length));
        end = starts[j] + row.length;
        j += 1;
      }
      blocks.push({ kind: ordered ? 'ol' : 'ul', start: lineStart, end, items });
      i = j;
      continue;
    }

    // 段落：连续的非空、非特殊行
    let j = i;
    let end = lineStart;
    while (j < lines.length) {
      const row = lines[j];
      if (!row.trim() || FENCE_RE.test(row) || HEADING_RE.test(row) || BULLET_RE.test(row) || ORDERED_RE.test(row)) {
        break;
      }
      end = starts[j] + row.length;
      j += 1;
    }
    blocks.push({ kind: 'p', start: lineStart, end, tokens: parseInline(text.slice(lineStart, end), lineStart) });
    i = j;
  }

  return blocks;
}

/* ------------------------------------------------------------------ 节奏 */

/** 中文按「字」算、拉丁按「词」算：22 words/s 在中文里约等于 35 字/秒 */
function charsPerSecond(text: string, wordsPerSecond: number) {
  const cjk = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const ratio = text.length ? cjk / text.length : 0;
  const perWord = 5.4 - ratio * 3.9;
  return Math.max(8, wordsPerSecond * perWord);
}

/** 标点后停一拍：真人打字的停顿全在这儿，均匀速度读起来像机器 */
function pauseAfter(ch: string) {
  if (/[。！？…]/.test(ch)) return 150;
  if (/[，、；：,.!?;:]/.test(ch)) return 70;
  return 0;
}

/* ------------------------------------------------------------------ 渲染 */

function Dot({ ink }: { ink?: string }) {
  return (
    <span data-slot="stream-dot" className="ax-stream-dot" style={ink ? { color: ink } : undefined} aria-hidden />
  );
}

/** 光标应该落在第几个 token 上；落在词与词之间时收在末尾 */
function tokenIndexOf(tokens: InlineToken[], at: number) {
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (at >= token.start && at <= token.end) return i;
  }
  return tokens.length;
}

function visibleChars(token: InlineToken, shown: number) {
  return Math.max(0, Math.min(token.text.length, shown - token.start));
}

/** 一段 token 的可见部分；在新鲜边界上切开，尾巴走「虚焦长出」的动画 */
function renderChars(token: InlineToken, shown: number, fresh: number, ink?: string) {
  const visible = visibleChars(token, shown);
  if (visible <= 0) return null;

  const a = token.start;
  const b = token.start + visible;
  const cut = Math.min(Math.max(fresh, a), b);

  return (
    <>
      {cut > a && <span className="ax-stream-seg">{token.text.slice(0, cut - a)}</span>}
      {b > cut && (
        <span
          key={`f${cut}`}
          data-stream-fresh
          className={cn('ax-stream-fresh', token.kind === 'code' && 'ax-stream-fresh-plain')}
          style={ink ? ({ '--ax-stream-ink': ink } as React.CSSProperties) : undefined}
        >
          {token.text.slice(cut - a, b - a)}
        </span>
      )}
    </>
  );
}

function inlineClass(kind: InlineKind) {
  if (kind === 'bold') return 'font-semibold text-fg';
  if (kind === 'code') return 'rounded-[4px] bg-muted px-[5px] py-[1px] font-mono text-[0.9em] text-fg';
  if (kind === 'link') {
    return 'text-fg underline decoration-line-strong underline-offset-[3px] transition-colors duration-[125ms] ease-standard hover:decoration-fg';
  }
  return undefined;
}

function renderTokens(
  tokens: InlineToken[],
  shown: number,
  fresh: number,
  ink?: string,
  dotIndex?: number,
) {
  return (
    <>
      {tokens.map((token, i) => {
        const inner = renderChars(token, shown, fresh, ink);
        const node =
          token.kind === 'link' && token.href ? (
            <a
              key={`t${i}`}
              href={token.href}
              target="_blank"
              rel="noreferrer"
              className={cn('ax-focus', inlineClass('link'))}
            >
              {inner}
            </a>
          ) : token.kind === 'bold' ? (
            <strong key={`t${i}`} className={inlineClass('bold')}>
              {inner}
            </strong>
          ) : token.kind === 'code' ? (
            <code key={`t${i}`} className={inlineClass('code')}>
              {inner}
            </code>
          ) : (
            <span key={`t${i}`}>{inner}</span>
          );

          return (
            <Fragment key={`w${i}`}>
              {node}
              {i === dotIndex ? <Dot ink={ink} /> : null}
            </Fragment>
          );
      })}
      {dotIndex === tokens.length ? <Dot ink={ink} /> : null}
    </>
  );
}

function BlockView({
  block,
  shown,
  fresh,
  ink,
  dotAt,
}: {
  block: Block;
  shown: number;
  fresh: number;
  ink?: string;
  dotAt?: number;
}) {
  const hasDot = dotAt !== undefined;

  if (block.kind === 'code') {
    const typed = Math.max(0, Math.min(block.code?.length ?? 0, shown - (block.codeStart ?? block.end)));
    return (
      <>
        <pre className="m-0 overflow-x-auto rounded-element border border-line bg-canvas p-3 font-mono text-[12.5px] leading-[1.7] text-fg">
          <code>{block.code?.slice(0, typed)}</code>
        </pre>
        {hasDot ? <Dot ink={ink} /> : null}
      </>
    );
  }

  if (block.kind === 'ul' || block.kind === 'ol') {
    const List = block.kind === 'ul' ? 'ul' : 'ol';
    const items = block.items ?? [];

    // 光标落在哪一条上（按条目的起始偏移判断）
    let dotItem = -1;
    if (hasDot) {
      items.forEach((tokens, i) => {
        if (tokens.length > 0 && dotAt! >= tokens[0].start) dotItem = i;
      });
    }

    return (
      <List className="m-0 flex list-disc flex-col gap-1 ps-5 text-fg marker:text-fg-tertiary">
        {items.map((tokens, i) => {
          const filled = tokens.some((token) => visibleChars(token, shown) > 0);
          const isDot = hasDot && i === dotItem;
          // 一个字都还没落下的条目先不画：否则会出现一枚空心的列表符号
          if (!filled && !isDot) return null;

          return (
            <li key={i} className={cn('min-w-0', !filled && 'list-none')}>
              {renderTokens(
                tokens,
                shown,
                fresh,
                ink,
                isDot && filled ? tokenIndexOf(tokens, dotAt!) : undefined,
              )}
              {isDot && !filled ? <Dot ink={ink} /> : null}
            </li>
          );
        })}
      </List>
    );
  }

  const tokens = block.tokens ?? [];
  const content = renderTokens(tokens, shown, fresh, ink, hasDot ? tokenIndexOf(tokens, dotAt!) : undefined);

  if (block.kind === 'h') {
    const size = block.level === 1 ? 'text-xl' : block.level === 2 ? 'text-lg' : 'text-md';
    return <p className={cn('m-0 font-semibold text-fg', size)}>{content}</p>;
  }

  return <p className="m-0 text-fg">{content}</p>;
}

/* ------------------------------------------------------------------ 组件 */

export interface AgentStreamingResponseProps {
  /** 目前为止收到的全文；会随 token 增长，支持 markdown */
  text: string;
  /** streaming 逐字揭示；done 把剩下的追完；stopped 停在当前 */
  status?: AgentStreamStatus;
  /** 追平后平均每秒词数（中文按字折算），默认 22 */
  speed?: number;
  /** 新字先落的颜色（也用在光点上），不传则全程单色 */
  ink?: string;
  /** 落定后是否出复制 / 重试 / 评分条 */
  actions?: boolean;
  onRetry?: () => void;
  onFeedback?: (feedback: AgentStreamFeedback) => void;
  defaultFeedback?: AgentStreamFeedback;
  /** 复制回调；停在中途时只给已经显示出来的那部分 */
  onCopy?: (text: string) => void;
  /** 一个字都还没到时的占位（默认是一枚呼吸的光点） */
  placeholder?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function BarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          'ax-focus ax-press inline-flex size-7 items-center justify-center rounded-inner transition-colors duration-[125ms] ease-standard',
          active ? 'bg-muted text-fg' : 'text-fg-secondary hover:bg-muted hover:text-fg',
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}

/**
 * 一段还在长的回答。和普通打字机不同的三处：
 * · 落字是一阵一阵的，标点后停一拍 —— 均匀速度一看就是假的；
 * · 新字从虚焦里长出来，行尾有一枚光点跟着滑；
 * · 粗体、行内代码、链接在出现的那一刻就是样式，不会先露出 ** 再合并。
 */
export function AgentStreamingResponse({
  text,
  status = 'streaming',
  speed = 22,
  ink,
  actions = true,
  onRetry,
  onFeedback,
  defaultFeedback = null,
  onCopy,
  placeholder,
  className,
  style,
}: AgentStreamingResponseProps) {
  const [stream, setStream] = useState(() => ({
    shown: status === 'streaming' ? 0 : text.length,
    fresh: 0,
  }));
  const [feedback, setFeedback] = useState<AgentStreamFeedback>(defaultFeedback);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const shown = Math.min(stream.shown, text.length);
  const complete = shown >= text.length;
  // 停止也算「落定」：停下来的那一截同样可以复制、重答、评分
  const settled = shown > 0 && (status === 'stopped' || (status === 'done' && complete));

  // 换了一条消息（变短了）就从头开始，不要停在上一句的中间
  useEffect(() => {
    if (text.length < stream.shown) setStream({ shown: text.length, fresh: text.length });
  }, [text.length, stream.shown]);

  useEffect(() => {
    if (status === 'stopped' || shown >= text.length) return undefined;

    const backlog = text.length - shown;
    // 落后越多追得越快，否则一次大 token 会积压成卡顿
    const cps = charsPerSecond(text, speed) * (1 + Math.min(3, backlog / 140));
    const delay = 45 + Math.random() * 70 + pauseAfter(text[shown - 1] ?? '');
    const step = Math.max(1, Math.round((cps * delay) / 1000));

    const id = window.setTimeout(() => {
      setStream((prev) => {
        const next = Math.min(text.length, prev.shown + step);
        return next === prev.shown ? prev : { shown: next, fresh: prev.shown };
      });
    }, delay);

    return () => window.clearTimeout(id);
  }, [status, shown, text, speed]);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const blocks = useMemo(() => parseBlocks(text), [text]);

  // 只在流式中画光点：done 的补字不再标「正在长」，stopped 已经停住
  const caretAt = status === 'streaming' && !complete ? shown : undefined;

  // 只把光点交给它真正落在的那个块；块之间的空行由前一块收尾
  const caretBlock = caretAt === undefined ? -1 : blocks.reduce((acc, block, i) => (block.start <= caretAt ? i : acc), -1);

  const handleCopy = async () => {
    const value = text.slice(0, shown);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // 无剪贴板权限时仍把内容交给调用方，由它决定怎么兜底
    }
    onCopy?.(value);
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1400);
  };

  const rate = (value: 'up' | 'down') => {
    const next = feedback === value ? null : value;
    setFeedback(next);
    onFeedback?.(next);
  };

  const showActions = actions && settled;

  return (
    <div
      data-slot="streaming-response"
      data-status={status}
      aria-busy={status === 'streaming'}
      className={cn('flex min-w-0 flex-col text-md leading-[1.72] text-fg', className)}
      style={style}
    >
      {shown > 0 ? (
        <div className="flex min-w-0 flex-col gap-2.5">
          {blocks.map((block, i) =>
            shown < block.start ? null : (
              <BlockView
                key={`${block.kind}-${block.start}-${i}`}
                block={block}
                shown={shown}
                fresh={stream.fresh}
                ink={ink}
                dotAt={i === caretBlock ? caretAt : undefined}
              />
            ),
          )}
        </div>
      ) : (
        <div className="text-fg-secondary">{placeholder ?? <Dot ink={ink} />}</div>
      )}

      {showActions && (
        <div
          data-slot="streaming-actions"
          className="mt-2 flex animate-in items-center gap-0.5 fade-in-0 duration-[200ms] ease-standard"
        >
          <BarButton label={copied ? '已复制' : '复制'} onClick={handleCopy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </BarButton>
          {onRetry && (
            <BarButton label="重试" onClick={onRetry}>
              <RefreshCcw className="size-3.5" />
            </BarButton>
          )}
          <span className="mx-1 h-3.5 w-px bg-line" aria-hidden />
          <BarButton label="有帮助" active={feedback === 'up'} onClick={() => rate('up')}>
            <ThumbsUp className="size-3.5" />
          </BarButton>
          <BarButton label="没帮助" active={feedback === 'down'} onClick={() => rate('down')}>
            <ThumbsDown className="size-3.5" />
          </BarButton>
        </div>
      )}
    </div>
  );
}
