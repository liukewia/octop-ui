import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { FADE_MOTION, SHEET_MOTION } from '../../lib/motion';

export interface BottomSheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onClose?: () => void;
  afterOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  /** `auto` 由内容撑开，`half`/`full` 固定比例，数字按 px */
  height?: number | string | 'auto' | 'half' | 'full';
  closable?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  /** 顶部的抓手条，触屏默认有 */
  showHandle?: boolean;
  /** 下拉关闭，默认开 */
  dragToClose?: boolean;
  className?: string;
  bodyClassName?: string;
  style?: React.CSSProperties;
  zIndex?: number;
}

function resolveHeight(height: BottomSheetProps['height']) {
  if (height === undefined || height === 'auto') return { maxHeight: '88dvh' };
  if (height === 'half') return { height: '50dvh' };
  if (height === 'full') return { height: '92dvh' };
  return { height: typeof height === 'number' ? `${height}px` : height };
}

/**
 * 底部抽屉：手机上离拇指最近的浮层。
 * 抓手条可以往下拖 —— 位移小于 96px 会弹回去；超过就关掉。
 * 拖的时候不跟着做缩放，只跟手，其他什么都不变。
 */
export function BottomSheet({
  open,
  defaultOpen,
  onClose,
  afterOpenChange,
  title,
  children,
  extra,
  footer,
  height = 'auto',
  closable = true,
  mask = true,
  maskClosable = true,
  keyboard = true,
  showHandle = true,
  dragToClose = true,
  className,
  bodyClassName,
  style,
  zIndex,
}: BottomSheetProps) {
  const [innerOpen, setInnerOpen] = useState(!!defaultOpen);
  const isOpen = open ?? innerOpen;
  const [drag, setDrag] = useState(0);
  const startY = useRef(0);
  const dragging = useRef(false);

  const close = () => {
    if (open === undefined) setInnerOpen(false);
    onClose?.();
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(next) => {
        if (open === undefined) setInnerOpen(next);
        if (!next) onClose?.();
        afterOpenChange?.(next);
      }}
    >
      <DialogPrimitive.Portal>
        {mask && (
          <DialogPrimitive.Overlay
            className={cn('ax-scrim fixed inset-0 z-50', FADE_MOTION)}
            style={{ zIndex }}
          />
        )}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onPointerDownOutside={(e) => {
            if (!maskClosable) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!keyboard) e.preventDefault();
          }}
          style={{
            zIndex: zIndex ? zIndex + 1 : undefined,
            ...resolveHeight(height),
            ...(drag ? { transform: `translateY(${drag}px)` } : null),
            ...style,
          }}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-page border-t border-line bg-surface shadow-high outline-none',
            SHEET_MOTION,
            drag ? 'transition-none' : 'transition-transform duration-[225ms] ease-standard',
            className,
          )}
        >
          {showHandle && (
            <div
              className="flex justify-center pt-2 pb-1"
              onPointerDown={(e) => {
                if (!dragToClose) return;
                dragging.current = true;
                startY.current = e.clientY;
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!dragging.current) return;
                setDrag(Math.max(0, e.clientY - startY.current));
              }}
              onPointerUp={() => {
                if (!dragging.current) return;
                dragging.current = false;
                if (drag > 96) close();
                setDrag(0);
              }}
            >
              <span
                aria-hidden
                className="h-1 w-9 cursor-grab touch-none rounded-full bg-line-strong active:cursor-grabbing"
              />
            </div>
          )}

          {(title || extra || closable) && (
            <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-1">
              <DialogPrimitive.Title className="min-w-0 flex-1 text-lg font-semibold text-fg">
                {title}
              </DialogPrimitive.Title>
              <div className="flex shrink-0 items-center gap-1">
                {extra}
                {closable && (
                  <button
                    type="button"
                    aria-label="关闭"
                    onClick={close}
                    className="ax-press ax-focus -me-1 inline-flex size-8 items-center justify-center rounded-element text-fg-secondary transition-colors duration-[125ms] ease-standard hover:bg-muted hover:text-fg"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3 text-md leading-relaxed text-fg-secondary',
              bodyClassName,
            )}
          >
            {children}
          </div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-line-soft px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
