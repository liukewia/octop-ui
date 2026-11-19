import { forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../lib/cn';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
  value?: string | number;
}

/** 单颗单选：视觉是 18px 圆圈 + 8px 实心点，无回弹 */
export const Radio = forwardRef<HTMLLabelElement, RadioProps>(function Radio(
  { checked, defaultChecked, disabled, onChange, children, className, value, name, ...rest },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn(
        'group inline-flex cursor-pointer select-none items-center gap-2 text-base text-fg',
        disabled && 'cursor-not-allowed text-fg-disabled',
        className,
      )}
    >
      <span className="relative grid size-[18px] shrink-0 place-items-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...rest}
        />
        <span
          className={cn(
            'ax-press pointer-events-none grid size-[18px] place-items-center rounded-full border bg-surface transition-[border-color,background-color] duration-[125ms]',
            'border-line-strong',
            'peer-checked:border-accent',
            'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-accent',
            'peer-disabled:border-line peer-disabled:bg-muted',
            'peer-checked:[&>span]:scale-100',
          )}
        >
          <span className="size-2 scale-0 rounded-full bg-accent transition-transform duration-[125ms] ease-standard" />
        </span>
      </span>
      {children != null && <span className="leading-5">{children}</span>}
    </label>
  );
});

export interface RadioOptionType {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: RadioChangeEvent) => void;
  options?: (RadioOptionType | string | number)[];
  optionType?: 'default' | 'button';
  buttonStyle?: 'outline' | 'solid';
  disabled?: boolean;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface RadioChangeEvent {
  target: { value: string | number; checked: boolean };
  nativeEvent: Event;
  stopPropagation: () => void;
  preventDefault: () => void;
  type: 'change';
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    value,
    defaultValue,
    onChange,
    options = [],
    optionType = 'default',
    buttonStyle = 'outline',
    disabled,
    name,
    className,
    style,
    children,
  },
  ref,
) {
  const normalized: RadioOptionType[] = options.map((option) =>
    typeof option === 'object' ? option : { label: option, value: option },
  );

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      name={name}
      value={value !== undefined ? String(value) : undefined}
      defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
      disabled={disabled}
      orientation="horizontal"
      onValueChange={(next) => {
        const option = normalized.find((o) => String(o.value) === next);
        onChange?.({
          target: { value: option?.value ?? next, checked: true },
          nativeEvent: new Event('change'),
          stopPropagation: () => undefined,
          preventDefault: () => undefined,
          type: 'change',
        });
      }}
      className={cn(
        optionType === 'button' ? 'inline-flex items-center gap-2' : 'inline-flex flex-wrap items-center gap-4',
        className,
      )}
      style={style}
    >
      {normalized.map((option) =>
        optionType === 'button' ? (
          <RadioButton
            key={String(option.value)}
            value={option.value}
            disabled={disabled || option.disabled}
            solid={buttonStyle === 'solid'}
          >
            {option.label}
          </RadioButton>
        ) : (
          <RadioGroupPrimitive.Item
            key={String(option.value)}
            value={String(option.value)}
            disabled={disabled || option.disabled}
            className={cn(
              'ax-press ax-focus group inline-flex cursor-pointer select-none items-center gap-2 text-base text-fg outline-none',
              'disabled:cursor-not-allowed disabled:text-fg-disabled',
            )}
          >
            <span className="grid size-[18px] shrink-0 place-items-center rounded-full border border-line-strong bg-surface transition-colors group-data-[state=checked]:border-accent group-disabled:border-line group-disabled:bg-muted">
              <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-accent" />
            </span>
            <span className="leading-5">{option.label}</span>
          </RadioGroupPrimitive.Item>
        ),
      )}
      {children}
    </RadioGroupPrimitive.Root>
  );
});

interface RadioButtonProps {
  value: string | number;
  disabled?: boolean;
  solid?: boolean;
  children: React.ReactNode;
}

/** antd 的 Radio.Button：分段式胶囊，选中是实心 accent */
function RadioButton({ value, disabled, solid, children }: RadioButtonProps) {
  return (
    <RadioGroupPrimitive.Item
      value={String(value)}
      disabled={disabled}
      className={cn(
        'ax-press ax-focus inline-flex h-[var(--ax-h-sm)] items-center rounded-element px-3 text-base transition-colors',
        'text-fg-secondary data-[state=checked]:text-fg',
        solid
          ? 'data-[state=checked]:bg-accent data-[state=checked]:text-on-accent'
          : 'data-[state=checked]:bg-muted',
        'disabled:text-fg-disabled',
      )}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}
