import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export type SpaceSize = 'small' | 'middle' | 'large' | number;
export type SpaceDirection = 'horizontal' | 'vertical';

const GAP: Record<string, number> = { small: 8, middle: 16, large: 24 };

function gapOf(size?: SpaceSize): number {
  if (typeof size === 'number') return size;
  return GAP[size ?? 'small'] ?? 8;
}

function toGap(
  size: SpaceSize | [SpaceSize, SpaceSize] | undefined,
): { rowGap: number; columnGap: number } {
  if (Array.isArray(size)) return { rowGap: gapOf(size[0]), columnGap: gapOf(size[1]) };
  const n = gapOf(size);
  return { rowGap: n, columnGap: n };
}

export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: SpaceDirection;
  size?: SpaceSize | [SpaceSize, SpaceSize];
  align?: 'start' | 'end' | 'center' | 'baseline';
  justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around';
  wrap?: boolean;
  split?: React.ReactNode;
  /** 子项是否撑满（antd 的 fill） */
  fill?: boolean;
}

const ALIGN = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
} as const;

const JUSTIFY = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
} as const;

const SpaceImpl = forwardRef<HTMLDivElement, SpaceProps>(function Space(
  {
    direction = 'horizontal',
    size = 'small',
    align,
    justify,
    wrap = false,
    split,
    fill,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const gap = toGap(size);
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const nodes: React.ReactNode[] = [];
  items.forEach((child, index) => {
    if (index > 0 && split) {
      nodes.push(
        <span key={`split-${index}`} className="inline-flex items-center text-fg-disabled">
          {split}
        </span>,
      );
    }
    nodes.push(
      <div key={index} className={cn('inline-flex min-w-0', fill && 'flex-1')}>
        {child}
      </div>,
    );
  });

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        wrap && 'flex-wrap',
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        fill && 'w-full',
        className,
      )}
      style={{ ...gap, ...style }}
      {...rest}
    >
      {nodes}
    </div>
  );
});

/**
 * antd 的 `Space.Compact`：把相邻控件拼成一个整体 —— 只保留两端圆角，
 * 中间共用一条 1px 描边。用自己的 CSS 变量实现，不与具体组件耦合。
 */
const Compact = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Compact({ className, ...rest }, ref) {
    return <div ref={ref} className={cn('ax-compact inline-flex items-stretch', className)} {...rest} />;
  },
);

export const Space = Object.assign(SpaceImpl, { Compact });

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
  gap?: number | string;
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  flex?: number | string;
  component?: React.ElementType;
}

const FLEX_ALIGN = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
} as const;

const FLEX_JUSTIFY = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
} as const;

export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex(
  { vertical, gap = 8, align, justify, wrap, flex, component, className, style, children, ...rest },
  ref,
) {
  const Tag = (component ?? 'div') as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={cn(
        'flex min-w-0',
        vertical ? 'flex-col' : 'flex-row',
        align && FLEX_ALIGN[align],
        justify && FLEX_JUSTIFY[justify],
        wrap === true && 'flex-wrap',
        wrap === 'wrap-reverse' && 'flex-wrap-reverse',
        wrap === 'nowrap' && 'flex-nowrap',
        className,
      )}
      style={{
        gap,
        ...(flex !== undefined ? { flex } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
});
