import { useLayoutEffect, useRef, useState } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  closable?: boolean;
  forceRender?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  onTabClick?: (key: string, event: React.MouseEvent) => void;
  onEdit?: (key: string | React.MouseEvent, action: 'add' | 'remove') => void;
  type?: 'line' | 'card' | 'editable-card';
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
  centered?: boolean;
  size?: 'small' | 'middle' | 'large';
  destroyOnHidden?: boolean;
  destroyInactiveTabPane?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  tabBarExtraContent?: React.ReactNode;
}

export function Tabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  onTabClick,
  onEdit,
  type = 'line',
  tabPosition = 'top',
  centered,
  size = 'middle',
  destroyOnHidden,
  destroyInactiveTabPane,
  className,
  style,
  tabBarExtraContent,
}: TabsProps) {
  const [inner, setInner] = useState(defaultActiveKey ?? items[0]?.key);
  const current = activeKey ?? inner;
  const listRef = useRef<HTMLDivElement | null>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = list.querySelector<HTMLElement>('[data-state="active"]');
      if (!el) return;
      const vertical = tabPosition === 'left' || tabPosition === 'right';
      setBar(
        vertical
          ? { left: el.offsetTop, width: el.offsetHeight }
          : { left: el.offsetLeft, width: el.offsetWidth },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [current, items, tabPosition, size]);

  const vertical = tabPosition === 'left' || tabPosition === 'right';
  const card = type === 'card' || type === 'editable-card';
  const height = size === 'small' ? 'h-8 text-sm' : size === 'large' ? 'h-11 text-md' : 'h-10 text-base';

  return (
    <TabsPrimitive.Root
      value={current}
      onValueChange={(next) => {
        if (activeKey === undefined) setInner(next);
        onChange?.(next);
      }}
      orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn('flex w-full min-w-0', vertical ? 'flex-row' : 'flex-col', className)}
      style={style}
      activationMode="automatic"
    >
      <div
        className={cn(
          'flex shrink-0 items-center gap-2',
          vertical && 'flex-col items-stretch',
          !vertical && 'flex-row',
        )}
      >
        <div className="relative min-w-0 flex-1">
          <TabsPrimitive.List
            ref={listRef}
            className={cn(
              'relative flex',
              vertical ? 'flex-col items-stretch gap-0.5' : 'items-stretch gap-1',
              centered && !vertical && 'justify-center',
              card && !vertical && 'gap-0',
            )}
          >
            {items.map((item) => (
              <TabsPrimitive.Trigger
                key={item.key}
                value={item.key}
                disabled={item.disabled}
                onClick={(e) => onTabClick?.(item.key, e)}
                className={cn(
                  'ax-press group relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 font-medium',
                  'transition-colors duration-[125ms] outline-none',
                  height,
                  'text-fg-secondary hover:text-fg',
                  'data-[state=active]:text-fg data-[state=active]:font-medium',
                  'disabled:cursor-not-allowed disabled:text-fg-disabled',
                  card
                    ? cn(
                        'rounded-t-element border border-b-0 border-line',
                        'data-[state=active]:bg-surface',
                        'data-[state=inactive]:bg-muted-soft',
                      )
                    : 'rounded-inner',
                  vertical && 'justify-start',
                  // 指标条只在非 card 形态出现
                  card && 'border-b-0',
                )}
              >
                {item.icon}
                {item.label}
                {(item.closable ?? type === 'editable-card') && !item.disabled && (
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label="关闭标签"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(item.key, 'remove');
                    }}
                    className="ms-0.5 inline-flex size-4 items-center justify-center rounded-full text-fg-tertiary opacity-70 hover:bg-muted hover:opacity-100"
                  >
                    <X className="size-3" />
                  </span>
                )}
              </TabsPrimitive.Trigger>
            ))}
            {type === 'editable-card' && (
              <button
                type="button"
                aria-label="新建"
                onClick={(e) => onEdit?.(e, 'add')}
                className="ax-focus ms-1 inline-flex h-8 w-8 items-center justify-center self-center rounded-inner text-fg-secondary hover:bg-muted"
              >
                +
              </button>
            )}
            {!card && (
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute bg-accent transition-[left,width] duration-[165ms] ease-standard',
                  vertical ? 'start-0 w-0.5 rounded-full' : 'bottom-0 h-0.5 rounded-full',
                )}
                style={
                  vertical
                    ? { top: bar.left, height: bar.width, width: 2 }
                    : { left: bar.left, width: bar.width }
                }
              />
            )}
          </TabsPrimitive.List>
        </div>
        {tabBarExtraContent && <div className="shrink-0">{tabBarExtraContent}</div>}
      </div>

      <div className={cn('min-w-0 flex-1', vertical ? 'ps-4' : 'pt-3')}>
        {items.map((item) => {
          // 默认保留未激活面板的 DOM；destroyOnHidden 时才真正卸载。
          // forceMount 之后 Radix 不再自己加 hidden，得我们补上，否则未激活面板会堆着显示。
          const keepMounted =
            !(destroyOnHidden || destroyInactiveTabPane) || Boolean(item.forceRender);
          return (
          <TabsPrimitive.Content
            key={item.key}
            value={item.key}
            forceMount={keepMounted ? true : undefined}
            hidden={keepMounted && current !== item.key ? true : undefined}
            className={cn('outline-none', current === item.key && 'animate-in fade-in-0 duration-[var(--ax-dur-fast)] ease-standard')}
          >
            {item.children}
          </TabsPrimitive.Content>
          );
        })}
      </div>
    </TabsPrimitive.Root>
  );
}
