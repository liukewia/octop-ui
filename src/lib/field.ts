import { cn } from './cn';

export type SizeType = 'small' | 'middle' | 'large';
export type VariantType = 'outlined' | 'borderless' | 'filled';
export type StatusType = 'error' | 'warning' | '' | undefined;

/** 控件高度按令牌走：触屏指针下 --ax-h-* 会自动抬高（C 端可点区） */
export const heightClass: Record<SizeType, string> = {
  small: 'h-[var(--ax-h-sm)]',
  middle: 'h-[var(--ax-h-md)]',
  large: 'h-[var(--ax-h-lg)]',
};

export const textClass: Record<SizeType, string> = {
  small: 'text-sm',
  middle: 'text-base',
  large: 'text-md',
};

export const padClass: Record<SizeType, string> = {
  small: 'px-2.5',
  middle: 'px-3',
  large: 'px-3.5',
};

export const variantClass: Record<VariantType, string> = {
  outlined: '',
  // 无边框：用在工具条 / 搜索框内嵌场景
  borderless: 'border-transparent bg-transparent hover:border-transparent',
  filled: 'border-transparent bg-muted hover:border-transparent hover:bg-muted-strong',
};

export function fieldShell(options: {
  size?: SizeType;
  variant?: VariantType;
  status?: StatusType;
  disabled?: boolean;
  className?: string;
  /** 多行控件不锁高度 */
  multiline?: boolean;
}) {
  const { size = 'middle', variant = 'outlined', status, disabled, className, multiline } = options;
  return cn(
    'ax-field relative flex w-full items-center gap-2',
    !multiline && heightClass[size],
    !multiline && textClass[size],
    padClass[size],
    variantClass[variant],
    status === 'error' && 'border-danger',
    status === 'warning' && 'border-warning',
    disabled && 'cursor-not-allowed bg-muted-soft text-fg-disabled hover:border-line-strong',
    variant === 'borderless' && 'hover:border-transparent',
    className,
  );
}

/** 受控 / 非受控都能拿到「当前值」的小工具，给 allowClear 用 */
export function nativeSetValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
