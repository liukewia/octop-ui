import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { ENTER_ONCE } from '../lib/motion';
import { Button } from './button';

export interface TourStep {
  title?: React.ReactNode;
  description?: React.ReactNode;
  target?: () => HTMLElement | null;
  cover?: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  nextText?: React.ReactNode;
  prevText?: React.ReactNode;
  mask?: boolean;
}

export interface TourProps {
  steps?: TourStep[];
  open?: boolean;
  current?: number;
  onChange?: (current: number) => void;
  onClose?: () => void;
  onFinish?: () => void;
  maskClosable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Tour({
  steps = [],
  open,
  current,
  onChange,
  onClose,
  onFinish,
  maskClosable = true,
  className,
  style,
}: TourProps) {
  const [innerIndex, setIndex] = useState(0);
  const index = current ?? innerIndex;
  const step = steps[index];
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  const visible = open ?? true;

  useLayoutEffect(() => {
    if (!visible) return;
    const update = () => {
      const target = step?.target?.();
      setRect(target ? target.getBoundingClientRect() : null);
      const card = cardRef.current;
      if (card) setCardSize({ width: card.offsetWidth, height: card.offsetHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    if (cardRef.current) observer.observe(cardRef.current);
    const target = step?.target?.();
    if (target) observer.observe(target);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [visible, index, step]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  if (!visible || !step) return null;

  const padding = 8;
  const gap = 12;
  const viewportW = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const viewportH = typeof window === 'undefined' ? 800 : window.innerHeight;

  const placement = step.placement ?? 'bottom';
  let top = (viewportH - cardSize.height) / 2;
  let left = (viewportW - cardSize.width) / 2;

  if (rect && placement !== 'center') {
    const below = rect.bottom + gap;
    const above = rect.top - cardSize.height - gap;
    const right = rect.right + gap;
    const before = rect.left - cardSize.width - gap;
    if (placement === 'right' || placement === 'left') {
      const preferred = placement === 'right' ? right : before;
      const alternate = placement === 'right' ? before : right;
      const fits = (x: number) => x >= padding && x + cardSize.width <= viewportW - padding;
      if (fits(preferred) || fits(alternate)) {
        left = fits(preferred) ? preferred : alternate;
        top = rect.top;
      } else {
        left = rect.left;
        top = below + cardSize.height > viewportH - padding && above >= padding ? above : below;
      }
    } else {
      left = rect.left;
      const fitsBelow = below + cardSize.height <= viewportH - padding;
      const fitsAbove = above >= padding;
      top = placement === 'top' ? (fitsAbove || !fitsBelow ? above : below) : (!fitsBelow && fitsAbove ? above : below);
    }
  }

  const cardStyle = {
    top: Math.max(padding, Math.min(top, viewportH - cardSize.height - padding)),
    left: Math.max(padding, Math.min(left, viewportW - cardSize.width - padding)),
  };

  const isLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[900]" role="dialog" aria-modal aria-label={typeof step.title === 'string' ? step.title : '引导'}>
      {step.mask !== false && (
        <div
          className="absolute inset-0 animate-in fade-in-0 bg-black/55 duration-[var(--ax-dur-fast)] ease-standard"
          onClick={() => maskClosable && onClose?.()}
          style={
            rect
              ? {
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                    ${rect.left - padding}px ${rect.top - padding}px,
                    ${rect.left - padding}px ${rect.bottom + padding}px,
                    ${rect.right + padding}px ${rect.bottom + padding}px,
                    ${rect.right + padding}px ${rect.top - padding}px,
                    ${rect.left - padding}px ${rect.top - padding}px)`,
                }
              : undefined
          }
        />
      )}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-element ring-2 ring-accent ring-offset-2 ring-offset-transparent"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }}
        />
      )}
      <div
        ref={cardRef}
        className={cn(
          'absolute w-[min(320px,calc(100vw-32px))] max-h-[calc(100dvh-16px)] overflow-y-auto animate-in fade-in-0 rounded-container border border-line bg-surface p-4 shadow-high duration-[var(--ax-dur-fast-max)] ease-standard',
          className,
        )}
        style={{ ...cardStyle, ...style }}
      >
        <div className="flex items-start justify-between gap-3">
          <div key={index} className={cn('min-w-0 text-base font-semibold text-fg', ENTER_ONCE)}>{step.title}</div>
          <button
            type="button"
            aria-label="关闭引导"
            onClick={onClose}
            className="ax-press -me-1 -mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-inner text-fg-tertiary hover:bg-muted hover:text-fg"
          >
            <X className="size-3.5" />
          </button>
        </div>
        {step.cover && <div className="mt-3 overflow-hidden rounded-inner">{step.cover}</div>}
        <div key={`description-${index}`} className={cn('mt-1.5 text-sm leading-relaxed text-fg-secondary', ENTER_ONCE)}>{step.description}</div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs tabular-nums text-fg-tertiary">
            {index + 1} / {steps.length}
          </span>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button
                size="small"
                onClick={() => {
                  if (current === undefined) setIndex(index - 1);
                  onChange?.(index - 1);
                }}
              >
                {step.prevText ?? '上一步'}
              </Button>
            )}
            <Button
              size="small"
              type="primary"
              onClick={() => {
                if (isLast) {
                  onFinish?.();
                  onClose?.();
                  return;
                }
                if (current === undefined) setIndex(index + 1);
                onChange?.(index + 1);
              }}
            >
              {step.nextText ?? (isLast ? '完成' : '下一步')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
