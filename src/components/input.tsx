import { forwardRef, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Search as SearchIcon, X } from 'lucide-react';
import { cn } from '../lib/cn';
import {
  fieldShell,
  heightClass,
  nativeSetValue,
  padClass,
  textClass,
  type SizeType,
  type StatusType,
  type VariantType,
} from '../lib/field';
import { Button } from './button';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: SizeType;
  status?: StatusType;
  variant?: VariantType;
  allowClear?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  showCount?: boolean;
  onClear?: () => void;
}

const InputBase = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    size = 'middle',
    status,
    variant = 'outlined',
    allowClear,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    showCount,
    onClear,
    className,
    disabled,
    readOnly,
    value,
    defaultValue,
    maxLength,
    onChange,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const innerRef = useRef<HTMLInputElement | null>(null);
  const [length, setLength] = useState(() => String(value ?? defaultValue ?? '').length);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (value !== undefined) setLength(String(value).length);
  }, [value]);

  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
  };

  const clear = () => {
    const el = innerRef.current;
    if (!el) return;
    nativeSetValue(el, '');
    onClear?.();
  };

  const control = (
    <>
      {prefix != null && <span className="flex shrink-0 items-center text-fg-tertiary">{prefix}</span>}
      <input
        ref={setRefs}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(e) => {
          setLength(e.target.value.length);
          onChange?.(e);
        }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-fg-disabled"
        {...rest}
      />
      {allowClear && length > 0 && !disabled && !readOnly && (
        <button
          type="button"
          aria-label="清除"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
          className="ax-press ax-focus -mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      )}
      {(showCount || suffix) && (
        <span className="flex shrink-0 items-center gap-1 text-fg-tertiary">
          {suffix}
          {showCount && (
            <span className="text-xs tabular-nums text-fg-disabled">
              {length}
              {maxLength ? ` / ${maxLength}` : ''}
            </span>
          )}
        </span>
      )}
    </>
  );

  if (addonBefore != null || addonAfter != null) {
    return (
      <div
        className={cn(
          'ax-field flex w-full items-stretch gap-0 overflow-hidden p-0',
          heightClass[size],
          textClass[size],
          status === 'error' && 'border-danger',
          focused && 'border-accent',
          disabled && 'bg-muted-soft text-fg-disabled',
          className,
        )}
        data-focused={focused || undefined}
        data-invalid={status === 'error' || undefined}
      >
        {addonBefore != null && (
          <span className="flex shrink-0 items-center border-e border-line bg-muted px-3 text-fg-secondary">
            {addonBefore}
          </span>
        )}
        <span className={cn('flex min-w-0 flex-1 items-center gap-2', padClass[size])}>{control}</span>
        {addonAfter != null && (
          <span className="flex shrink-0 items-center border-s border-line bg-muted px-3 text-fg-secondary">
            {addonAfter}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(fieldShell({ size, variant, status, disabled, className }), 'cursor-text')}
      data-invalid={status === 'error' || undefined}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          innerRef.current?.focus();
        }
      }}
    >
      {control}
    </div>
  );
});

/* --------------------------------------------------------------- TextArea */

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: SizeType;
  status?: StatusType;
  variant?: VariantType;
  allowClear?: boolean;
  showCount?: boolean;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  onClear?: () => void;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(props, ref) {
  const {
    size = 'middle',
    status,
    variant = 'outlined',
    allowClear,
    showCount,
    autoSize,
    onClear,
    className,
    disabled,
    value,
    defaultValue,
    maxLength,
    rows = 3,
    onChange,
    ...rest
  } = props;

  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const [length, setLength] = useState(() => String(value ?? defaultValue ?? '').length);

  useEffect(() => {
    if (value !== undefined) setLength(String(value).length);
  }, [value]);

  const resize = () => {
    const el = innerRef.current;
    if (!el || !autoSize) return;
    const opts = typeof autoSize === 'object' ? autoSize : {};
    const lineHeight = 22;
    el.style.height = 'auto';
    const min = (opts.minRows ?? 1) * lineHeight + 16;
    const max = opts.maxRows ? opts.maxRows * lineHeight + 16 : Infinity;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, min), max)}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  };

  useEffect(resize);

  const setRefs = (node: HTMLTextAreaElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
  };

  return (
    <div
      className={cn(
        fieldShell({ size, variant, status, disabled, className, multiline: true }),
        'flex-col items-stretch gap-1 py-2',
        status === 'error' && 'border-danger',
      )}
      data-invalid={status === 'error' || undefined}
    >
      <div className="flex items-start gap-2">
        <textarea
          ref={setRefs}
          rows={autoSize ? 1 : rows}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          disabled={disabled}
          onChange={(e) => {
            setLength(e.target.value.length);
            onChange?.(e);
            resize();
          }}
          className="min-h-[1.5em] w-full flex-1 resize-none border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-fg-disabled"
          {...rest}
        />
        {allowClear && length > 0 && !disabled && (
          <button
            type="button"
            aria-label="清除"
            tabIndex={-1}
            onClick={() => {
              const el = innerRef.current;
              if (!el) return;
              nativeSetValue(el, '');
              onClear?.();
            }}
            className="ax-press ax-focus mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {showCount && (
        <div className="self-end text-xs tabular-nums text-fg-disabled">
          {length}
          {maxLength ? ` / ${maxLength}` : ''}
        </div>
      )}
    </div>
  );
});

