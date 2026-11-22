import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { Button } from './button';
import { DIALOG_MOTION, FADE_MOTION, SHEET_MOTION } from '../lib/motion';

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onOk?: (e: React.MouseEvent) => void | Promise<unknown>;
  onCancel?: (e?: React.MouseEvent | KeyboardEvent) => void;
  afterClose?: () => void;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  footer?: React.ReactNode | null;
  confirmLoading?: boolean;
  width?: number | string;
  centered?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  closable?: boolean;
  destroyOnHidden?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  maskStyle?: React.CSSProperties;
  okButtonProps?: React.ComponentProps<typeof Button>;
  cancelButtonProps?: React.ComponentProps<typeof Button>;
  getContainer?: HTMLElement | false;
  /** C 端：窄屏自动变底部抽屉；也可强制指定 */
  variant?: 'dialog' | 'sheet';
  /** 无标题时用于无障碍 */
  ariaLabel?: string;
}

const ModalRoot = function Modal({
  open,
  defaultOpen,
  title,
  children,
  onOk,
  onCancel,
  afterClose,
  okText = '确定',
  cancelText = '取消',
  footer,
  confirmLoading,
  width = 480,
  centered,
  maskClosable = true,
  keyboard = true,
  closable = true,
  destroyOnHidden,
  destroyOnClose,
  zIndex,
  className,
  style,
  maskStyle,
  okButtonProps,
  cancelButtonProps,
  getContainer,
  variant = 'dialog',
  ariaLabel,
}: ModalProps) {
  const [inner, setInner] = useState(!!defaultOpen);
  const isOpen = open ?? inner;
  const wasOpen = useRef(isOpen);
  const sheet = variant === 'sheet';

  const close = (e?: React.MouseEvent | KeyboardEvent) => {
    if (open === undefined) setInner(false);
    onCancel?.(e);
  };

  useEffect(() => {
    if (wasOpen.current && !isOpen) afterClose?.();
    wasOpen.current = isOpen;
  }, [isOpen, afterClose]);

  const body = (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogPrimitive.Portal container={getContainer || undefined}>
        <DialogPrimitive.Overlay
          className={`ax-scrim fixed inset-0 z-50 ${FADE_MOTION}`}
          style={{ zIndex, ...maskStyle }}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          aria-label={!title ? (ariaLabel ?? '对话框') : undefined}
          onPointerDownOutside={(e) => {
            if (!maskClosable) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!keyboard) e.preventDefault();
          }}
          style={
            {
              zIndex: zIndex ? zIndex + 1 : undefined,
              '--modal-w': typeof width === 'number' ? `${width}px` : width,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'fixed z-50 h-fit max-h-[calc(100dvh-48px)] w-[min(var(--modal-w,480px),calc(100vw-32px))] overflow-hidden',
            centered ? 'inset-0 m-auto' : 'inset-x-0 top-[10vh] mx-auto',
            'rounded-container border border-line bg-surface shadow-high outline-none',
            sheet ? SHEET_MOTION : DIALOG_MOTION,
            // C 端：窄屏从底部升起，圆角只留上面两角
            'max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:m-0 max-sm:max-h-[85dvh] max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-page',
            !sheet && 'max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=open]:duration-[var(--ax-dur-medium)] max-sm:data-[state=closed]:slide-out-to-bottom',
            sheet && 'inset-x-0 bottom-0 top-auto m-0 w-full rounded-b-none rounded-t-page',
            
            className,
          )}
        >
          {title && (
            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
              <DialogPrimitive.Title className="min-w-0 text-lg font-semibold text-fg">
                {title}
              </DialogPrimitive.Title>
              {closable && <CloseButton onClick={() => close()} />}
            </div>
          )}
          {!title && closable && (
            <div className="absolute end-3 top-3 z-10">
              <CloseButton onClick={() => close()} />
            </div>
          )}
          <div
            className={cn(
              'overflow-y-auto px-5 text-md leading-relaxed text-fg-secondary',
              title ? 'pb-5' : 'pb-5 pt-5',
            )}
          >
            {children}
          </div>
          {footer !== null && (
            <div className="flex items-center justify-end gap-2 border-t border-line-soft px-5 py-3.5">
              {footer ?? (
                <>
                  <Button onClick={close} {...cancelButtonProps}>
                    {cancelText}
                  </Button>
                  <Button type="primary" loading={confirmLoading} onClick={onOk} {...okButtonProps}>
                    {okText}
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );

  if (destroyOnHidden || destroyOnClose) {
    return isOpen ? body : null;
  }
  return body;
};

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="关闭"
      onClick={onClick}
      className="ax-press ax-focus -me-1 inline-flex size-8 shrink-0 items-center justify-center rounded-element text-fg-secondary hover:bg-muted hover:text-fg"
    >
      <X className="size-4" />
    </button>
  );
}

/* ------------------------------------------------------- 命令式 confirm */

export interface ConfirmConfig
  extends Omit<ModalProps, 'open' | 'onOk' | 'onCancel' | 'children'> {
  content?: React.ReactNode;
  onOk?: () => void | Promise<unknown>;
  onCancel?: () => void;
  icon?: React.ReactNode;
  type?: 'confirm' | 'info' | 'success' | 'warning' | 'error';
}

export interface ModalInstance {
  destroy: () => void;
  update: (next: Partial<ConfirmConfig>) => void;
}

function confirmDialog(config: ConfirmConfig): ModalInstance {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root | null = createRoot(container);
  let current = config;

  const unmount = (delay = 200) => {
    window.setTimeout(() => {
      root?.unmount();
      root = null;
      container.remove();
    }, delay);
  };

  function render() {
    root?.render(
      <ConfirmDialog
        {...current}
        onClosed={() => {
          current.afterClose?.();
          unmount();
        }}
      />,
    );
  }

  render();

  return {
    destroy: () => {
      root?.unmount();
      root = null;
      container.remove();
    },
    update: (next) => {
      current = { ...current, ...next };
      render();
    },
  };
}

function ConfirmDialog(props: ConfirmConfig & { onClosed: () => void }) {
  const { content, onOk, onCancel, onClosed, type = 'confirm', icon, title, ...rest } = props;
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    const result = onOk?.();
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setLoading(true);
      try {
        await result;
      } finally {
        setLoading(false);
      }
    }
    setOpen(false);
  };

  return (
    <Modal
      {...rest}
      title={
        <span className="flex items-center gap-2">
          {icon}
          {title ?? TYPE_TITLE[type]}
        </span>
      }
      open={open}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={() => {
        onCancel?.();
        setOpen(false);
      }}
      afterClose={onClosed}
      width={400}
    >
      {content}
    </Modal>
  );
}

const TYPE_TITLE = {
  confirm: '确认操作',
  info: '提示',
  success: '操作成功',
  warning: '注意',
  error: '出错了',
} as const;

export const Modal = Object.assign(ModalRoot, {
  confirm: confirmDialog,
  info: (config: ConfirmConfig) => confirmDialog({ ...config, type: 'info' }),
  success: (config: ConfirmConfig) => confirmDialog({ ...config, type: 'success' }),
  warning: (config: ConfirmConfig) => confirmDialog({ ...config, type: 'warning' }),
  error: (config: ConfirmConfig) => confirmDialog({ ...config, type: 'error' }),
});
