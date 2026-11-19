import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../lib/cn';
import { Button } from './button';
import { SIDE, type Placement } from './tooltip';

export interface PopconfirmProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (e?: React.MouseEvent) => void;
  onCancel?: (e?: React.MouseEvent) => void;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okButtonProps?: React.ComponentProps<typeof Button>;
  cancelButtonProps?: React.ComponentProps<typeof Button>;
  placement?: Placement;
  icon?: React.ReactNode;
  showCancel?: boolean;
  disabled?: boolean;
  overlayClassName?: string;
}

export function Popconfirm({
  title,
  description,
  children,
  open,
  defaultOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  okText = '确定',
  cancelText = '取消',
  okButtonProps,
  cancelButtonProps,
  placement = 'top',
  icon,
  showCancel = true,
  disabled,
  overlayClassName,
}: PopconfirmProps) {
  const { side, align } = SIDE[placement] ?? SIDE.top;

  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor asChild>
        <span className="inline-flex" aria-disabled={disabled || undefined}>
          {children}
        </span>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={8}
          className={cn(
            'ax-popover-soft z-50 w-[240px] p-3 outline-none',
            'data-[state=open]:animate-layer-in data-[state=closed]:animate-layer-out',
            overlayClassName,
          )}
        >
          <div className="flex items-start gap-2">
            {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
            <div className="min-w-0">
              {title && <div className="text-base font-medium text-fg">{title}</div>}
              {description && <div className="mt-1 text-sm leading-relaxed text-fg-secondary">{description}</div>}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            {showCancel && (
              <Button size="small" onClick={onCancel} {...cancelButtonProps}>
                {cancelText}
              </Button>
            )}
            <Button size="small" type="primary" onClick={onConfirm} {...okButtonProps}>
              {okText}
            </Button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
