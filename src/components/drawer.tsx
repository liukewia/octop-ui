import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { Button } from './button';

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onClose?: () => void;
  afterOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
  className?: string;
  bodyClassName?: string;
  style?: React.CSSProperties;
  rootClassName?: string;
}

const SIDE_CLASS = {
  right: {
    box: 'inset-y-0 right-0 h-full rounded-s-container',
    closed: 'data-[state=closed]:translate-x-full',
  },
  left: {
    box: 'inset-y-0 left-0 h-full rounded-e-container',
    closed: 'data-[state=closed]:-translate-x-full',
  },
  top: {
    box: 'inset-x-0 top-0 w-full rounded-b-container',
    closed: 'data-[state=closed]:-translate-y-full',
  },
  bottom: {
    box: 'inset-x-0 bottom-0 w-full rounded-t-page',
    closed: 'data-[state=closed]:translate-y-full',
  },
} as const;

export function Drawer({
  open,
  defaultOpen,
  onClose,
  afterOpenChange,
  title,
  children,
  extra,
  footer,
  placement = 'right',
  width = 400,
  height,
  closable = true,
  mask = true,
  maskClosable = true,
  keyboard = true,
  destroyOnClose,
  zIndex,
  className,
  bodyClassName,
  style,
  rootClassName,
}: DrawerProps) {
  const side = SIDE_CLASS[placement];
  const isVertical = placement === 'top' || placement === 'bottom';

  return (
    <DialogPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => {
        if (!next) onClose?.();
        afterOpenChange?.(next);
      }}
    >
      <DialogPrimitive.Portal>
        {mask && (
          <DialogPrimitive.Overlay
            className="ax-scrim fixed inset-0 z-50 data-[state=closed]:opacity-0 data-[state=closed]:transition-opacity data-[state=closed]:duration-[125ms]"
            style={{ zIndex }}
          />
        )}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          data-destroy-on-close={destroyOnClose ? '' : undefined}
          onPointerDownOutside={(e) => {
            if (!maskClosable) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!keyboard) e.preventDefault();
          }}
          style={{
            zIndex: zIndex ? zIndex + 1 : undefined,
            ...(isVertical ? { maxHeight: height ?? '85dvh' } : { width }),
            ...style,
          }}
          className={cn(
            'fixed z-50 flex max-w-[100vw] flex-col border-line bg-surface shadow-high outline-none',
            !isVertical && 'max-w-[92vw] border-s',
            isVertical && 'border-t',
            'transition-transform duration-[300ms] ease-standard',
            side.box,
            side.closed,
            rootClassName,
            className,
          )}
        >
          {(title || extra || closable) && (
            <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
              <DialogPrimitive.Title className="min-w-0 flex-1 text-lg font-semibold text-fg">
                {title}
              </DialogPrimitive.Title>
              <div className="flex shrink-0 items-center gap-1">
                {extra}
                {closable && (
                  <button
                    type="button"
                    aria-label="关闭"
                    onClick={() => onClose?.()}
                    className="ax-press ax-focus -me-1 inline-flex size-8 items-center justify-center rounded-element text-fg-secondary hover:bg-muted hover:text-fg"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className={cn('flex-1 overflow-y-auto px-5 py-4 text-md leading-relaxed text-fg-secondary', bodyClassName)}>
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-line-soft px-5 py-3.5">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface DrawerFooterProps {
  onOk?: () => void;
  onCancel?: () => void;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  loading?: boolean;
}

/** 常用页脚，C 端偏好的顺序：取消在左、主操作在右 */
export function DrawerFooter({ onOk, onCancel, okText = '确定', cancelText = '取消', loading }: DrawerFooterProps) {
  return (
    <>
      <Button onClick={onCancel}>{cancelText}</Button>
      <Button type="primary" onClick={onOk} loading={loading}>
        {okText}
      </Button>
    </>
  );
}
