import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { POPUP_MOTION } from '../lib/motion';
import { fieldShell, type SizeType, type StatusType } from '../lib/field';

export type CascaderValue = (string | number)[];

export interface CascaderOption {
  value: string | number;
  label: React.ReactNode;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
}

export interface CascaderProps {
  options?: CascaderOption[];
  value?: CascaderValue | CascaderValue[] | null;
  defaultValue?: CascaderValue | CascaderValue[];
  onChange?: (value: (string | number)[] | (string | number)[][], selectedOptions: CascaderOption[] | CascaderOption[][]) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  multiple?: boolean;
  changeOnSelect?: boolean;
  expandTrigger?: 'click' | 'hover';
  displayRender?: (labels: React.ReactNode[], selectedOptions: CascaderOption[]) => React.ReactNode;
  size?: SizeType;
  status?: StatusType;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function findPath(options: CascaderOption[], value: CascaderValue | null): CascaderOption[] {
  if (!value || value.length === 0) return [];
  const path: CascaderOption[] = [];
  let level: CascaderOption[] | undefined = options;
  for (const key of value) {
    const found: CascaderOption | undefined = level?.find((option) => option.value === key);
    if (!found) break;
    path.push(found);
    level = found.children;
  }
  return path;
}

export function Cascader({
  options = [],
  value,
  defaultValue,
  onChange,
  placeholder = '请选择',
  disabled,
  allowClear = true,
  multiple,
  changeOnSelect,
  expandTrigger = 'click',
  displayRender,
  size = 'middle',
  status,
  className,
  open,
  onOpenChange,
}: CascaderProps) {
  const [inner, setInner] = useState<CascaderValue[]>(
    defaultValue ? (multiple ? (defaultValue as CascaderValue[]) : [defaultValue as CascaderValue]) : [],
  );
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = open ?? innerOpen;
  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
    if (next) setActive([]);
  };

  const values: CascaderValue[] =
    value === undefined
      ? inner
      : value === null
        ? []
        : multiple
          ? (value as CascaderValue[])
          : [value as CascaderValue];

  const [active, setActive] = useState<CascaderValue>([]);
  const [hoverPath, setHoverPath] = useState<CascaderValue>([]);

  const currentPath = useMemo(() => {
    const base = hoverPath.length ? hoverPath : values[0];
    return findPath(options, base ?? null);
  }, [hoverPath, values, options]);

  const columns = useMemo(() => {
    const cols: CascaderOption[][] = [options];
    currentPath.forEach((option) => {
      if (option.children?.length) cols.push(option.children);
    });
    return cols;
  }, [options, currentPath]);

  const columnsRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const list = columnsRef.current;
    if (!isOpen || !list || list.scrollWidth <= list.clientWidth) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const direction = getComputedStyle(list).direction === 'rtl' ? -1 : 1;
    list.scrollTo({ left: direction * (list.scrollWidth - list.clientWidth), behavior: reduced ? 'instant' : 'smooth' });
  }, [isOpen, columns.length]);

  const commit = (path: CascaderValue, selectedOptions: CascaderOption[], close = true) => {
    if (multiple) {
      const exists = values.some((item) => item.join('/') === path.join('/'));
      const nextValues = exists ? values.filter((item) => item.join('/') !== path.join('/')) : [...values, path];
      if (value === undefined) setInner(nextValues);
      const nextOptions = nextValues.map((item) => findPath(options, item));
      onChange?.(nextValues, nextOptions);
      return;
    }
    if (value === undefined) setInner([path]);
    onChange?.(path, selectedOptions);
    if (close) setOpen(false);
  };

  const select = (option: CascaderOption, columnIndex: number) => {
    const prefix = currentPath.slice(0, columnIndex).map((item) => item.value);
    const path = [...prefix, option.value];
    if (option.children?.length) {
      setHoverPath(path);
      setActive(path);
      if (changeOnSelect) commit(path, findPath(options, path), false);
      return;
    }
    commit(path, findPath(options, path));
    setHoverPath([]);
  };

  const labels = values.map((path) => {
    const selected = findPath(options, path);
    const text = selected.map((option) => option.label);
    return displayRender ? displayRender(text, selected) : text.map((t) => String(t)).join(' / ');
  });

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!isOpen)}
          className={cn(
            fieldShell({ size, status: status as StatusType, disabled, className }),
            'cursor-pointer text-start',
            isOpen && 'border-accent',
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', !labels.length && 'text-fg-disabled')}>
            {labels.length ? labels.join('，') : placeholder}
          </span>
          {allowClear && labels.length > 0 && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="清除"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (value === undefined) setInner([]);
                onChange?.(multiple ? [] : [], multiple ? [] : ([] as CascaderOption[]));
              }}
              className="ax-press inline-flex size-5 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
            >
              <X className="size-3.5" />
            </span>
          ) : (
            <ChevronRight className={cn('size-4 rotate-90 text-fg-tertiary transition-transform', isOpen && '-rotate-90')} />
          )}
        </button>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className={`ax-popover z-50 flex max-w-[calc(100vw-32px)] overflow-hidden p-0 outline-none ${POPUP_MOTION}`}
        >
          <div ref={columnsRef} className="flex min-w-0 overflow-x-auto overscroll-x-contain">
            {columns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className="max-h-[264px] w-[176px] shrink-0 overflow-y-auto p-1 [&:not(:last-child)]:border-e [&:not(:last-child)]:border-line-soft"
              >
                {column.map((option) => {
                  const selected = active[columnIndex] === option.value || currentPath[columnIndex]?.value === option.value;
                  const isLeaf = !option.children?.length;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => select(option, columnIndex)}
                      onMouseEnter={() => {
                        if (expandTrigger === 'hover' && option.children?.length) {
                          setHoverPath([...currentPath.slice(0, columnIndex).map((item) => item.value), option.value]);
                        }
                      }}
                      className={cn(
                        'ax-press flex h-9 w-full items-center gap-1 rounded-inner px-2.5 text-start text-base',
                        selected ? 'bg-muted font-medium text-fg' : 'text-fg hover:bg-muted-soft',
                        option.disabled && 'cursor-not-allowed text-fg-disabled',
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {!isLeaf && <ChevronRight className="size-3.5 shrink-0 text-fg-tertiary" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
