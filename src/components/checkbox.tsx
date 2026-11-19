import { forwardRef, useId } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '../lib/cn';

export interface CheckboxChangeEvent {
  target: { checked: boolean; value?: string | number };
  nativeEvent: Event;
  stopPropagation: () => void;
  preventDefault: () => void;
  type: 'change';
}

export interface CheckboxProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  value?: string | number;
  onChange?: (e: CheckboxChangeEvent) => void;
  children?: React.ReactNode;
  name?: string;
  required?: boolean;
}

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked,
    indeterminate,
    disabled,
    autoFocus,
    value,
    onChange,
    children,
    className,
    name,
    required,
    ...rest
  },
  ref,
) {
  const id = useId();

  return (
    <label
      ref={ref}
      htmlFor={id}
      className={cn(
        'group inline-flex cursor-pointer select-none items-center gap-2 text-base text-fg',
        disabled && 'cursor-not-allowed text-fg-disabled',
        className,
      )}
      {...rest}
    >
      <CheckboxPrimitive.Root
        id={id}
        name={name}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
        {...(checked !== undefined ? { checked } : defaultChecked !== undefined ? { defaultChecked } : null)}
        {...(indeterminate ? { checked: 'indeterminate' as const } : null)}
        onCheckedChange={(next) => {
          onChange?.({
            target: { checked: next === true, value },
            nativeEvent: new Event('change'),
            stopPropagation: () => undefined,
            preventDefault: () => undefined,
            type: 'change',
          });
        }}
        className={cn(
          'ax-press ax-focus relative grid size-[18px] shrink-0 place-items-center rounded-[5px] border bg-surface',
          'border-line-strong transition-colors duration-[125ms]',
          'data-[state=checked]:border-accent data-[state=checked]:bg-accent',
          'data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent',
          'disabled:border-line disabled:bg-muted',
          'data-[state=checked]:disabled:bg-accent-soft',
        )}
      >
        <CheckboxPrimitive.Indicator className="grid place-items-center">
          {indeterminate ? (
            <Minus className="size-3 text-on-accent" strokeWidth={3} />
          ) : (
            <Check className="size-3 text-on-accent" strokeWidth={3} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {children != null && <span className="leading-5">{children}</span>}
    </label>
  );
});

export interface CheckboxOptionType {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options?: (CheckboxOptionType | string | number)[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onChange?: (checkedValue: (string | number)[]) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup(
  { options, value, defaultValue = [], onChange, disabled, name, className, style, children },
  ref,
) {
  const current = value ?? defaultValue;
  const toggle = (v: string | number, checked: boolean) => {
    onChange?.(checked ? [...current, v] : current.filter((item) => item !== v));
  };

  const normalized: CheckboxOptionType[] = (options ?? []).map((option) =>
    typeof option === 'object' ? option : { label: option, value: option },
  );

  return (
    <div ref={ref} role="group" className={cn('inline-flex flex-wrap items-center gap-4', className)} style={style}>
      {normalized.map((option) => (
        <Checkbox
          key={String(option.value)}
          name={name}
          value={option.value}
          disabled={disabled || option.disabled}
          checked={current.includes(option.value)}
          onChange={(e) => toggle(option.value, e.target.checked)}
        >
          {option.label}
        </Checkbox>
      ))}
      {children}
    </div>
  );
});
