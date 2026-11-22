import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Paperclip, Square } from 'lucide-react';
import { cn } from '../../lib/cn';
import { AgentBubble } from '../agent/bubble';
import { Button } from '../button';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessageProps {
  role?: ChatRole;
  /** 名字行；assistant 默认留空，由调用方决定要不要显示 */
  name?: React.ReactNode;
  /** 自定义头像；传 false 不渲染 */
  avatar?: React.ReactNode | false;
  content?: React.ReactNode;
  children?: React.ReactNode;
  time?: React.ReactNode;
  /** 用户消息的送达状态 */
  status?: 'sending' | 'sent' | 'read' | 'error';
  /** 悬停才出现的操作条 */
  actions?: React.ReactNode;
  /** 正在生成：气泡里换成三点呼吸 */
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_TEXT: Record<NonNullable<ChatMessageProps['status']>, string> = {
  sending: '发送中',
  sent: '已发送',
  read: '已读',
  error: '发送失败',
};

/**
 * 一条消息的最小写法：role + content。
 * 需要 header / footer / typing / variant 时直接用 AgentBubble —— 这里只是它的一个门面，
 * 省得库里有第二种气泡排版。
 */
export function ChatMessage({
  role = 'assistant',
  name,
  avatar,
  content,
  children,
  time,
  status,
  actions,
  loading,
  className,
  style,
}: ChatMessageProps) {
  const isUser = role === 'user';
  const hasMeta = !!(name || time || status);

  return (
    <AgentBubble
      placement={isUser ? 'end' : 'start'}
      avatar={avatar}
      loading={loading}
      content={content ?? children}
      header={
        hasMeta ? (
          <>
            {name && <span className="font-medium text-fg-secondary">{name}</span>}
            {time && <span className="tabular-nums">{time}</span>}
            {status && <span className={cn(status === 'error' && 'text-danger')}>{STATUS_TEXT[status]}</span>}
          </>
        ) : undefined
      }
      footer={
        actions ? (
          <span className="flex items-center gap-1 transition-opacity duration-[125ms] ease-standard focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            {actions}
          </span>
        ) : undefined
      }
      className={className}
      style={style}
    />
  );
}

export interface ChatSystemMessageProps {
  children?: React.ReactNode;
  /** 两侧的细线，默认开 */
  divider?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** 系统提示：居中一行小字，两侧细线把它和消息流分开 */
export function ChatSystemMessage({ children, divider = true, className, style }: ChatSystemMessageProps) {
  return (
    <div
      className={cn('flex w-full items-center gap-3 py-1 text-xs text-fg-tertiary', className)}
      style={style}
    >
      {divider && <span aria-hidden className="h-px flex-1 bg-line" />}
      <span className="min-w-0 text-center">{children}</span>
      {divider && <span aria-hidden className="h-px flex-1 bg-line" />}
    </div>
  );
}

export interface ChatComposerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 回车或点发送时触发；此时输入框不自动清空，由调用方决定 */
  onSend?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 生成中：发送键变成停止键，触发 onStop */
  loading?: boolean;
  onStop?: () => void;
  maxLength?: number;
  /** 左下角的附件 / 快捷入口 */
  actions?: React.ReactNode;
  /** 附件按钮，传 false 隐藏 */
  attach?: boolean;
  onAttach?: () => void;
  /** 输入框下方的一行提示 */
  footer?: React.ReactNode;
  /** 自适应高度上限，默认 160px */
  maxHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** 输入区：回车发送、Shift+回车换行，中文输入法组词期间不误发 */
export function ChatComposer({
  value,
  defaultValue,
  onChange,
  onSend,
  placeholder = '发消息…',
  disabled,
  loading,
  onStop,
  maxLength,
  actions,
  attach = true,
  onAttach,
  footer,
  maxHeight = 160,
  className,
  style,
}: ChatComposerProps) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [inner, setInner] = useState(defaultValue ?? '');
  const text = value ?? inner;

  useEffect(() => {
    const node = areaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, maxHeight)}px`;
  }, [text, maxHeight]);

  const update = (next: string) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const submit = () => {
    if (disabled || loading) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
  };

  return (
    <div
      className={cn(
        'ax-field flex w-full min-w-0 flex-col gap-1.5 p-2 transition-colors',
        disabled && 'opacity-60',
        className,
      )}
      style={style}
    >
      <textarea
        ref={areaRef}
        rows={1}
        value={text}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => update(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || event.shiftKey) return;
          // 组词中的回车是在选字，不是发送
          if ((event.nativeEvent as KeyboardEvent).isComposing) return;
          event.preventDefault();
          submit();
        }}
        className="max-h-[inherit] w-full resize-none border-0 bg-transparent px-1.5 pt-1 text-md leading-relaxed text-fg outline-none placeholder:text-fg-disabled"
      />

      <div className="flex items-center gap-1">
        {actions}
        {attach && (
          <button
            type="button"
            onClick={onAttach}
            aria-label="添加附件"
            className="ax-press ax-focus inline-flex size-8 flex-none items-center justify-center rounded-element text-fg-tertiary transition-colors duration-[125ms] ease-standard hover:bg-muted hover:text-fg"
          >
            <Paperclip className="size-4" />
          </button>
        )}

        <span className="min-w-0 flex-1 truncate ps-1 text-xs text-fg-disabled">{footer}</span>

        {loading ? (
          <Button
            size="small"
            shape="circle"
            aria-label="停止生成"
            onClick={onStop}
            icon={<Square className="size-3.5" />}
          />
        ) : (
          <Button
            type="primary"
            size="small"
            shape="circle"
            aria-label="发送"
            disabled={disabled || !text.trim()}
            onClick={submit}
            icon={<ArrowUp className="size-4" />}
          />
        )}
      </div>
    </div>
  );
}
