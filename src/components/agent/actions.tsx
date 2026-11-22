import { cn } from '../../lib/cn';
import { Tooltip } from '../tooltip';

export interface AgentActionItem {
  key: React.Key;
  /** 有 label 就出文字，没 label 当图标键 */
  label?: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** 图标键的悬浮说明，默认取 label */
  tooltip?: React.ReactNode;
  onClick?: (item: AgentActionItem) => void;
}

export interface AgentActionsProps {
  items?: AgentActionItem[];
  /** 不想用 items 时直接塞节点 */
  children?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'filled';
  size?: 'small' | 'default';
  /** 悬停父级消息才显形（父级需要 group） */
  fadeIn?: boolean;
  onActionClick?: (item: AgentActionItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 一条回答下面的几个动作。默认是「文字按钮」而不是图标阵：
 * 三个以上的图标键，用户得逐个悬停才知道是什么。
 */
export function AgentActions({
  items,
  children,
  variant = 'text',
  size = 'small',
  fadeIn = false,
  onActionClick,
  className,
  style,
}: AgentActionsProps) {
  return (
    <div
      role="group"
      className={cn(
        'flex items-center gap-0.5',
        fadeIn && 'transition-opacity duration-[125ms] ease-standard sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100',
        className,
      )}
      style={style}
    >
      {items?.map((item, index) => {
        const iconOnly = !item.label;
        const content = (
          <button
            key={item.key}
            type="button"
            disabled={item.disabled}
            aria-label={iconOnly ? String(item.tooltip ?? item.key) : undefined}
            onClick={() => {
              if (item.disabled) return;
              item.onClick?.(item);
              onActionClick?.(item, index);
            }}
            className={cn(
              'ax-focus ax-press inline-flex flex-none items-center justify-center gap-1 rounded-inner text-xs transition-colors duration-[125ms] ease-standard',
              size === 'small' ? 'h-7' : 'h-8',
              iconOnly ? 'w-7 px-0' : cn('px-2', size === 'default' && 'px-2.5'),
              variant === 'outlined' && 'border border-line',
              variant === 'filled' && 'bg-muted',
              item.danger
                ? 'text-fg-tertiary hover:bg-[var(--ax-danger-bg)] hover:text-[var(--ax-danger-fg)]'
                : 'text-fg-tertiary hover:bg-muted hover:text-fg',
              item.disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-fg-tertiary',
            )}
          >
            {item.icon && <span className="inline-flex size-3.5 items-center justify-center">{item.icon}</span>}
            {item.label && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        );

        const tip = item.tooltip ?? (iconOnly ? item.label : undefined);
        if (iconOnly && tip) {
          return (
            <Tooltip key={item.key} title={tip} placement="top">
              {content}
            </Tooltip>
          );
        }
        return content;
      })}
      {children}
    </div>
  );
}
