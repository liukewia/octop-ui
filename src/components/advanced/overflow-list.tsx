import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { Popover } from '../tooltip';

export interface OverflowListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 最多漏出几个，剩下的收进「+N」 */
  maxCount?: number;
  /** 至少留几个可见，默认 1（窄到放不下时也不至于只剩一个 +N） */
  minVisible?: number;
  /** 自定义「+N」的外观 */
  moreRender?: (hidden: T[], hiddenCount: number) => React.ReactNode;
  /** 收起项弹层里的渲染方式，默认同 renderItem */
  renderHiddenItem?: (item: T, index: number) => React.ReactNode;
  /** 不想要内置弹层时接管「+N」的点击 */
  onMoreClick?: () => void;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 溢出列表：一行放不下的就收进「+N」，点击展开。
 * 宽度不是猜的 —— 先在一层不可见的量具里排一遍，量到真实宽度再决定收几个；
 * 所以字号、图标、语言变化都不会算错。
 */
export function OverflowList<T>({
  items,
  renderItem,
  maxCount,
  minVisible = 1,
  moreRender,
  renderHiddenItem,
  onMoreClick,
  gap = 8,
  className,
  style,
}: OverflowListProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(items.length);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;

    const compute = () => {
      const available = root.clientWidth;
      if (available <= 0) return;
      const nodes = Array.from(
        measure.querySelectorAll<HTMLElement>('[data-overflow-item]'),
      );
      const moreWidth = measure.querySelector<HTMLElement>('[data-overflow-more]')?.offsetWidth ?? 0;

      const total =
        nodes.reduce((sum, node) => sum + node.offsetWidth, 0) +
        gap * Math.max(0, nodes.length - 1);
      const cap = maxCount ?? items.length;

      if (total <= available) {
        setVisible(Math.min(items.length, cap));
        return;
      }

      // 放不下：留出「+N」的位置，从前往后塞
      const reserve = moreWidth + gap;
      let used = 0;
      let fit = 0;
      for (const node of nodes) {
        const next = used + node.offsetWidth + (fit > 0 ? gap : 0);
        if (next + gap + reserve > available) break;
        used = next;
        fit += 1;
      }
      setVisible(Math.max(Math.min(fit, cap), Math.min(minVisible, items.length)));
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(root);
    return () => observer.disconnect();
  });

  const shown = Math.min(visible, items.length);
  const hidden = items.slice(shown);

  const more = moreRender?.(hidden, hidden.length) ?? (
    <span className="inline-flex h-6 items-center rounded-full bg-muted px-2 text-xs font-medium text-fg-secondary tabular-nums">
      +{hidden.length}
    </span>
  );

  return (
    <div ref={rootRef} className={cn('relative w-full min-w-0', className)} style={style}>
      {/* 量具：同字号同间距排一遍，只读宽度，不参与交互 */}
      <div
        aria-hidden
        ref={measureRef}
        className="pointer-events-none invisible absolute inset-x-0 top-0 flex w-max items-center"
        style={{ gap }}
      >
        {items.map((item, index) => (
          <div key={index} data-overflow-item className="flex-none">
            {renderItem(item, index)}
          </div>
        ))}
        <div data-overflow-more className="flex-none">
          {more}
        </div>
      </div>

      <div className="flex flex-nowrap items-center overflow-hidden" style={{ gap }}>
        {items.slice(0, shown).map((item, index) => (
          <div key={index} className="flex-none">
            {renderItem(item, index)}
          </div>
        ))}

        {hidden.length > 0 &&
          (onMoreClick ? (
            <button
              type="button"
              onClick={onMoreClick}
              className="ax-focus flex-none rounded-full outline-none"
            >
              {more}
            </button>
          ) : (
            <Popover
              placement="bottomRight"
              arrow={false}
              trigger="click"
              content={
                <div className="flex max-h-[240px] w-[200px] flex-col gap-1 overflow-y-auto">
                  {hidden.map((item, index) => (
                    <div key={index} className="min-w-0">
                      {(renderHiddenItem ?? renderItem)(item, shown + index)}
                    </div>
                  ))}
                </div>
              }
            >
              <button
                type="button"
                className="ax-focus flex-none rounded-full outline-none"
                aria-label={`展开其余 ${hidden.length} 项`}
              >
                {more}
              </button>
            </Popover>
          ))}
      </div>
    </div>
  );
}
