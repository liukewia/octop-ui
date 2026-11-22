import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { fieldShell, type SizeType, type StatusType, type VariantType } from '../lib/field';
import { useControllableState } from '../lib/hooks';
import { Tag } from './tag';
import { POPUP_MOTION } from '../lib/motion';

export type SelectValue = string | number;

export interface SelectOption {
  label?: React.ReactNode;
  value?: SelectValue;
  disabled?: boolean;
  /** 分组选项 */
  options?: SelectOption[];
  [key: string]: unknown;
}

export interface LabeledValue {
  value: SelectValue;
  label?: React.ReactNode;
}

export interface SelectProps {
  options?: SelectOption[];
  value?: SelectValue | SelectValue[] | LabeledValue | LabeledValue[] | null;
  defaultValue?: SelectValue | SelectValue[] | LabeledValue | LabeledValue[];
  onChange?: (value: any, option: any) => void;
  onSelect?: (value: SelectValue, option: SelectOption) => void;
  onDeselect?: (value: SelectValue, option: SelectOption) => void;
  onClear?: () => void;

  mode?: 'multiple' | 'tags';
  maxTagCount?: number | 'responsive';
  maxTagPlaceholder?: (omitted: SelectValue[]) => React.ReactNode;
  tokenSeparators?: string[];

  placeholder?: React.ReactNode;
  allowClear?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: SizeType;
  status?: StatusType;
  variant?: VariantType;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;

  showSearch?: boolean;
  filterOption?: boolean | ((input: string, option: SelectOption) => boolean);
  optionFilterProp?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  autoClearSearchValue?: boolean;
  optionRender?: (option: SelectOption, info: { index: number }) => React.ReactNode;
  labelRender?: (props: { label: React.ReactNode; value: SelectValue }) => React.ReactNode;
  labelInValue?: boolean;

