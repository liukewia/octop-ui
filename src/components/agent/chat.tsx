import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';

export interface AgentChatProps {
  children?: React.ReactNode;
  /** 容器高度由外部给（h-full / h-[560px]） */
  className?: string;
  style?: React.CSSProperties;
}

function AgentChatRoot({ children, className, style }: AgentChatProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full flex-col overflow-hidden rounded-container border border-line bg-surface',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export interface AgentChatHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** 右侧：模型、上下文、更多 */
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

function AgentChatHeader({ title, subtitle, extra, children, className }: AgentChatHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-none items-center gap-3 border-b border-line px-3.5 py-2.5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <span className="min-w-0 truncate text-sm font-semibold text-fg">{title}</span>}
        {subtitle && <span className="min-w-0 truncate text-xs text-fg-tertiary">{subtitle}</span>}
        {children}
      </div>
      {extra && <div className="flex flex-none items-center gap-1.5">{extra}</div>}
    </header>
  );
}

export interface AgentChatBodyProps {
  children?: React.ReactNode;
  /** 新消息进来自动贴底；用户手动往上翻后暂停，回到底部再恢复 */
  autoScroll?: boolean;
  /** 内边距，默认 px-4 py-4 */
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
}

function AgentChatBody({
  children,
  autoScroll = true,
  padding = 'px-4 py-4',
  className,
  style,
}: AgentChatBodyProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  useEffect(() => {
    const node = scroller.current;
    if (!node || !autoScroll) return;
    const onScroll = () => {
      stick.current = node.scrollHeight - node.scrollTop - node.clientHeight < 32;
    };
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, [autoScroll]);

  useEffect(() => {
    const node = scroller.current;
    const content = inner.current;
    if (!node || !content || !autoScroll) return;
    const observer = new ResizeObserver(() => {
      if (stick.current) node.scrollTop = node.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [autoScroll]);

  return (
    <div
      ref={scroller}
      className={cn('scroll-fade min-h-0 flex-1 overflow-y-auto overscroll-contain', className)}
      style={style}
    >
      <div ref={inner} className={cn('flex min-w-0 flex-col gap-4', padding)}>
        {children}
      </div>
    </div>
  );
}

export interface AgentChatFooterProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function AgentChatFooter({ children, className, style }: AgentChatFooterProps) {
  return (
    <div className={cn('flex-none border-t border-line p-2 sm:p-2.5', className)} style={style}>
      {children}
    </div>
  );
}

/**
 * 会话外壳：头部固定、中间滚动、底部固定。
 * 中间那层挂了 `scroll-fade`，上下两端淡出，滚动条不用常显。
 */
export const AgentChat = Object.assign(AgentChatRoot, {
  Header: AgentChatHeader,
  Body: AgentChatBody,
  Footer: AgentChatFooter,
});
