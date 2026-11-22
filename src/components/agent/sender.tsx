import { useEffect, useRef, useState } from 'react';
import { ArrowUp, FileText, Mic, Paperclip, Square, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface AgentAttachmentItem {
  key: React.Key;
  name: React.ReactNode;
  icon?: React.ReactNode;
  /** 文件大小之类的补充信息 */
  size?: React.ReactNode;
}

export interface AgentSenderProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 回车或点发送时触发；输入框不自动清空，由调用方决定 */
  onSubmit?: (value: string) => void;
  /** 生成中点停止 */
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** enter = 回车发送（默认）；shiftEnter = Shift+回车发送 */
  submitType?: 'enter' | 'shiftEnter';
  maxLength?: number;
  /** 输入区上方的附件 / 引用区 */
  header?: React.ReactNode;
  /** 左下角的按钮组 */
  prefix?: React.ReactNode;
  /** 右下角，发送键之前（模型选择、工具开关） */
  actions?: React.ReactNode;
  /** 输入框下方的一行提示 */
  footer?: React.ReactNode;
  attachments?: AgentAttachmentItem[];
  onRemoveAttachment?: (item: AgentAttachmentItem) => void;
  /** 附件按钮；传 false 隐藏 */
  attach?: boolean;
  onAttach?: () => void;
  /** 语音按钮（只负责回调，不接 Web Speech） */
  allowSpeech?: boolean;
  onSpeech?: () => void;
  maxHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 输入区：三行结构 —— 附件、正文、工具条。
 * 回车发送 / Shift+回车换行，中文组词期间的回车不当作发送。
 */
export function AgentSender({
  value,
  defaultValue,
  onChange,
  onSubmit,
  onCancel,
  loading,
  disabled,
  placeholder = '给 Agent 发消息…',
  submitType = 'enter',
  maxLength,
  header,
  prefix,
  actions,
  footer,
  attachments,
  onRemoveAttachment,
  attach = true,
  onAttach,
  allowSpeech,
  onSpeech,
  maxHeight = 168,
  className,
  style,
}: AgentSenderProps) {
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
    onSubmit?.(trimmed);
  };

  const hasAttachments = !!attachments?.length;

  return (
    <div
      className={cn('ax-field flex w-full min-w-0 flex-col gap-1 p-2', disabled && 'opacity-60', className)}
      style={style}
    >
      {(header || hasAttachments) && (
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 px-1 pt-0.5">
          {header}
          {attachments?.map((file) => (
            <span
              key={file.key}
              className="inline-flex min-w-0 max-w-[220px] items-center gap-1.5 rounded-full border border-line bg-canvas py-1 pe-1 ps-2 text-xs text-fg-secondary"
            >
              <span className="inline-flex size-3.5 flex-none items-center justify-center text-fg-tertiary">
                {file.icon ?? <FileText className="size-3.5" aria-hidden />}
              </span>
              <span className="min-w-0 truncate">{file.name}</span>
              {file.size && <span className="flex-none tabular-nums text-fg-disabled">{file.size}</span>}
              <button
                type="button"
                aria-label={`移除 ${typeof file.name === 'string' ? file.name : '附件'}`}
                onClick={() => onRemoveAttachment?.(file)}
                className="ax-focus inline-flex size-4 flex-none items-center justify-center rounded-full text-fg-tertiary transition-colors duration-[125ms] ease-standard hover:bg-muted-strong hover:text-fg"
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}

      <textarea
        ref={areaRef}
        rows={1}
        value={text}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => update(event.target.value)}
        onKeyDown={(event) => {
          const mod = submitType === 'enter' ? !event.shiftKey : event.shiftKey;
          if (event.key !== 'Enter' || !mod) return;
          if ((event.nativeEvent as KeyboardEvent).isComposing) return;
          event.preventDefault();
          submit();
        }}
        className="w-full resize-none border-0 bg-transparent px-1.5 pt-1 text-md leading-relaxed text-fg outline-none placeholder:text-fg-tertiary"
      />

      <div className="flex items-center gap-1">
        {prefix}
        {attach && (
          <button
            type="button"
            onClick={onAttach}
            aria-label="添加附件"
            className="ax-focus ax-press inline-flex size-8 flex-none items-center justify-center rounded-element text-fg-tertiary transition-colors duration-[125ms] ease-standard hover:bg-muted hover:text-fg"
          >
            <Paperclip className="size-4" aria-hidden />
          </button>
        )}
        {allowSpeech && (
          <button
            type="button"
            onClick={onSpeech}
            aria-label="语音输入"
            className="ax-focus ax-press inline-flex size-8 flex-none items-center justify-center rounded-element text-fg-tertiary transition-colors duration-[125ms] ease-standard hover:bg-muted hover:text-fg"
          >
            <Mic className="size-4" aria-hidden />
          </button>
        )}

        <span className="min-w-0 flex-1 truncate ps-1 text-xs text-fg-disabled">{footer}</span>

        {actions}
        {maxLength !== undefined && (
          <span className="flex-none pe-0.5 text-[11px] tabular-nums text-fg-disabled">
            {text.length}/{maxLength}
          </span>
        )}

        {loading ? (
          <button
            type="button"
            onClick={onCancel}
            aria-label="停止生成"
            className="ax-focus ax-press inline-flex size-8 flex-none items-center justify-center rounded-full bg-accent text-on-accent transition-colors duration-[125ms] ease-standard hover:bg-accent-hover"
          >
            <Square className="size-3.5" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            aria-label="发送"
            disabled={disabled || !text.trim()}
            className={cn(
              'ax-focus ax-press inline-flex size-8 flex-none items-center justify-center rounded-full bg-accent text-on-accent transition-colors duration-[125ms] ease-standard hover:bg-accent-hover',
              (disabled || !text.trim()) && 'cursor-not-allowed bg-muted text-fg-disabled hover:bg-muted',
            )}
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