/* --------------------------------------------------------------- Password */

export interface PasswordProps extends Omit<InputProps, 'type'> {
  visibilityToggle?: boolean;
}

const Password = forwardRef<HTMLInputElement, PasswordProps>(function Password(
  { visibilityToggle = true, suffix, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <InputBase
      ref={ref}
      type={visible ? 'text' : 'password'}
      suffix={
        visibilityToggle ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? '隐藏密码' : '显示密码'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setVisible((v) => !v)}
            className="ax-focus -mr-1 inline-flex size-5 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : (
          suffix
        )
      }
      {...rest}
    />
  );
});

/* ----------------------------------------------------------------- Search */

export interface SearchProps extends Omit<InputProps, 'onChange' | 'suffix'> {
  onSearch?: (
    value: string,
    event?: React.SyntheticEvent,
    info?: { source: 'input' | 'clear' },
  ) => void;
  enterButton?: boolean | React.ReactNode;
  loading?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  { onSearch, enterButton, loading, onChange, onKeyDown, value, defaultValue, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  const read = () => innerRef.current?.value ?? '';

  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
  };

  const submit = (e?: React.SyntheticEvent, source: 'input' | 'clear' = 'input') => {
    onSearch?.(read(), e, { source });
  };

  const field = (
    <InputBase
      ref={setRefs}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        onChange?.(e);
        if (!enterButton) onSearch?.(e.target.value, e, { source: 'input' });
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === 'Enter') submit(e);
      }}
      onClear={() => submit(undefined, 'clear')}
      suffix={
        !enterButton ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="搜索"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => submit()}
            className="ax-focus -mr-1 inline-flex size-5 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
          >
            <SearchIcon className="size-4" />
          </button>
        ) : undefined
      }
      {...rest}
    />
  );

  if (!enterButton) return field;

  return (
    <div className="flex w-full items-stretch gap-2">
      {field}
      <Button
        type="primary"
        loading={loading}
        onClick={(e) => submit(e)}
        className="shrink-0"
        icon={typeof enterButton === 'boolean' ? <SearchIcon /> : undefined}
      >
        {typeof enterButton === 'boolean' ? null : enterButton}
      </Button>
    </div>
  );
});

/* -------------------------------------------------------------------- OTP */

export interface OTPProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: SizeType;
  status?: StatusType;
  disabled?: boolean;
  mask?: boolean;
  separator?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
}

const OTP = forwardRef<HTMLDivElement, OTPProps>(function OTP(
  {
    length = 6,
    value,
    defaultValue = '',
    onChange,
    size = 'middle',
    status,
    disabled,
    mask,
    separator,
    className,
    autoFocus,
  },
  ref,
) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const chars = Array.from({ length }, (_, i) => current[i] ?? '');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const setAt = (index: number, char: string) => {
    const arr = chars.slice();
    arr[index] = char;
    commit(arr.join('').slice(0, length));
  };

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  return (
    <div ref={ref} className={cn('flex items-center gap-2', className)}>
      {chars.map((char, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && separator != null && <span className="text-fg-disabled">{separator}</span>}
          <input
            ref={(node) => {
              inputs.current[i] = node;
            }}
            inputMode="text"
            autoComplete="one-time-code"
            disabled={disabled}
            value={mask && char ? '•' : char}
            aria-label={`第 ${i + 1} 位`}
            maxLength={1}
            onChange={(e) => {
              const v = e.target.value.replace(/\s/g, '');
              if (v.length > 1) {
                // 粘贴整串
                commit((current.slice(0, i) + v).slice(0, length));
                inputs.current[Math.min(i + v.length, length - 1)]?.focus();
                return;
              }
              setAt(i, v);
              if (v) inputs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !chars[i] && i > 0) {
                inputs.current[i - 1]?.focus();
              }
              if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
              if (e.key === 'ArrowRight' && i < length - 1) inputs.current[i + 1]?.focus();
            }}
            className={cn(
              'ax-field w-[calc(var(--ax-h-md)*0.98)] min-w-9 text-center text-lg font-medium tabular-nums outline-none',
              heightClass[size],
              status === 'error' && 'border-danger',
            )}
            data-invalid={status === 'error' || undefined}
          />
        </div>
      ))}
    </div>
  );
});

export const Input = Object.assign(InputBase, { TextArea, Password, Search, OTP });
export { TextArea, Password, Search, OTP };
