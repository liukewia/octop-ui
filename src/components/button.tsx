import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../lib/cn';

export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'large' | 'middle' | 'small';
export type ButtonShape = 'default' | 'circle' | 'round';

const button = cva(
  // 没有任何描边与投影：Astryx 的按钮是「一块颜色」，层次只靠填充深浅
  [
    'ax-press ax-focus relative inline-flex select-none items-center justify-center',
    'gap-2 whitespace-nowrap font-medium',
    'transition-colors [transition-timing-function:var(--ax-ease-standard)]',
    'disabled:pointer-events-none disabled:bg-muted disabled:text-fg-disabled',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      type: {
        primary: 'bg-accent text-on-accent hover:bg-accent-hover',
        default: 'bg-muted text-fg hover:bg-muted-strong',
        // Astryx 没有虚线按钮：降级成次级填充，保留 API 不保留虚线
        dashed: 'bg-muted text-fg hover:bg-muted-strong',
        text: 'bg-transparent text-fg hover:bg-muted-soft',
        link: 'bg-transparent px-0 text-fg underline decoration-line-strong underline-offset-[3px] hover:decoration-fg',
      },
      size: {
        small: 'h-[var(--ax-h-sm)] px-3 text-sm',
        middle: 'h-[var(--ax-h-md)] px-4 text-base',
        large: 'h-[var(--ax-h-lg)] px-5 text-md',
      },
      shape: {
        default: 'rounded-element',
        round: 'rounded-full',
        circle: 'rounded-full !px-0',
      },
      block: { true: 'w-full', false: '' },
      danger: { true: '', false: '' },
      ghost: { true: 'bg-transparent', false: '' },
    },
    compoundVariants: [
      // 破坏性按钮：柔和红底 + 同族深字（不是红描边）
      {
        type: ['primary', 'default', 'dashed'],
        danger: true,
        class: 'bg-danger-bg text-danger-fg hover:bg-[color-mix(in_srgb,var(--ax-danger-bg)_84%,var(--ax-danger))]',
      },
      { type: ['text', 'link'], danger: true, class: 'text-danger-fg' },
      // ghost：透明底，靠一层极淡描边站住（深色背景上的次要操作）
      {
        type: ['primary', 'default', 'dashed'],
        ghost: true,
        class: 'border border-line-strong bg-transparent text-fg hover:bg-muted-soft',
      },
      { type: ['primary'], ghost: true, danger: true, class: 'border-danger-fg/40 text-danger-fg' },
      { shape: 'circle', size: 'small', class: 'w-[var(--ax-h-sm)]' },
      { shape: 'circle', size: 'middle', class: 'w-[var(--ax-h-md)]' },
      { shape: 'circle', size: 'large', class: 'w-[var(--ax-h-lg)]' },
    ],
    defaultVariants: {
      type: 'default',
      size: 'middle',
      shape: 'default',
      block: false,
      danger: false,
      ghost: false,
    },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'color'> {
  /** 按钮类型。dashed 会降级为次级填充（Astryx 没有虚线形态） */
  type?: ButtonType;
  size?: ButtonSize;
  shape?: ButtonShape;
  danger?: boolean;
  ghost?: boolean;
  /** `true` 走默认延迟；`{ delay }` 自定义毫秒；`0` 不延迟 */
  loading?: boolean | { delay?: number };
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  block?: boolean;
  href?: string;
  target?: string;
  /** 原生 button 的 type */
  htmlType?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
}

function Spinner({ delay = 225 }: { delay?: number }) {
  // 延迟 225ms 淡入：瞬时请求不会闪一下图标（Astryx 的 medium-min）
  return (
    <span
      aria-hidden
      className="ax-spinner inline-block size-4 animate-[ax-fade-in_125ms_var(--ax-ease-standard)_225ms_both]"
      style={delay === 0 ? { animationDelay: '0ms' } : undefined}
    />
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    type = 'default',
    size = 'middle',
    shape = 'default',
    danger,
    ghost,
    loading = false,
    icon,
    iconPosition = 'start',
    block,
    href,
    target,
    htmlType = 'button',
    className,
    children,
    disabled,
    onClick,
    ...rest
  } = props;

  const isLoading = loading !== false && loading !== undefined;
  const delay = typeof loading === 'object' ? loading.delay : 225;
  const classes = cn(
    button({ type, size, shape, block, danger, ghost }),
    // 图标按钮（无 children）在三个方向上都收成正方形
    !children && icon && !isLoading && shape !== 'circle' && 'aspect-square !px-0',
    isLoading && 'cursor-default',
    className,
  );

  const content = (
    <>
      {isLoading ? (
        <Spinner delay={delay} />
      ) : (
        icon && iconPosition === 'start' && <span className="inline-flex">{icon}</span>
      )}
      {children}
      {!isLoading && icon && iconPosition === 'end' && <span className="inline-flex">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        aria-disabled={disabled || isLoading || undefined}
        data-disabled={disabled ? 'true' : undefined}
        className={cn(classes, (disabled || isLoading) && 'pointer-events-none opacity-100')}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={htmlType}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={classes}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
});

/**
 * `Button.Group`。视觉上等价于 Space.Compact：相邻按钮共用一条边，
 * 只有两端保留圆角。真正的合并逻辑在 Space.Compact 的 CSS 里。
 */
export const ButtonGroup = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ButtonGroup({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="group"
        className={cn('ax-compact inline-flex items-center', className)}
        {...rest}
      />
    );
  },
);
