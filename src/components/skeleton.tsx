import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  loading?: boolean;
  active?: boolean;
  avatar?: boolean | { size?: number | 'small' | 'large' | 'default'; shape?: 'circle' | 'square' };
  title?: boolean | { width?: number | string };
  paragraph?: boolean | { rows?: number; width?: number | string | (number | string)[] };
  round?: boolean;
  children?: React.ReactNode;
}

const bar = (active?: boolean) => cn('ax-skeleton', active && 'animate-breathe');

const SkeletonRoot = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    loading = true,
    active = true,
    avatar,
    title = true,
    paragraph = true,
    round,
    className,
    children,
    ...rest
  },
  ref,
) {
  if (!loading) return <>{children}</>;

  const avatarSize =
    typeof avatar === 'object'
      ? typeof avatar.size === 'number'
        ? avatar.size
        : avatar.size === 'small'
          ? 28
          : avatar.size === 'large'
            ? 48
            : 40
      : 40;

  return (
    <div ref={ref} className={cn('w-full', className)} aria-busy {...rest}>
      <div className="flex gap-4">
        {avatar && (
          <div
            className={cn(bar(active), 'shrink-0', typeof avatar === 'object' && avatar.shape === 'square' ? 'rounded-element' : 'rounded-full')}
            style={{ width: avatarSize, height: avatarSize }}
          />
        )}
        <div className="min-w-0 flex-1 space-y-3">
          {title && (
            <div
              className={cn(bar(active), 'h-4', round && 'rounded-full')}
              style={{ width: typeof title === 'object' ? (title.width ?? '40%') : '40%' }}
            />
          )}
          {paragraph && (
            <div className="space-y-2">
              {Array.from(
                { length: typeof paragraph === 'object' ? (paragraph.rows ?? 3) : 3 },
                (_, i) => {
                  const widths =
                    typeof paragraph === 'object' && Array.isArray(paragraph.width) ? paragraph.width : undefined;
                  const rows = typeof paragraph === 'object' ? (paragraph.rows ?? 3) : 3;
                  return (
                    <div
                      key={i}
                      className={cn(bar(active), 'h-3', round && 'rounded-full')}
                      style={{
                        width: widths?.[i] ?? (i === rows - 1 ? '60%' : '100%'),
                      }}
                    />
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export interface SkeletonButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  size?: 'small' | 'default' | 'large';
  shape?: 'default' | 'circle' | 'round' | 'square';
  block?: boolean;
}

const ButtonSkeleton = forwardRef<HTMLDivElement, SkeletonButtonProps>(function SkeletonButton(
  { active = true, size = 'default', shape = 'default', block, className, style, ...rest },
  ref,
) {
  const h = size === 'small' ? 28 : size === 'large' ? 48 : 40;
  const w = shape === 'square' || shape === 'circle' ? h : size === 'small' ? 64 : 88;
  return (
    <div
      ref={ref}
      className={cn(
        bar(active),
        block && 'w-full',
        shape === 'circle' ? 'rounded-full' : shape === 'round' ? 'rounded-full' : 'rounded-element',
        className,
      )}
      style={{ height: h, width: block ? '100%' : w, ...style }}
      {...rest}
    />
  );
});

const InputSkeleton = forwardRef<HTMLDivElement, SkeletonButtonProps>(function SkeletonInput(
  { active = true, size = 'default', block, className, style, ...rest },
  ref,
) {
  const h = size === 'small' ? 32 : size === 'large' ? 48 : 40;
  return (
    <div
      ref={ref}
      className={cn(bar(active), 'rounded-element', block ? 'w-full' : 'w-48', className)}
      style={{ height: h, ...style }}
      {...rest}
    />
  );
});

const AvatarSkeleton = forwardRef<HTMLDivElement, SkeletonButtonProps>(function SkeletonAvatar(
  { active = true, size = 'default', shape = 'circle', className, style, ...rest },
  ref,
) {
  const s = size === 'small' ? 28 : size === 'large' ? 48 : 40;
  return (
    <div
      ref={ref}
      className={cn(bar(active), shape === 'square' ? 'rounded-element' : 'rounded-full', className)}
      style={{ width: s, height: s, ...style }}
      {...rest}
    />
  );
});

export const Skeleton = Object.assign(SkeletonRoot, {
  Button: ButtonSkeleton,
  Input: InputSkeleton,
  Avatar: AvatarSkeleton,
});
