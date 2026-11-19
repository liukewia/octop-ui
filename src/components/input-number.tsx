import { forwardRef, useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../lib/cn';
import {
  fieldShell,
  type SizeType,
  type StatusType,
  type VariantType,
} from '../lib/field';

export interface InputNumberProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'prefix'> {
  value?: number | string | null;
  defaultValue?: number | string;
  onChange?: (value: number | null) => void;
  onStep?: (value: number, info: { offset: number; type: 'up' | 'down' }) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  /** 显示格式化 / 解析（antd 的 formatter / parser） */
  formatter?: (value: number | string | undefined) => string;
  parser?: (display: string) => number | string;
  prefix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  controls?: boolean;
  size?: SizeType;
  status?: StatusType;
  variant?: VariantType;
  keyboard?: boolean;
}

function clamp(n: number, min?: number, max?: number) {
  let v = n;
  if (min !== undefined) v = Math.max(min, v);
  if (max !== undefined) v = Math.min(max, v);
  return v;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    value,
    defaultValue,
    onChange,
    onStep,
    min,
    max,
    step = 1,
    precision,
    formatter,
    parser,
    prefix,
    addonBefore,
    addonAfter,
    controls = true,
    size = 'middle',
    status,
    variant = 'outlined',
    keyboard = true,
    className,
    disabled,
    placeholder,
    onBlur,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const format = (v: number | string | null | undefined) => {
    if (v === null || v === undefined || v === '') return '';
    const n = typeof v === 'string' ? Number(v) : v;
    if (Number.isNaN(n)) return String(v);
    const fixed = precision !== undefined ? n.toFixed(precision) : String(n);
    return formatter ? formatter(fixed) : fixed;
  };

  const [inner, setInner] = useState<number | string | null>(defaultValue ?? null);
  const [text, setText] = useState(() => format(value ?? defaultValue));
  const current = value !== undefined ? value : inner;

  useEffect(() => {
    // 受控值变化才回写显示；初次挂载不要用 undefined 覆盖 defaultValue
    if (value === undefined) return;
    setText(format(value));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (next: number | null) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
    setText(format(next));
  };

  const parse = (raw: string) => {
    const cleaned = parser ? String(parser(raw)) : raw.replace(/[^\d.eE+-]/g, '');
    const n = Number(cleaned);
    return Number.isNaN(n) ? null : n;
  };

  const stepBy = (offset: number) => {
    const base = typeof current === 'string' ? Number(current) : (current ?? 0);
    const next = clamp(Number((base + offset).toFixed(precision ?? 10)), min, max);
    commit(next);
    onStep?.(next, { offset, type: offset > 0 ? 'up' : 'down' });
  };

  return (
    <div
      className={cn(
        fieldShell({ size, variant, status, disabled, className }),
        'gap-1 px-2.5',
        status === 'error' && 'border-danger',
      )}
      data-invalid={status === 'error' || undefined}
    >
      {addonBefore != null && (
        <span className="-ms-2.5 me-1 flex h-full shrink-0 items-center border-e border-line bg-muted px-2.5 text-fg-secondary">
          {addonBefore}
        </span>
      )}
      {prefix != null && <span className="shrink-0 text-fg-tertiary">{prefix}</span>}
      <input
        ref={ref}
        inputMode="decimal"
        role="spinbutton"
        aria-valuenow={typeof current === 'number' ? current : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const parsed = parse(e.target.value);
          if (parsed !== null) {
            if (value === undefined) setInner(parsed);
            onChange?.(clamp(parsed, min, max));
          } else if (e.target.value === '') {
            if (value === undefined) setInner(null);
            onChange?.(null);
          }
        }}
        onBlur={(e) => {
          const parsed = parse(e.target.value);
          commit(parsed === null ? null : clamp(parsed, min, max));
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!keyboard) return;
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            stepBy(step);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            stepBy(-step);
          }
          if (e.key === 'Enter') commit(parse((e.target as HTMLInputElement).value));
        }}
        className="h-full w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit tabular-nums outline-none placeholder:text-fg-disabled"
        {...rest}
      />
      {addonAfter != null && (
        <span className="-me-2.5 ms-1 flex h-full shrink-0 items-center border-s border-line bg-muted px-2.5 text-fg-secondary">
          {addonAfter}
        </span>
      )}
      {controls && (
        <div className="flex h-full shrink-0 flex-col justify-center gap-px">
          <button
            type="button"
            tabIndex={-1}
            aria-label="增加"
            disabled={disabled || (max !== undefined && Number(current) >= max)}
            onClick={() => stepBy(step)}
            className="ax-press flex h-[45%] w-6 items-center justify-center rounded-inner text-fg-tertiary hover:text-fg disabled:text-fg-disabled"
          >
            <Plus className="size-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="减少"
            disabled={disabled || (min !== undefined && Number(current) <= min)}
            onClick={() => stepBy(-step)}
            className="ax-press flex h-[45%] w-6 items-center justify-center rounded-inner text-fg-tertiary hover:text-fg disabled:text-fg-disabled"
          >
            <Minus className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
});
