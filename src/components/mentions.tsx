import { useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface MentionOption {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
}

export interface MentionsProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'defaultValue' | 'prefix' | 'onSelect'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: MentionOption, prefix: string) => void;
  options?: MentionOption[];
  prefix?: string | string[];
  split?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  autoSize?: boolean;
  notFoundContent?: React.ReactNode;
}

export function Mentions({
  value,
  defaultValue = '',
  onChange,
  onSelect,
  options = [],
  prefix = '@',
  split = ' ',
  placeholder = '输入 @ 提及成员',
  rows = 3,
  disabled,
  className,
  autoSize,
  notFoundContent,
  ...rest
}: MentionsProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const [query, setQuery] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const prefixes = Array.isArray(prefix) ? prefix : [prefix];

  const commit = (next: string) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const handleInput = (next: string, caret: number) => {
    commit(next);
    const before = next.slice(0, caret);
    const trigger = prefixes
      .map((p) => ({ p, index: before.lastIndexOf(p) }))
      .filter((item) => item.index >= 0)
      .sort((a, b) => b.index - a.index)[0];
    if (!trigger) {
      setQuery(null);
      return;
    }
    const fragment = before.slice(trigger.index + trigger.p.length);
    if (/\s/.test(fragment)) {
      setQuery(null);
      return;
    }
    setQuery(fragment);
  };

  const pick = (option: MentionOption) => {
    const el = ref.current;
    const caret = el?.selectionStart ?? current.length;
    const before = current.slice(0, caret);
    const trigger = prefixes
      .map((p) => ({ p, index: before.lastIndexOf(p) }))
      .filter((item) => item.index >= 0)
      .sort((a, b) => b.index - a.index)[0];
    if (!trigger) return;
    const head = current.slice(0, trigger.index);
    const tail = current.slice(caret);
    const next = `${head}${trigger.p}${option.value}${split}${tail}`;
    commit(next);
    setQuery(null);
    onSelect?.(option, trigger.p);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = head.length + trigger.p.length + option.value.length + split.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const filtered = query === null ? [] : options.filter((option) => String(option.value).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        rows={rows}
        value={current}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => handleInput(e.target.value, e.target.selectionStart ?? e.target.value.length)}
        onBlur={() => window.setTimeout(() => setQuery(null), 120)}
        onKeyDown={(e) => {
          if (query !== null && e.key === 'Enter' && filtered[0]) {
            e.preventDefault();
            pick(filtered[0]);
          }
          if (e.key === 'Escape') setQuery(null);
        }}
        className={cn(
          'ax-field w-full resize-none px-3 py-2 text-base leading-relaxed outline-none placeholder:text-fg-disabled',
          autoSize ? 'min-h-[80px]' : undefined,
          disabled && 'cursor-not-allowed bg-muted-soft',
          className,
        )}
        {...rest}
      />
      {query !== null && (
        <div className="ax-popover absolute inset-x-0 top-full z-50 mt-1 max-h-52 overflow-y-auto p-1 shadow-med">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-fg-disabled">{notFoundContent ?? '没有匹配的成员'}</div>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(option);
                }}
                className="ax-press flex w-full items-center gap-2 rounded-inner px-2.5 py-1.5 text-start text-base text-fg hover:bg-muted-soft disabled:text-fg-disabled"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-fg-secondary">
                  {String(option.value).slice(0, 1).toUpperCase()}
                </span>
                <span className="truncate">{option.label ?? option.value}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
