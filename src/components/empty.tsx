import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: React.ReactNode;
  image?: React.ReactNode | 'default' | 'simple';
  imageStyle?: React.CSSProperties;
  children?: React.ReactNode;
  variant?: 'default' | 'simple';
}

function DefaultImage() {
  return (
    <svg viewBox="0 0 64 41" className="size-16 text-line-strong" fill="none" aria-hidden>
      <ellipse cx="32" cy="33" rx="26" ry="7" fill="currentColor" opacity="0.12" />
      <path
        d="M12 20.5 20.6 9.8a3 3 0 0 1 2.4-1.2h18a3 3 0 0 1 2.4 1.2L52 20.5v9a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M12 21h10.5l2 4h16l2-4H52" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { description = '暂无数据', image, imageStyle, children, className, variant, ...rest },
  ref,
) {
  const simple = image === 'simple' || variant === 'simple';
  return (
    <div
      ref={ref}
      className={cn('flex flex-col items-center justify-center gap-3 py-8 text-center', className)}
      {...rest}
    >
      {simple ? (
        description && <div className="text-sm text-fg-disabled">{description}</div>
      ) : (
        <>
          <div style={imageStyle}>{image && image !== 'default' ? image : <DefaultImage />}</div>
          {description && <div className="text-sm text-fg-disabled">{description}</div>}
        </>
      )}
      {children}
    </div>
  );
});
