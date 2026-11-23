import { useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface SplitterPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number | string;
  size?: number | string;
  min?: number | string;
  max?: number | string;
  collapsible?: boolean;
  resizable?: boolean;
}

export function SplitterPanel({ className, children, defaultSize, ...rest }: SplitterPanelProps) {
  return (
    <div className={cn('min-h-0 min-w-0 overflow-auto', className)} {...rest}>
      {children}
    </div>
  );
}

export interface SplitterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onResize'> {
  layout?: 'horizontal' | 'vertical';
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
}

function toPercent(value: number | string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return value;
  return Number.parseFloat(value);
}

const SplitterRoot = ({ layout = 'horizontal', onResize, onResizeEnd, className, children, ...rest }: SplitterProps) => {
  const vertical = layout === 'vertical';
  const panels = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const count = Math.max(1, panels.length);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sizes, setSizes] = useState<number[]>(() => {
    const total = count;
    return Array.from({ length: count }, (_, i) => {
      const child = panels[i] as React.ReactElement<SplitterPanelProps> | undefined;
      return toPercent(child?.props.defaultSize, 100 / total);
    });
  });
  const dragging = useRef<{ id: number; index: number; startPos: number; startSizes: number[]; latest: number[] } | null>(null);

  const resizePair = (initial: number[], index: number, delta: number) => {
    const next = initial.slice();
    const total = initial[index] + initial[index + 1];
    const minimum = Math.min(8, total / 2);
    next[index] = Math.min(total - minimum, Math.max(minimum, initial[index] + delta));
    next[index + 1] = total - next[index];
    return next;
  };

  const apply = (next: number[]) => {
    const sum = next.reduce((a, b) => a + b, 0);
    const normalized = next.map((n) => (n / sum) * 100);
    setSizes(normalized);
    onResize?.(normalized);
    return normalized;
  };

  const onPointerDown = (index: number) => (event: React.PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || dragging.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = {
      id: event.pointerId,
      index,
      startPos: vertical ? event.clientY : event.clientX,
      startSizes: sizes,
      latest: sizes,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const state = dragging.current;
    const container = containerRef.current;
    if (!state || state.id !== event.pointerId || !container) return;
    const rect = container.getBoundingClientRect();
    const total = vertical ? rect.height : rect.width;
    if (!total) return;
    const delta = ((vertical ? event.clientY : event.clientX) - state.startPos) / total;
    state.latest = apply(resizePair(state.startSizes, state.index, delta * 100));
  };

  const endDrag = (event: React.PointerEvent) => {
    const state = dragging.current;
    if (!state || state.id !== event.pointerId) return;
    dragging.current = null;
    onResizeEnd?.(state.latest);
  };

  return (
    <div
      ref={containerRef}
      className={cn('flex size-full min-h-0 min-w-0', vertical ? 'flex-col' : 'flex-row', className)}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onLostPointerCapture={endDrag}
      {...rest}
    >
      {panels.map((panel, index) => (
        <div key={index} className="contents">
          <div
            className="min-h-0 min-w-0 overflow-auto"
            style={{ flexBasis: `${sizes[index]}%`, flexGrow: 0, flexShrink: 1 }}
          >
            {(panel as React.ReactElement<SplitterPanelProps>).props.children}
          </div>
          {index < panels.length - 1 && (
            <div
              role="separator"
              aria-orientation={vertical ? 'horizontal' : 'vertical'}
              tabIndex={0}
              onPointerDown={onPointerDown(index)}
              onKeyDown={(e) => {
                const forward = e.key === (vertical ? 'ArrowDown' : 'ArrowRight');
                const backward = e.key === (vertical ? 'ArrowUp' : 'ArrowLeft');
                if (!forward && !backward) return;
                e.preventDefault();
                apply(resizePair(sizes, index, forward ? 5 : -5));
              }}
              className={cn(
                'ax-focus group relative flex shrink-0 touch-none items-center justify-center bg-line-soft transition-colors hover:bg-accent/20',
                vertical ? 'h-px w-full cursor-row-resize py-1' : 'h-full w-px cursor-col-resize px-1',
              )}
            >
              <span
                className={cn(
                  'rounded-full bg-line-strong transition-colors group-hover:bg-accent',
                  vertical ? 'h-0.5 w-6' : 'h-6 w-0.5',
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const Splitter = Object.assign(SplitterRoot, { Panel: SplitterPanel });
