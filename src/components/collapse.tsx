import { forwardRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

export interface CollapseItemType {
  key: string;
  label?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  disabled?: boolean;
  showArrow?: boolean;
  forceRender?: boolean;
}

export interface CollapseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: CollapseItemType[];
  activeKey?: string | string[];
  defaultActiveKey?: string | string[];
  accordion?: boolean;
  onChange?: (key: string | string[]) => void;
  bordered?: boolean;
  ghost?: boolean;
  size?: 'small' | 'middle' | 'large';
  expandIconPosition?: 'start' | 'end';
  expandIcon?: (panelProps: { isActive: boolean }) => React.ReactNode;
  destroyInactivePanel?: boolean;
}

export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(function Collapse(
  {
    items = [],
    activeKey,
    defaultActiveKey = [],
    accordion,
    onChange,
    bordered = true,
    ghost,
    size = 'middle',
    expandIconPosition = 'start',
    expandIcon,
    destroyInactivePanel,
    className,
    ...rest
  },
  ref,
) {
  const [inner, setInner] = useState<string[]>(
    Array.isArray(defaultActiveKey) ? defaultActiveKey : defaultActiveKey ? [defaultActiveKey] : [],
  );
  const openKeys = activeKey !== undefined ? (Array.isArray(activeKey) ? activeKey : activeKey ? [activeKey] : []) : inner;

  const toggle = (key: string) => {
    const next = openKeys.includes(key)
      ? openKeys.filter((k) => k !== key)
      : accordion
        ? [key]
        : [...openKeys, key];
    if (activeKey === undefined) setInner(next);
    onChange?.(accordion ? (next[0] ?? '') : next);
  };

  const padding = size === 'small' ? 'px-3 py-2 text-sm' : size === 'large' ? 'px-6 py-4 text-md' : 'px-5 py-3.5';

  return (
    <div
      ref={ref}
      className={cn(
        'w-full',
        !ghost && bordered && 'overflow-hidden rounded-container border border-line bg-surface',
        className,
      )}
      {...rest}
    >
      {items.map((item, index) => {
        const active = openKeys.includes(item.key);
        return (
          <div
            key={item.key}
            className={cn(
              !ghost && bordered && 'border-line-soft',
              !ghost && bordered && index > 0 && 'border-t',
              ghost && index > 0 && 'border-t border-line-soft',
            )}
          >
            <button
              type="button"
              disabled={item.disabled}
              aria-expanded={active}
              onClick={() => !item.disabled && toggle(item.key)}
              className={cn(
                'ax-press ax-focus flex w-full items-center gap-2 text-start font-medium text-fg',
                'transition-colors duration-[125ms]',
                expandIconPosition === 'end' && 'flex-row-reverse',
                !ghost && 'hover:bg-muted-soft',
                item.disabled && 'cursor-not-allowed text-fg-disabled',
                padding,
              )}
            >
              {item.showArrow !== false && (
                <span className="shrink-0 text-fg-tertiary transition-transform duration-[180ms] ease-standard">
                  {expandIcon ? (
                    expandIcon({ isActive: active })
                  ) : (
                    <ChevronRight className={cn('size-4 transition-transform duration-[180ms] ease-standard', active && 'rotate-90')} />
                  )}
                </span>
              )}
              <span className="min-w-0 flex-1">{item.label}</span>
              {item.extra && <span className="shrink-0">{item.extra}</span>}
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-[240ms] ease-standard"
              style={{ gridTemplateRows: active ? '1fr' : '0fr' }}
            >
              <div className="min-h-0 overflow-hidden">
                {(!destroyInactivePanel || active || item.forceRender) && (
                  <div
                    aria-hidden={!active}
                    className={cn(
                      'text-base leading-relaxed text-fg-secondary transition-opacity duration-[125ms]',
                      active ? 'opacity-100' : 'opacity-0',
                      size === 'small' ? 'px-3 pb-3' : size === 'large' ? 'px-6 pb-4' : 'px-5 pb-3.5',
                      expandIconPosition === 'start' && item.showArrow !== false && 'ps-9',
                    )}
                  >
                    {item.children}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