  open?: boolean;
  defaultOpen?: boolean;
  onDropdownVisibleChange?: (open: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  notFoundContent?: React.ReactNode;
  /** 下拉列表高度，默认 264 */
  listHeight?: number;
  dropdownClassName?: string;
  suffixIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  /** 透传给触发器的 aria-label */
  'aria-label'?: string;
  /** 表单场景：由 FormControl 注入 */
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  autoFocus?: boolean;
}

function flatten(options: SelectOption[] = []): SelectOption[] {
  return options.flatMap((option) => (option.options ? flatten(option.options) : [option]));
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function unwrap(value: SelectValue | LabeledValue): SelectValue {
  return typeof value === 'object' && value !== null ? (value as LabeledValue).value : (value as SelectValue);
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(props, ref) {
  const {
    options = [],
    value,
    defaultValue,
    onChange,
    onSelect,
    onDeselect,
    onClear,
    mode,
    maxTagCount,
    maxTagPlaceholder,
    tokenSeparators = [','],
    placeholder = '请选择',
    allowClear,
    disabled,
    loading,
    size = 'middle',
    status,
    variant = 'outlined',
    className,
    style,
    id,
    name,
    showSearch,
    filterOption = true,
    optionFilterProp = 'label',
    searchValue: searchValueProp,
    onSearch,
    autoClearSearchValue = true,
    optionRender,
    labelRender,
    labelInValue,
    open: openProp,
    defaultOpen = false,
    onDropdownVisibleChange,
    onOpenChange,
    notFoundContent,
    listHeight = 264,
    dropdownClassName,
    suffixIcon,
    prefix,
    autoFocus,
    ...aria
  } = props;

  const multiple = mode === 'multiple' || mode === 'tags';
  const searchable = showSearch || multiple;
  const triggers = useId();
  const listId = `${triggers}-listbox`;

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: (next) => {
      onOpenChange?.(next);
      onDropdownVisibleChange?.(next);
    },
  });

  const [rawValue, setRawValue] = useControllableState<any>({
    value: value as any,
    defaultValue: defaultValue ?? (multiple ? [] : undefined),
    onChange: undefined,
  });

  const [search, setSearch] = useState('');
  const searchValue = searchValueProp ?? search;
  const [activeIndex, setActiveIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const setTriggerRef = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };

  const allOptions = useMemo(() => flatten(options), [options]);
  const valueList = toArray(rawValue).map(unwrap);
  const selectedOptions = valueList.map(
    (v) => allOptions.find((o) => o.value === v) ?? ({ value: v, label: String(v) } as SelectOption),
  );

  const lower = (v: unknown) => String(v ?? '').toLowerCase();
  const filtered = useMemo(() => {
    if (!searchValue || !searchable) return options;
    const input = searchValue.toLowerCase();
    const match = (option: SelectOption) => {
      if (typeof filterOption === 'function') return filterOption(searchValue, option);
      if (filterOption === false) return true;
      const field =
        optionFilterProp === 'value' ? option.value : (option[optionFilterProp] ?? option.label);
      return lower(field).includes(input);
    };
    return options
      .map((option) =>
        option.options
          ? { ...option, options: option.options.filter((child) => match(child)) }
          : option,
      )
      .filter((option) => (option.options ? option.options.length > 0 : match(option)));
  }, [options, searchValue, searchable, filterOption, optionFilterProp]);

  const visible = useMemo(
    () => filtered.flatMap((option) => (option.options ? option.options : [option])),
    [filtered],
  );

  useEffect(() => {
    setActiveIndex(open ? visible.findIndex((o) => !o.disabled && valueList.includes(o.value as SelectValue)) : -1);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const emit = (nextValues: SelectValue[], optionsForEmit: SelectOption[]) => {
    const next = labelInValue
      ? multiple
        ? optionsForEmit.map((o) => ({ value: o.value as SelectValue, label: o.label }))
        : optionsForEmit[0]
          ? { value: optionsForEmit[0].value as SelectValue, label: optionsForEmit[0].label }
          : undefined
      : multiple
        ? nextValues
        : nextValues[0];

    if (value === undefined) setRawValue(next);
    onChange?.(
      next,
      labelInValue ? optionsForEmit : multiple ? optionsForEmit : optionsForEmit[0],
    );
  };

  const selectOption = (option: SelectOption) => {
    if (option.disabled) return;
    const v = option.value as SelectValue;
    if (multiple) {
      const exists = valueList.includes(v);
      const nextValues = exists ? valueList.filter((item) => item !== v) : [...valueList, v];
      const nextOptions = nextValues.map(
        (item) => allOptions.find((o) => o.value === item) ?? ({ value: item, label: String(item) } as SelectOption),
      );
      emit(nextValues, nextOptions);
      if (exists) onDeselect?.(v, option);
      else onSelect?.(v, option);
      if (autoClearSearchValue) setSearch('');
      onSearch?.('');
      return;
    }
    emit([v], [option]);
    onSelect?.(v, option);
    setOpen(false);
  };

  const removeValue = (v: SelectValue) => {
    const nextValues = valueList.filter((item) => item !== v);
    const nextOptions = nextValues.map(
      (item) => allOptions.find((o) => o.value === item) ?? ({ value: item, label: String(item) } as SelectOption),
    );
    emit(nextValues, nextOptions);
    onDeselect?.(v, allOptions.find((o) => o.value === v) as SelectOption);
  };

  const createTag = (raw: string) => {
    const label = raw.trim();
    if (!label) return;
    const exists = allOptions.find((o) => String(o.label) === label || String(o.value) === label);
    if (exists) return selectOption(exists);
    const option = { label, value: label };
    emit([...valueList, label], [...selectedOptions, option]);
    setSearch('');
  };

  const clear = () => {
    emit([], []);
    onClear?.();
  };

  const move = (delta: number) => {
    if (!visible.length) return;
    let next = activeIndex;
    for (let i = 0; i < visible.length; i += 1) {
      next = (next + delta + visible.length) % visible.length;
      if (!visible[next].disabled) break;
    }
    setActiveIndex(next);
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(visible.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && visible[activeIndex]) selectOption(visible[activeIndex]);
      else if (mode === 'tags') createTag(searchValue);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace' && multiple && searchValue === '' && valueList.length) {
      removeValue(valueList[valueList.length - 1]);
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (tokenSeparators.includes(e.key) && mode === 'tags') {
      e.preventDefault();
      createTag(searchValue);
    } else if (e.key.length === 1 && !searchable && !e.metaKey && !e.ctrlKey) {
      setSearch((s) => s + e.key);
      setOpen(true);
    }
  };

  const shownTags = maxTagCount === 'responsive' || maxTagCount === undefined ? selectedOptions : selectedOptions.slice(0, maxTagCount);
  const omitted = selectedOptions.slice(shownTags.length);

  const renderValue = () => {
    if (!valueList.length) return <span className="truncate text-fg-disabled">{placeholder}</span>;
    if (!multiple) {
      const option = selectedOptions[0];
      return (
        <span className="truncate">
          {labelRender ? labelRender({ label: option.label, value: option.value as SelectValue }) : option.label}
        </span>
      );
    }
    return (
      <span className="flex min-w-0 flex-wrap items-center gap-1 py-0.5">
        {shownTags.map((option) => (
          <Tag
            key={String(option.value)}
            closable={!disabled}
            onClose={(e) => {
              e.preventDefault();
              removeValue(option.value as SelectValue);
            }}
            className="max-w-[160px]"
          >
            {option.label}
          </Tag>
        ))}
        {omitted.length > 0 && (
          <Tag>{maxTagPlaceholder ? maxTagPlaceholder(omitted.map((o) => o.value as SelectValue)) : `+${omitted.length}`}</Tag>
        )}
      </span>
    );
  };

  const content = (
    <div
      ref={listRef}
      id={listId}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      className="overflow-y-auto overscroll-contain p-1"
      style={{ maxHeight: listHeight }}
    >
      {filtered.length === 0 && (
        <div className="px-3 py-6 text-center text-sm text-fg-disabled">
          {notFoundContent ?? (mode === 'tags' && searchValue ? `创建 “${searchValue}”` : '暂无数据')}
        </div>
      )}
      {filtered.map((group) => {
        if (group.options) {
          return (
            <div key={String(group.label)} role="group">
              <div className="px-2.5 pb-1 pt-2 text-xs font-medium text-fg-tertiary">{group.label}</div>
              {group.options.map((option) => renderOption(option))}
            </div>
          );
        }
        return renderOption(group);
      })}
      {mode === 'tags' && searchValue && !allOptions.some((o) => String(o.label) === searchValue) && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => createTag(searchValue)}
          className="ax-press flex w-full items-center gap-2 rounded-inner px-2.5 py-2 text-start text-base text-fg-secondary hover:bg-muted-soft"
        >
          创建 “{searchValue}”
        </button>
      )}
    </div>
  );

  function renderOption(option: SelectOption) {
    const index = visible.indexOf(option);
    const selected = valueList.includes(option.value as SelectValue);
    const active = index === activeIndex;
    return (
      <div
        key={String(option.value)}
        id={`${triggers}-option-${index}`}
        data-index={index}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => selectOption(option)}
        className={cn(
          'ax-press relative flex min-h-9 cursor-pointer select-none items-center gap-2 rounded-inner px-2.5 py-1.5 text-base',
          option.disabled && 'cursor-not-allowed text-fg-disabled',
          !option.disabled && active && 'bg-muted-soft',
          selected && 'bg-muted font-medium',
          selected && !active && 'bg-muted',
        )}
      >
        <span className="min-w-0 flex-1 truncate">
          {optionRender ? optionRender(option, { index }) : option.label}
        </span>
        {selected && <Check className="size-4 shrink-0 text-accent" />}
      </div>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <PopoverPrimitive.Anchor asChild>
        <button
          ref={setTriggerRef}
          type="button"
          id={id}
          name={name}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-haspopup="listbox"
          aria-activedescendant={open && activeIndex >= 0 ? `${triggers}-option-${activeIndex}` : undefined}
          aria-label={aria['aria-label']}
          aria-describedby={aria['aria-describedby']}
          aria-invalid={aria['aria-invalid']}
          disabled={disabled}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          onClick={() => setOpen(!open)}
          className={cn(
            fieldShell({ size, variant, status, disabled, className, multiline: multiple }),
            'cursor-pointer text-start',
            multiple && 'min-h-[var(--ax-h-md)] py-1',
            open && 'border-accent',
            status === 'error' && 'border-danger',
          )}
          style={style}
          data-open={open || undefined}
          data-invalid={status === 'error' || undefined}
        >
          {prefix != null && <span className="shrink-0 text-fg-tertiary">{prefix}</span>}
          <span className="flex min-w-0 flex-1 items-center">{renderValue()}</span>
          {allowClear && valueList.length > 0 && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="清除"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clear();
              }}
              className="ax-press -mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
            >
              <X className="size-3.5" />
            </span>
          ) : loading ? (
            <Loader2 className="size-4 shrink-0 animate-[ax-spin-arc_var(--ax-dur-spin)_linear_infinite] text-fg-tertiary" />
          ) : (
            (suffixIcon ?? (
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-fg-tertiary transition-transform duration-[125ms]',
                  open && 'rotate-180',
                )}
              />
            ))
          )}
        </button>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className={cn(
            'ax-popover z-50 w-[var(--radix-popover-trigger-width)] min-w-[160px] overflow-hidden outline-none',
            POPUP_MOTION,
            dropdownClassName,
          )}
          onOpenAutoFocus={(e) => {
            if (searchable) {
              e.preventDefault();
              searchRef.current?.focus();
            }
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            triggerRef.current?.focus({ preventScroll: true });
          }}
        >
          {searchable && (
            <div className="border-b border-line-soft p-2">
              <input
                ref={searchRef}
                value={searchValue}
                placeholder={multiple ? '搜索或新建' : '搜索'}
                onChange={(e) => {
                  setSearch(e.target.value);
                  onSearch?.(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={onKeyDown}
                className="h-8 w-full rounded-inner bg-muted-soft px-2 text-base text-fg outline-none placeholder:text-fg-disabled"
              />
            </div>
          )}
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
});
