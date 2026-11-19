import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

export interface SpinProps {
  spinning?: boolean;
  size?: 'small' | 'default' | 'large';
  tip?: React.ReactNode;
  delay?: number;
  indicator?: React.ReactNode;
  fullscreen?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE = { small: 16, default: 24, large: 32 };

export function Spin({
  spinning = true,
  size = 'default',
  tip,
  delay,
  indicator,
  fullscreen,
  children,
  className,
  style,
}: SpinProps) {
  const [visible, setVisible] = useState(spinning);

  useEffect(() => {
    if (!delay) {
      setVisible(spinning);
      return;
    }
    if (!spinning) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [spinning, delay]);

  const dot = (
    <span className="inline-flex flex-col items-center gap-2 text-accent">
      {indicator ?? (
        <span
          className="ax-spinner block"
          style={{ width: SIZE[size], height: SIZE[size] }}
          aria-hidden
        />
      )}
      {tip && <span className="text-sm text-fg-secondary">{tip}</span>}
    </span>
  );

  if (!children && !fullscreen) {
    return visible ? (
      <span role="status" aria-label="加载中" className={cn('inline-flex', className)} style={style}>
        {dot}
      </span>
    ) : null;
  }

  if (fullscreen) {
    return visible ? (
      <div className="ax-scrim fixed inset-0 z-[1000] grid place-items-center">{dot}</div>
    ) : null;
  }

  return (
    <div className={cn('relative', className)} style={style} aria-busy={spinning}>
      <div className={cn('transition-opacity duration-[125ms]', visible && 'pointer-events-none opacity-40 blur-[1px]')}>
        {children}
      </div>
      {visible && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-container bg-surface/80 px-3 py-2 shadow-pop backdrop-blur-sm">{dot}</div>
        </div>
      )}
    </div>
  );
}
