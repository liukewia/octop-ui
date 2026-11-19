import { forwardRef } from 'react';
import { cn } from '../lib/cn';

type Semantic = 'secondary' | 'success' | 'warning' | 'danger' | undefined;

const SEMANTIC: Record<NonNullable<Semantic>, string> = {
  secondary: 'text-fg-secondary',
  success: 'text-success-fg',
  warning: 'text-warning-fg',
  danger: 'text-danger-fg',
};

interface BaseTextProps extends React.HTMLAttributes<HTMLElement> {
  type?: Semantic;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  delete?: boolean;
  code?: boolean;
  mark?: boolean;
  keyboard?: boolean;
  disabled?: boolean;
  ellipsis?: boolean | { rows?: number };
}

function textClasses(props: BaseTextProps) {
  const { type, strong, italic, underline, delete: del, code, keyboard, disabled, ellipsis } = props;
  return cn(
    type && SEMANTIC[type],
    strong && 'font-medium',
    italic && 'italic',
    underline && 'underline underline-offset-[3px]',
    del && 'line-through',
    code && 'rounded-inner bg-muted px-1.5 py-0.5 font-mono text-[0.9em]',
    keyboard &&
      'rounded-inner border border-line-strong px-1.5 py-0.5 font-mono text-[0.85em] shadow-[0_1px_0_var(--ax-line-strong)]',
    disabled && 'cursor-not-allowed text-fg-disabled',
    ellipsis &&
      (typeof ellipsis === 'object' && ellipsis.rows
        ? 'line-clamp-[var(--ax-rows)]'
        : 'block truncate'),
  );
}

export const Text = forwardRef<HTMLSpanElement, BaseTextProps>(function Text(
  { className, type, ellipsis, style, ...rest },
  ref,
) {
  const rows = typeof ellipsis === 'object' ? ellipsis.rows : undefined;
  return (
    <span
      ref={ref}
      className={cn(textClasses({ ...rest, type, ellipsis }), className)}
      style={rows ? ({ '--ax-rows': rows, ...style } as React.CSSProperties) : style}
      {...rest}
    />
  );
});

export const Paragraph = forwardRef<HTMLParagraphElement, BaseTextProps>(function Paragraph(
  { className, type, ellipsis, style, ...rest },
  ref,
) {
  const rows = typeof ellipsis === 'object' ? ellipsis.rows : undefined;
  return (
    <p
      ref={ref}
      className={cn('my-0 leading-relaxed', textClasses({ ...rest, type, ellipsis }), className)}
      style={rows ? ({ '--ax-rows': rows, ...style } as React.CSSProperties) : style}
      {...rest}
    />
  );
});

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  type?: Semantic;
  disabled?: boolean;
  ellipsis?: boolean;
  underline?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { className, type, disabled, ellipsis, underline = true, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      aria-disabled={disabled || undefined}
      className={cn(
        'ax-link rounded-inner',
        underline && 'underline',
        !underline && 'no-underline hover:underline',
        type && SEMANTIC[type],
        disabled && 'pointer-events-none text-fg-disabled no-underline',
        ellipsis && 'inline-block max-w-full truncate align-bottom',
        className,
      )}
      {...rest}
    />
  );
});

const TITLE_SIZE = {
  1: 'text-3xl',
  2: 'text-2xl',
  3: 'text-xl',
  4: 'text-lg',
  5: 'text-base',
} as const;

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5;
  type?: Semantic;
  ellipsis?: boolean;
  disabled?: boolean;
}

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title(
  { level = 1, className, type, ellipsis, disabled, ...rest },
  ref,
) {
  const Tag = `h${level}` as 'h1';
  return (
    <Tag
      ref={ref}
      className={cn(
        'm-0 font-semibold',
        TITLE_SIZE[level],
        type && SEMANTIC[type],
        ellipsis && 'truncate',
        disabled && 'text-fg-disabled',
        className,
      )}
      {...rest}
    />
  );
});

export const Typography = { Title, Text, Paragraph, Link };

/* ------------------------------------------------------------------ Divider */

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'horizontal' | 'vertical';
  /** antd v5 叫 orientation；v6 叫 titlePlacement。两个都收。 */
  orientation?: 'left' | 'right' | 'center';
  titlePlacement?: 'left' | 'right' | 'center';
  dashed?: boolean;
  plain?: boolean;
  orientationMargin?: number | string;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    type = 'horizontal',
    orientation,
    titlePlacement,
    dashed,
    plain,
    orientationMargin,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  if (type === 'vertical') {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={cn('mx-2 inline-block h-[1em] w-px self-stretch bg-line align-middle', className)}
        {...rest}
      />
    );
  }

  const placement = titlePlacement ?? orientation ?? 'center';

  if (!children) {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn('my-4 h-px w-full', dashed ? 'border-t border-dashed border-line' : 'bg-line', className)}
        {...rest}
      />
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      className={cn(
        'my-4 flex w-full items-center gap-3 text-sm text-fg-secondary',
        className,
      )}
      {...rest}
    >
      {placement !== 'left' && (
        <span className={cn('h-px flex-1', dashed ? 'border-t border-dashed border-line' : 'bg-line')} />
      )}
      <span
        className={cn('shrink-0', plain ? 'font-normal' : 'font-medium')}
        style={{
          marginInlineStart: placement === 'left' ? orientationMargin : undefined,
          marginInlineEnd: placement === 'right' ? orientationMargin : undefined,
        }}
      >
        {children}
      </span>
      {placement !== 'right' && (
        <span className={cn('h-px flex-1', dashed ? 'border-t border-dashed border-line' : 'bg-line')} />
      )}
    </div>
  );
});
