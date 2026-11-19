import { forwardRef, useState } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../lib/cn';

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: React.MouseEvent) => void;
  loading?: boolean;
  size?: 'small' | 'default';
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
  autoFocus?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked,
    onChange,
    loading,
    size = 'default',
    checkedChildren,
    unCheckedChildren,
    disabled,
    className,
    onClick,
    autoFocus,
    ...rest
  },
  ref,
) {
  const [inner, setInner] = useState(!!defaultChecked);
  const isChecked = checked ?? inner;
  const small = size === 'small';
  const hasLabel = checkedChildren != null || unCheckedChildren != null;

  return (
    <SwitchPrimitive.Root
      ref={ref}
      checked={isChecked}
      disabled={disabled || loading}
      autoFocus={autoFocus}
      onClick={(e) => onClick?.(e)}
      onCheckedChange={(next) => {
        if (checked === undefined) setInner(next);
        onChange?.(next, { preventDefault: () => undefined } as React.MouseEvent);
      }}
      className={cn(
        'ax-press ax-focus group relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-[125ms]',
        // 轨道 40×24；关 #c9c9c9，开 accent
        small ? 'h-5 w-8' : 'h-6 w-10',
        hasLabel && (small ? 'w-14' : 'w-16'),
        'bg-[var(--ax-switch-off)] data-[state=checked]:bg-accent',
        'disabled:cursor-not-allowed disabled:bg-accent-soft',
        className,
      )}
      {...rest}
    >
      {hasLabel && (
        <span
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-2xs font-medium text-fg-tertiary',
            'group-data-[state=checked]:text-on-accent',
          )}
        >
          <span className={cn('transition-opacity', isChecked ? 'opacity-0' : 'opacity-100')}>
            {unCheckedChildren}
          </span>
          <span className={cn('transition-opacity', isChecked ? 'opacity-100' : 'opacity-0')}>
            {checkedChildren}
          </span>
        </span>
      )}
      <SwitchPrimitive.Thumb
        className={cn(
          // 滑块要在两个端帽里"同心"：端帽圆心离轨道边缘 12px（高度的一半），
          // 所以滑块的圆心也必须落在 12px 上。轨道 40 高 24 时，20 的滑块要贴边 2px
          // （left = 40 − 20 − 2 = 18），而不是 left-4 的 16 —— 那会让右缝 4px、上下缝 2px。
          // 关态 16 的滑块同理：贴边 4px，圆心正好 12。
          'pointer-events-none absolute top-1/2 block -translate-y-1/2 rounded-full bg-surface shadow-none',
          'transition-[left,width,height] duration-[125ms] ease-standard',
          small
            ? 'left-0.5 size-4 data-[state=checked]:left-[calc(100%-18px)] data-[state=checked]:size-4'
            : 'left-1 size-4 data-[state=checked]:left-[calc(100%-22px)] data-[state=checked]:size-5',
        )}
      >
        {loading && (
          <span className="ax-spinner absolute inset-0 m-auto size-2.5 text-fg-disabled" />
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
});
