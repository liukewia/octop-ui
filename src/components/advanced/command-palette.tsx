import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { DIALOG_MOTION, FADE_MOTION } from '../../lib/motion';
import { Kbd } from './kbd';

export interface CommandPaletteItem {
  key: string;
  label: React.ReactNode;
  /** 参与搜索的纯文本；不传时取 label 的字符串形式 */
  text?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  shortcut?: string[];
  disabled?: boolean;
  /** 分组名，同一个组会挨在一起 */
  group?: string;
  keywords?: string[];
  onSelect?: () => void;
}

export interface CommandPaletteGroup {
  key?: React.Key;
  label?: React.ReactNode;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  /** 扁平列表，按 item.group 自动分组 */
  items?: CommandPaletteItem[];
  /** 已经分好组的列表，优先级高于 items */
  groups?: CommandPaletteGroup[];
  placeholder?: string;
  emptyText?: React.ReactNode;
  loading?: boolean;
  onSelect?: (item: CommandPaletteItem) => void;
  /** 默认客户端过滤；关掉后由外部按 keyword 自己算 */
  filter?: boolean | ((item: CommandPaletteItem, keyword: string) => boolean);
  /** 全局唤出键，默认 `mod+k`；false 关闭 */
  hotkey?: string | false;
  footer?: React.ReactNode;
  width?: number;
  getContainer?: HTMLElement | null;
  className?: string;
  zIndex?: number;
}

function groupOf(items: CommandPaletteItem[]): CommandPaletteGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, CommandPaletteItem[]>();
  for (const item of items) {
    const name = item.group ?? '';
    if (!buckets.has(name)) {
      buckets.set(name, []);
      order.push(name);
    }
    buckets.get(name)!.push(item);
  }
  return order.map((name) => ({
    key: name || 'default',
    label: name || undefined,
    items: buckets.get(name)!,
  }));
}

function labelText(item: CommandPaletteItem) {
  if (item.text) return item.text;
  return typeof item.label === 'string' || typeof item.label === 'number'
    ? String(item.label)
    : '';
}

/**
 * 命令面板：一个输入框 + 一张分组列表，方向键走、回车执行。
 * 打开时把焦点给输入框而不是面板本身，所以窗口一出现就能直接打字。
 */
export function CommandPalette({
  open,
  defaultOpen,
  onOpenChange,
  onClose,
  items = [],
  groups,
  placeholder = '搜索命令…',
  emptyText = '没有匹配的命令',
  loading,
  onSelect,
  filter = true,
  hotkey = 'mod+k',
  footer,
  width = 560,
  getContainer,
  className,
  zIndex,
}: CommandPaletteProps) {
  const [innerOpen, setInnerOpen] = useState(!!defaultOpen);
  const isOpen = open ?? innerOpen;
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(isOpen);

  openRef.current = isOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
    if (!next) onClose?.();
  };

  useEffect(() => {
    if (!hotkey) return;
    const handler = (event: KeyboardEvent) => {
      const parts = hotkey.split('+');
      const needMod = parts.includes('mod');
      const key = parts[parts.length - 1];
      if (needMod !== (event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      event.preventDefault();
      setOpen(!openRef.current);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotkey]);

  useEffect(() => {
    if (!isOpen) return;
    setKeyword('');
    setActive(0);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  const source = useMemo(() => groups ?? groupOf(items), [groups, items]);

  const sections = useMemo(() => {
    const q = keyword.trim();
    return source
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!q) return true;
          if (typeof filter === 'function') return filter(item, q);
          if (filter === false) return true;
          const haystack = [labelText(item), ...(item.keywords ?? [])].join(' ').toLowerCase();
          return haystack.includes(q.toLowerCase());
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [source, keyword, filter]);

  const flat = useMemo(() => sections.flatMap((section) => section.items), [sections]);

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(0, flat.length - 1)));
  }, [flat.length]);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (item: CommandPaletteItem) => {
    if (item.disabled) return;
    setOpen(false);
    item.onSelect?.();
    onSelect?.(item);
  };

  const move = (step: number) => {
    if (!flat.length) return;
    let next = active;
    for (let i = 0; i < flat.length; i += 1) {
      next = (next + step + flat.length) % flat.length;
      if (!flat[next].disabled) break;
    }
    setActive(next);
  };

  let cursor = -1;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <DialogPrimitive.Portal container={getContainer || undefined}>
        <DialogPrimitive.Overlay
          className={cn('ax-scrim fixed inset-0 z-50', FADE_MOTION)}
          style={{ zIndex }}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          aria-label="命令面板"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          style={{ zIndex: zIndex ? zIndex + 1 : undefined, width: `min(${width}px, calc(100vw - 32px))` }}
          className={cn(
            'fixed inset-x-0 top-[14vh] z-50 mx-auto flex max-h-[min(560px,72dvh)] flex-col overflow-hidden rounded-container border border-line bg-surface shadow-high outline-none',
            DIALOG_MOTION,
            className,
          )}
        >
          <div className="flex items-center gap-2 border-b border-line px-3.5 py-3">
            <Search className="size-4 flex-none text-fg-tertiary" />
            <input
              ref={inputRef}
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  move(1);
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  move(-1);
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  setActive(0);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  setActive(Math.max(0, flat.length - 1));
                } else if (event.key === 'Enter') {
                  event.preventDefault();
                  const item = flat[active];
                  if (item) run(item);
                }
              }}
              placeholder={placeholder}
              aria-label={placeholder}
              className="min-w-0 flex-1 border-0 bg-transparent text-md text-fg outline-none placeholder:text-fg-disabled"
            />
            <Kbd keys={['Esc']} size="small" />
          </div>

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {sections.map((section, sectionIndex) => (
              <div key={section.key ?? sectionIndex} className="mb-1 last:mb-0">
                {section.label && (
                  <div className="px-2 pt-1.5 pb-1 text-xs font-medium text-fg-tertiary">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  cursor += 1;
                  const index = cursor;
                  const isActive = index === active;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      data-index={index}
                      data-active={isActive}
                      disabled={item.disabled}
                      onMouseMove={() => !item.disabled && setActive(index)}
                      onClick={() => run(item)}
                      className={cn(
                        'flex w-full min-w-0 items-center gap-2.5 rounded-element px-2 py-2 text-start transition-colors duration-[95ms] ease-standard',
                        'data-[active=true]:bg-muted disabled:cursor-not-allowed disabled:opacity-45',
                      )}
                    >
                      {item.icon && (
                        <span className="flex size-4 flex-none items-center justify-center text-fg-tertiary">
                          {item.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base text-fg">{item.label}</span>
                        {item.description && (
                          <span className="block truncate text-xs text-fg-tertiary">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {item.shortcut && <Kbd keys={item.shortcut} size="small" />}
                      {isActive && !item.shortcut && (
                        <CornerDownLeft className="size-3.5 flex-none text-fg-disabled" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {flat.length === 0 && (
              <div className="flex min-h-[120px] items-center justify-center px-4 text-base text-fg-tertiary">
                {loading ? '正在加载…' : emptyText}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line px-3.5 py-2 text-xs text-fg-tertiary">
            <span className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <Kbd keys={['↑', '↓']} separator="" size="small" /> 选择
              </span>
              <span className="inline-flex items-center gap-1">
                <Kbd keys={['↵']} size="small" /> 执行
              </span>
            </span>
            <span className="min-w-0 truncate text-fg-disabled">{footer}</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
