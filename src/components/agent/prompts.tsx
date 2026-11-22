import { cn } from '../../lib/cn';

export interface AgentPromptItem {
  key: React.Key;
  label: React.ReactNode;
  /** 第二行的一句话 */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (item: AgentPromptItem) => void;
}

export interface AgentPromptsProps {
  items: AgentPromptItem[];
  /** 一组提示的标题，如「试试这样问」 */
  title?: React.ReactNode;
  onItemClick?: (item: AgentPromptItem, index: number) => void;
  /** 单列纵排，默认横向排 */
  vertical?: boolean;
  /** 两列 / 三列；不给就按内容宽度自然换行 */
  columns?: 1 | 2 | 3;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 一组可以一键发出的问题。卡片而不是胶囊：
 * 胶囊装不下「把上周的部署失败原因整理成一页」这种真实长度的提问。
 */
export function AgentPrompts({
  items,
  title,
  onItemClick,
  vertical,
  columns,
  className,
  style,
}: AgentPromptsProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)} style={style}>
      {title && <div className="text-xs font-medium text-fg-tertiary">{title}</div>}
      <div
        className={cn(
          'grid min-w-0 grid-cols-1 gap-2',
          !vertical && columns !== 1 && 'sm:grid-cols-2',
          !vertical && columns === 3 && 'sm:grid-cols-3',
        )}
      >
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onClick?.(item);
              onItemClick?.(item, index);
            }}
            className={cn(
              'ax-focus ax-press group flex min-w-0 items-start gap-2.5 rounded-element border border-line bg-surface px-3 py-2.5 text-start transition-[border-color,background-color] duration-[125ms] ease-standard',
              'hover:border-line-strong hover:bg-canvas',
              item.disabled && 'cursor-not-allowed opacity-50 hover:border-line hover:bg-surface',
            )}
          >
            {item.icon && (
              <span className="mt-0.5 inline-flex size-4 flex-none items-center justify-center text-fg-tertiary group-hover:text-fg">
                {item.icon}
              </span>
            )}
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="min-w-0 text-sm font-medium leading-snug text-fg">{item.label}</span>
              {item.description && (
                <span className="min-w-0 text-xs leading-relaxed text-fg-tertiary">{item.description}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
