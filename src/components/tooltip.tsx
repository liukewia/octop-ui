import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../lib/cn';

export type Placement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

export const SIDE: Record<
  string,
  { side: 'top' | 'bottom' | 'left' | 'right'; align: 'start' | 'center' | 'end' }
> = {
  top: { side: 'top', align: 'center' },
  topLeft: { side: 'top', align: 'start' },
  topRight: { side: 'top', align: 'end' },
  bottom: { side: 'bottom', align: 'center' },
  bottomLeft: { side: 'bottom', align: 'start' },
  bottomRight: { side: 'bottom', align: 'end' },
  left: { side: 'left', align: 'center' },
  leftTop: { side: 'left', align: 'start' },
  leftBottom: { side: 'left', align: 'end' },
  right: { side: 'right', align: 'center' },
  rightTop: { side: 'right', align: 'start' },
  rightBottom: { side: 'right', align: 'end' },
};

export interface TooltipProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  color?: string;
  arrow?: boolean;
  mouseEnterDelay?: number;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  zIndex?: number;
}

export function Tooltip({
  title,
  children,
  placement = 'top',
  open,
  defaultOpen,
  onOpenChange,
  color,
  arrow = false,
  mouseEnterDelay = 0.1,
  zIndex,
  overlayClassName,
  overlayStyle,
}: TooltipProps) {
  if (title === null || title === undefined || title === '') return <>{children}</>;

  const { side, align } = SIDE[placement] ?? SIDE.top;

  return (
    <TooltipPrimitive.Provider delayDuration={mouseEnterDelay * 1000}>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={4}
            collisionPadding={8}
            style={{ zIndex, ...(color ? { background: color, color: '#fff' } : null), ...overlayStyle }}
            className={cn(
              // Astryx 真站 tooltip：28 高、12 圆角、4/8 内边距、无箭头、无描边，暗色反相
              'z-50 max-w-[320px] select-none rounded-container bg-accent px-2 py-1 text-base leading-5 text-on-accent shadow-pop',
              'data-[state=delayed-open]:animate-layer-in data-[state=instant-open]:animate-fade-in',
              overlayClassName,
            )}
          >
            {title}
            {arrow && <TooltipPrimitive.Arrow className="fill-accent" width={10} height={5} />}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export interface PopoverProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: 'hover' | 'click' | 'focus' | 'contextMenu';
  arrow?: boolean;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  overlayInnerStyle?: React.CSSProperties;
  zIndex?: number;
  /** 内容区去掉内边距（列表 / 表格类浮层） */
  flush?: boolean;
}

export function Popover({
  title,
  content,
  children,
  placement = 'top',
  open,
  defaultOpen,
  onOpenChange,
  arrow = false,
  overlayClassName,
  overlayStyle,
  overlayInnerStyle,
  zIndex,
  flush,
}: PopoverProps) {
  const { side, align } = SIDE[placement] ?? SIDE.top;

  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor asChild>
        <span className="inline-flex">{children}</span>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={8}
          style={{ zIndex, ...overlayStyle }}
          className={cn(
            // 唯一没有描边的浮层：边界交给两档近距影，暗色靠 inset 白环当轮廓
            'ax-popover-soft z-50 inline-block w-max max-w-[min(420px,calc(100vw-32px))] p-3 outline-none',
            'data-[state=open]:animate-layer-in data-[state=closed]:animate-layer-out',
            flush && 'p-0',
            overlayClassName,
          )}
        >
          {title && <div className="mb-1.5 text-base font-semibold text-fg">{title}</div>}
          <div className="text-base text-fg" style={overlayInnerStyle}>
            {content}
          </div>
          {arrow && <PopoverPrimitive.Arrow className="fill-surface" width={12} height={6} />}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
