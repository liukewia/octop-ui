import { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Gauge } from 'lucide-react';
import { cn } from '../../lib/cn';
import { POPUP_MOTION } from '../../lib/motion';

export interface AgentModelOption {
  key: string;
  label: React.ReactNode;
  /** 副标题：上下文长度、价格、一句话定位 */
  description?: React.ReactNode;
  /** 分组名，连续同组的会放在一起 */
  group?: string;
  disabled?: boolean;
}

export interface AgentEffortOption {
  key: string;
  label: React.ReactNode;
  description?: React.ReactNode;
}

export interface AgentModelSelectorProps {
  models: AgentModelOption[];
  value?: string;
  onChange?: (key: string, option: AgentModelOption) => void;
  /** 思考强度：低 / 中 / 高 */
  efforts?: AgentEffortOption[];
  effort?: string;
  onEffortChange?: (key: string, option: AgentEffortOption) => void;
  disabled?: boolean;
  placeholder?: string;
  /** 只出模型，不出强度 */
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface RowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

function Row({ label, description, selected, disabled, onSelect }: RowProps) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer select-none items-start gap-2 rounded-inner px-2 py-1.5 outline-none transition-colors duration-[125ms] ease-standard',
        'data-[highlighted]:bg-muted',
        disabled && 'cursor-not-allowed opacity-45',
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn('text-sm', selected ? 'font-medium text-fg' : 'text-fg-secondary')}>{label}</span>
        {description && <span className="text-[11px] leading-snug text-fg-tertiary">{description}</span>}
      </span>
      {selected && <Check className="mt-0.5 size-3.5 flex-none text-fg" aria-hidden />}
    </DropdownMenu.Item>
  );
}

/**
 * 模型 + 思考强度。两颗胶囊并排放在输入区右下角，
 * 选中的那个直接写在按钮上 —— 不要让用户点开才知道现在用的是哪个。
 */
export function AgentModelSelector({
  models,
  value,
  onChange,
  efforts,
  effort,
  onEffortChange,
  disabled,
  placeholder = '选择模型',
  compact = false,
  className,
  style,
}: AgentModelSelectorProps) {
  const current = models.find((m) => m.key === value) ?? models[0];
  const currentEffort = efforts?.find((e) => e.key === effort) ?? efforts?.[0];

  const groups = useMemo(() => {
    const out: { name?: string; items: AgentModelOption[] }[] = [];
    models.forEach((m) => {
      const last = out[out.length - 1];
      if (last && last.name === m.group) last.items.push(m);
      else out.push({ name: m.group, items: [m] });
    });
    return out;
  }, [models]);

  const trigger = cn(
    'ax-focus ax-press inline-flex h-7 flex-none items-center gap-1 rounded-full border border-line px-2.5 text-xs text-fg-secondary transition-colors duration-[125ms] ease-standard',
    'hover:border-line-strong hover:text-fg data-[state=open]:border-line-strong data-[state=open]:bg-muted data-[state=open]:text-fg',
    disabled && 'cursor-not-allowed opacity-50',
  );

  return (
    <div className={cn('flex min-w-0 items-center gap-1.5', className)} style={style}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild disabled={disabled}>
          <button type="button" className={trigger} aria-label={`模型：${String(current?.label ?? placeholder)}`}>
            <span className="max-w-[132px] truncate">{current?.label ?? placeholder}</span>
            <ChevronDown className="size-3 flex-none text-fg-tertiary" aria-hidden />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={6}
            align="end"
            className={cn('ax-popover-soft z-50 min-w-[232px] p-1 outline-none', POPUP_MOTION)}
          >
            {groups.map((group, gi) => (
              <div key={group.name ?? gi} className="flex flex-col">
                {group.name && (
                  <span className="px-2 pb-0.5 pt-1.5 text-[11px] font-medium text-fg-tertiary">{group.name}</span>
                )}
                {group.items.map((m) => (
                  <Row
                    key={m.key}
                    label={m.label}
                    description={m.description}
                    selected={m.key === current?.key}
                    disabled={m.disabled}
                    onSelect={() => onChange?.(m.key, m)}
                  />
                ))}
              </div>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {!compact && efforts && efforts.length > 0 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild disabled={disabled}>
            <button
              type="button"
              className={trigger}
              aria-label={`思考强度：${String(currentEffort?.label ?? '默认')}`}
            >
              <Gauge className="size-3 flex-none text-fg-tertiary" aria-hidden />
              <span className="max-w-[88px] truncate">{currentEffort?.label}</span>
              <ChevronDown className="size-3 flex-none text-fg-tertiary" aria-hidden />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={6}
              align="end"
              className={cn('ax-popover-soft z-50 min-w-[188px] p-1 outline-none', POPUP_MOTION)}
            >
              <span className="block px-2 pb-0.5 pt-1.5 text-[11px] font-medium text-fg-tertiary">思考强度</span>
              {efforts.map((e) => (
                <Row
                  key={e.key}
                  label={e.label}
                  description={e.description}
                  selected={e.key === currentEffort?.key}
                  onSelect={() => onEffortChange?.(e.key, e)}
                />
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}
