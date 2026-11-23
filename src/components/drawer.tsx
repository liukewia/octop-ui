import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cn } from '../lib/cn';
import { useIsMobile } from '../lib/hooks';
import { DRAWER_CLOCK, DRAWER_MOTION, FADE_MOTION } from '../lib/motion';
import { Button } from './button';

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface DrawerPushConfig {
  /** 每个子层把父层推开的距离，默认 180 */
  distance?: number;
}

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onClose?: () => void;
  afterOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  placement?: DrawerPlacement;
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  /** 遮罩，默认每层都有；第 2 层起自动稀释，`false` 关掉 */
  mask?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
  /** 有子抽屉打开时把自身推开：`false` 不推，`{ distance }` 自定义距离，默认 180 */
  push?: boolean | DrawerPushConfig;
  className?: string;
  bodyClassName?: string;
  style?: React.CSSProperties;
  rootClassName?: string;
}

/**
 * 嵌套抽屉的通道：子层把自己「已打开」这件事告诉父层，
 * 父层按 `distance × 打开的层数` 沿同一方向平移，让出被覆盖的那一条边。
 * 只做平移、不做缩放 —— 抽屉是整块面板，缩小会读出「变成了卡片」。
 */
interface DrawerNest {
  placement: DrawerPlacement;
  distance: number;
  /** 根层为 0，每嵌一层 +1；遮罩强度与 z-index 都按它递推 */
  depth: number;
  /** 父层实际用的 z-index 基值：子层从这里往上接，显式设过 zIndex 时才不会被子层盖住 */
  baseZ?: number;
  register: () => () => void;
}

const DrawerNestContext = createContext<DrawerNest | null>(null);

/** 每层遮罩的不透明度：根层吃满，往上逐级稀释 */
const MASK_STACK = ['100%', '62%', '46%', '38%'];

const BOX_CLASS: Record<DrawerPlacement, string> = {
  right: 'inset-y-0 right-0 h-full rounded-s-container',
  left: 'inset-y-0 left-0 h-full rounded-e-container',
  top: 'inset-x-0 top-0 w-full rounded-b-container',
  bottom: 'inset-x-0 bottom-0 w-full rounded-t-page',
};

const PUSH_EDGE: Record<DrawerPlacement, 'top' | 'right' | 'bottom' | 'left'> = {
  right: 'right',
  left: 'left',
  top: 'top',
  bottom: 'bottom',
};

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
  mask,
  maskClosable = true,
  keyboard = true,
  destroyOnClose,
  zIndex,
  push,
  className,
  bodyClassName,
  style,
  rootClassName,
}: DrawerProps) {
  // 自己是不是开着，得自己知道：嵌套时要据此通知父层
  const [innerOpen, setInnerOpen] = useState(!!defaultOpen);
  const isOpen = open ?? innerOpen;
  const [nestCount, setNestCount] = useState(0);

  const parent = useContext(DrawerNestContext);
  const depth = parent ? parent.depth + 1 : 0;
  // 父层给过 zIndex 就往上接两级，否则继续靠 DOM 顺序叠
  const resolvedZ = zIndex ?? (parent?.baseZ !== undefined ? parent.baseZ + 2 : undefined);
  const maskStrength = MASK_STACK[Math.min(depth, MASK_STACK.length - 1)];

  const register = useCallback(() => {
    setNestCount((count) => count + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setNestCount((count) => Math.max(0, count - 1));
    };
  }, []);

  const pushDistance =
    push === false ? 0 : typeof push === 'object' ? (push.distance ?? 180) : 180;

  // 有父层、自己开着、父层允许推 —— 三条都成立才算占了一层
  useEffect(() => {
    if (!parent || !isOpen || parent.distance <= 0) return;
    return parent.register();
  }, [parent, isOpen]);

  const nestValue = useMemo<DrawerNest>(
    () => ({ placement, distance: pushDistance, depth, baseZ: resolvedZ, register }),
    [placement, pushDistance, depth, resolvedZ, register],
  );

  const isVertical = placement === 'top' || placement === 'bottom';
  // 窄屏两块面板都接近满宽，让出 180px 只会切出一溜被截断的文字 —— 手机上直接盖上去
  const isMobile = useIsMobile();
  const offset = isMobile ? 0 : pushDistance * nestCount;
  // 每一层都压遮罩：子层飘在一张没被压暗的父面板上，读不出「又深了一层」。
  // 但强度逐级递减，最深的页面只被压一次实、上面几层各添一点。
  const showMask = mask ?? true;

  return (
    <DrawerNestContext.Provider value={nestValue}>
      <DialogPrimitive.Root
        open={isOpen}
        onOpenChange={(next) => {
          if (open === undefined) setInnerOpen(next);
          if (!next) onClose?.();
          afterOpenChange?.(next);
        }}
      >
        <DialogPrimitive.Portal>
          {showMask && (
            <DialogPrimitive.Overlay
              className={cn('ax-scrim fixed inset-0 z-50', FADE_MOTION)}
              data-stack={depth ? '' : undefined}
              style={
                {
                  zIndex: resolvedZ,
                  ...(depth ? { '--ax-scrim-strength': maskStrength } : null),
                } as React.CSSProperties
              }
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
              zIndex: resolvedZ !== undefined ? resolvedZ + 1 : undefined,
              ...(isVertical ? { maxHeight: height ?? '85dvh' } : { width }),
              // 推开用 inset 而不是 transform：transform 已经归动效所有
              ...(offset ? { [PUSH_EDGE[placement]]: offset } : null),
              ...style,
            }}
            className={cn(
              'fixed z-50 flex max-w-[100vw] flex-col border-line bg-surface shadow-high outline-none',
              // 嵌套时压在父层上，靠一条实一点的缝分开，否则两块白面糊成一片
              !isVertical && (parent ? 'max-w-[92vw] border-s-line-strong' : 'max-w-[92vw] border-s'),
              isVertical && 'border-t',
              BOX_CLASS[placement],
              DRAWER_CLOCK,
              DRAWER_MOTION[placement],
              // 推开是 300ms 的位移，和进出场同一个时钟
              'transition-[top,right,bottom,left] duration-[var(--ax-dur-medium)] ease-standard',
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
            <div
              className={cn(
                'flex-1 overflow-y-auto px-5 py-4 text-md leading-relaxed text-fg-secondary',
                bodyClassName,
              )}
            >
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
    </DrawerNestContext.Provider>
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
