import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';
import { AgentPrompts, type AgentPromptItem } from './prompts';

export interface AgentWelcomeProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** 开场提示，点一下直接发出去 */
  items?: AgentPromptItem[];
  onItemClick?: (item: AgentPromptItem, index: number) => void;
  /** 提示区下面的补充内容 */
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 空会话的落点。中间一个标记、一句定位、四个能点的例子 ——
 * 不写「我是你的智能助手」，写它现在能替人做什么。
 */
export function AgentWelcome({
  icon,
  title = '今天要看什么？',
  description,
  items,
  onItemClick,
  extra,
  className,
  style,
}: AgentWelcomeProps) {
  return (
    <div
      className={cn('flex min-w-0 flex-col items-center gap-5 px-2 py-8 text-center', className)}
      style={style}
    >
      <span className="inline-flex size-12 items-center justify-center rounded-container bg-accent text-on-accent">
        {icon ?? <Sparkles className="size-5" aria-hidden />}
      </span>

      <div className="flex max-w-[520px] flex-col gap-2">
        <h2 className="m-0 text-xl font-semibold tracking-[-0.01em] text-fg sm:text-2xl">{title}</h2>
        {description && (
          <p className="m-0 text-sm leading-relaxed text-fg-secondary sm:text-md">{description}</p>
        )}
      </div>

      {items && items.length > 0 && (
        <div className="w-full max-w-[560px] text-start">
          <AgentPrompts items={items} columns={2} onItemClick={onItemClick} />
        </div>
      )}

      {extra}
    </div>
  );
}
