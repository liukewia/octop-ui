import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { Popover, type Placement } from '../tooltip';

export interface HoverCardProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  /** 悬停多久才出现，默认 120ms；太短会跟着鼠标乱闪 */
  openDelay?: number;
  /** 移出后多久收起，给一条从触发点走到卡片的路，默认 160ms */
  closeDelay?: number;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  overlayClassName?: string;
  zIndex?: number;
  className?: string;
}

/**
 * 悬浮卡：比 Tooltip 能装（标题 + 任意内容），比 Popover 轻（不用点）。
 * 延迟开门用的是同一套时钟，卡片出现后鼠标可以直接移进去，不会瞬间消失。
 */
export function HoverCard({
  title,
  content,
  children,
  placement = 'top',
  openDelay = 120,
  closeDelay = 160,
  disabled,
  open,
  onOpenChange,
  overlayClassName,
  zIndex,
  className,
}: HoverCardProps) {
  const [inner, setInner] = useState(false);
  const isOpen = disabled ? false : (open ?? inner);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  const setOpen = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };

  const scheduleOpen = () => {
    if (disabled) return;
    clear();
    openTimer.current = setTimeout(() => setOpen(true), openDelay);
  };

  const scheduleClose = () => {
    clear();
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  };

  if (!content && !title) return <>{children}</>;

  return (
    <Popover
      placement={placement}
      open={isOpen}
      onOpenChange={(next) => setOpen(next)}
      zIndex={zIndex}
      flush
      overlayClassName={cn('w-[min(320px,calc(100vw-32px))]', overlayClassName)}
      content={
        <div
          className="p-3"
          onMouseEnter={clear}
          onMouseLeave={scheduleClose}
          onFocus={clear}
          onBlur={scheduleClose}
        >
          {title && <div className="mb-1 text-base font-semibold text-fg">{title}</div>}
          <div className="text-base leading-relaxed text-fg-secondary">{content}</div>
        </div>
      }
    >
      <span
        className={cn('inline-flex', className)}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
      >
        {children}
      </span>
    </Popover>
  );
}
