import { forwardRef, useState } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../lib/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number | 'large' | 'small' | 'default';
  shape?: 'circle' | 'square';
  src?: React.ReactNode | string;
  srcSet?: string;
  alt?: string;
  icon?: React.ReactNode;
  draggable?: boolean;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  onError?: () => boolean;
  gap?: number;
}

const SIZE = { large: 48, small: 24, default: 36 } as const;

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    size = 'default',
    shape = 'circle',
    src,
    srcSet,
    alt,
    icon,
    children,
    className,
    style,
    onError,
    ...rest
  },
  ref,
) {
  const px = typeof size === 'number' ? size : SIZE[size];
  const [failed, setFailed] = useState(false);

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden',
        // 默认头像：中性灰底 + 正文色字，不是白字压浅灰
        'bg-[var(--ax-hue-gray-bg)] text-fg',
        shape === 'circle' ? 'rounded-full' : 'rounded-element',
        className,
      )}
      style={{ width: px, height: px, fontSize: Math.max(12, Math.round(px / 2.8)), ...style }}
      {...rest}
    >
      {typeof src === 'string' && !failed ? (
        <>
          <AvatarPrimitive.Image
            src={src}
            srcSet={srcSet}
            alt={alt ?? ''}
            onLoadingStatusChange={(status) => {
              if (status === 'error') {
                const keep = onError?.();
                if (!keep) setFailed(true);
              }
            }}
            className="size-full object-cover"
          />
          <AvatarPrimitive.Fallback className="grid size-full place-items-center">
            {children ?? icon ?? 'U'}
          </AvatarPrimitive.Fallback>
        </>
      ) : (
        <span className="grid size-full place-items-center leading-none">
          {failed ? children : (icon ?? children ?? 'U')}
        </span>
      )}
    </AvatarPrimitive.Root>
  );
});

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  maxCount?: number;
  maxStyle?: React.CSSProperties;
  maxPopoverPlacement?: 'top' | 'bottom';
  size?: AvatarProps['size'];
  shape?: AvatarProps['shape'];
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { maxCount, children, className, maxStyle, size, shape, ...rest },
  ref,
) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const shown = maxCount && items.length > maxCount ? items.slice(0, maxCount) : items;
  const restCount = items.length - shown.length;

  return (
    <div ref={ref} className={cn('flex items-center', className)} {...rest}>
      {shown.map((child, i) => (
        <span key={i} className="-ms-2 rounded-full shadow-[0_0_0_2px_var(--ax-surface)] first:ms-0">
          {child}
        </span>
      ))}
      {restCount > 0 && (
        <span
          className="-ms-2 inline-flex items-center justify-center rounded-full bg-muted text-xs font-medium text-fg-secondary shadow-[0_0_0_2px_var(--ax-surface)]"
          style={{
            width: typeof size === 'number' ? size : SIZE[(size ?? 'default') as 'default'],
            height: typeof size === 'number' ? size : SIZE[(size ?? 'default') as 'default'],
            borderRadius: shape === 'square' ? 10 : 9999,
            ...maxStyle,
          }}
        >
          +{restCount}
        </span>
      )}
    </div>
  );
});
