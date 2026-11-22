import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, User } from 'lucide-react';
import { cn } from '../../lib/cn';

export type AgentBubblePlacement = 'start' | 'end';

export interface AgentTypingConfig {
  /** 每帧补几个字，默认 2 */
  step?: number;
  /** 帧间隔，默认 28ms */
  interval?: number;
}

export interface AgentBubbleProps {
  /** 正文；也可直接写 children */
  content?: React.ReactNode;
  children?: React.ReactNode;
  /** 谁说的：end = 用户（右），start = Agent（左） */
  placement?: AgentBubblePlacement;
  /** 自定义头像；传 false 不渲染 */
  avatar?: React.ReactNode | false;
  /** 气泡上方的一行（名字、时间） */
  header?: React.ReactNode;
  /** 气泡下方的一行（操作条） */
  footer?: React.ReactNode;
  /** 正在生成：气泡里换成三点呼吸，content 先不渲染 */
  loading?: boolean;
  /** 打字机效果；只对字符串正文生效 */
  typing?: boolean | AgentTypingConfig;
  /** text = 不带底（Agent 默认）；filled = 实底；outlined / shadow 自带边界 */
  variant?: 'text' | 'filled' | 'outlined' | 'shadow';
  shape?: 'default' | 'round';
  onTypingComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function DefaultAvatar({ placement }: { placement: AgentBubblePlacement }) {
  const Icon = placement === 'end' ? User : Sparkles;
  return (
    <span
      className={cn(
        'inline-flex size-7 flex-none items-center justify-center rounded-full',
        placement === 'end' ? 'bg-muted text-fg-secondary' : 'bg-accent text-on-accent',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
    </span>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="正在生成">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-current opacity-60"
          style={{ animationDelay: `${i * 120}ms`, animationDuration: '900ms' }}
        />
      ))}
    </span>
  );
}

/**
 * 用户消息使用实色背景。
 * 助手那侧不加边框，长回答才不会被一个圆角框反复切断。
 */
export function AgentBubble({
  content,
  children,
  placement = 'start',
  avatar,
  header,
  footer,
  loading,
  typing,
  variant,
  shape = 'default',
  onTypingComplete,
  className,
  style,
}: AgentBubbleProps) {
  const isEnd = placement === 'end';
  const body = content ?? children;
  const resolvedVariant = variant ?? (isEnd ? 'filled' : 'text');

  const typingConfig = useMemo<AgentTypingConfig | null>(() => {
    if (!typing) return null;
    return typing === true ? { step: 2, interval: 28 } : { step: typing.step ?? 2, interval: typing.interval ?? 28 };
  }, [typing]);

  const full = typeof body === 'string' ? body : undefined;
  const [shown, setShown] = useState(() => (typingConfig && full ? 0 : full?.length ?? 0));
  const doneRef = useRef(false);

  // 正文换了就重播，别让上一条的进度卡在新消息上
  useEffect(() => {
    if (!typingConfig || !full) return;
    doneRef.current = false;
    setShown(0);
  }, [full, typingConfig]);

  useEffect(() => {
    if (!typingConfig || !full) return;
    if (shown >= full.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onTypingComplete?.();
      }
      return;
    }
    const timer = setTimeout(() => {
      setShown((v) => Math.min(full.length, v + typingConfig.step!));
    }, typingConfig.interval);
    return () => clearTimeout(timer);
  }, [shown, full, typingConfig, onTypingComplete]);

  const rendered =
    typingConfig && full ? `${full.slice(0, shown)}${shown < full.length ? '▍' : ''}` : body;

  return (
    <div
      data-placement={placement}
      className={cn('group flex w-full min-w-0 items-start gap-2.5', isEnd && 'flex-row-reverse', className)}
      style={style}
    >
      {avatar !== false && <div className="mt-0.5">{avatar ?? <DefaultAvatar placement={placement} />}</div>}

      <div className={cn('flex min-w-0 max-w-[min(600px,86%)] flex-col gap-1', isEnd && 'items-end')}>
        {header && (
          <div className={cn('flex items-center gap-1.5 text-xs text-fg-tertiary', isEnd && 'justify-end')}>
            {header}
          </div>
        )}

        <div
          className={cn(
            'min-w-0 text-md leading-relaxed',
            resolvedVariant !== 'text' && 'px-3.5 py-2.5',
            resolvedVariant === 'filled' && (isEnd ? 'bg-accent text-on-accent' : 'bg-muted text-fg'),
            resolvedVariant === 'outlined' && 'border border-line bg-surface text-fg',
            resolvedVariant === 'shadow' && 'ax-popover-soft text-fg',
            resolvedVariant === 'text' && 'text-fg',
            shape === 'round' ? 'rounded-page' : 'rounded-container',
            // 只有用户这侧收一个小角，Agent 那侧四角一样 —— 免得回答像被撕了一角
            shape === 'default' && isEnd && 'rounded-ee-inner',
          )}
        >
          {loading ? <Dots /> : rendered}
        </div>

        {footer && (
          <div
            className={cn(
              'flex min-h-6 items-center gap-1 text-fg-tertiary',
              isEnd && 'flex-row-reverse',
              'transition-opacity duration-[125ms] ease-standard',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
