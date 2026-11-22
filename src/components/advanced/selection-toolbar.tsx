import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { FLOAT_IN } from '../../lib/motion';

export interface SelectionToolbarProps {
  /** 选中数量，为 0 且 open 未指定时不渲染 */
  count?: number;
  open?: boolean;
  onClear?: () => void;
  /** 批量操作按钮 */
  children?: React.ReactNode;
  /** 右侧附加信息，例如「共 128 条」 */
  extra?: React.ReactNode;
  placement?: 'bottom' | 'top';
  countText?: (count: number) => React.ReactNode;
  /** 贴视口底（默认）还是贴最近的定位父级 */
  fixed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 批量操作条：选中之后才出现，浮在内容之上而不是挤进表头。
 * 左侧是数量胶囊（反相实色），右侧是操作；清除永远在最靠近数量的位置。
 */
export function SelectionToolbar({
  count = 0,
  open,
  onClear,
  children,
  extra,
  placement = 'bottom',
  countText,
  fixed = true,
  className,
  style,
}: SelectionToolbarProps) {
  const visible = open ?? count > 0;
  if (!visible) return null;

  return (
    <div
      role="toolbar"
      aria-label="批量操作"
      className={cn(
        'z-40 flex max-w-[calc(100vw-24px)] items-center gap-2 rounded-full border border-line bg-surface py-1.5 ps-2 pe-2 shadow-high',
        fixed ? 'fixed inset-x-0 mx-auto w-max' : 'absolute left-1/2 w-max -translate-x-1/2',
        placement === 'bottom' ? (fixed ? 'bottom-6' : 'bottom-4') : fixed ? 'top-6' : 'top-4',
        FLOAT_IN,
        className,
      )}
      style={style}
    >
      <span className="inline-flex h-6 flex-none items-center gap-1 rounded-full bg-accent px-2.5 text-xs font-medium text-on-accent tabular-nums">
        {countText ? countText(count) : `已选 ${count} 项`}
      </span>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="取消选择"
          className="ax-press ax-focus -ms-0.5 inline-flex size-6 flex-none items-center justify-center rounded-full text-fg-tertiary transition-colors duration-[125ms] ease-standard hover:bg-muted hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      )}

      {children && (
        <>
          <span aria-hidden className="h-4 w-px flex-none bg-line-strong" />
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto">{children}</div>
        </>
      )}

      {extra && (
        <>
          <span aria-hidden className="h-4 w-px flex-none bg-line-strong" />
          <span className="flex-none pe-1 text-xs text-fg-tertiary">{extra}</span>
        </>
      )}
    </div>
  );
}
