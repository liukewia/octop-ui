import { useState } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { useControllableState } from '../lib/hooks';
import { POPUP_MOTION } from '../lib/motion';

export type MenuItemType =
  | {
      key: string;
      label?: React.ReactNode;
      icon?: React.ReactNode;
      disabled?: boolean;
      danger?: boolean;
      extra?: React.ReactNode;
      children?: MenuItemType[];
    }
  | { type: 'divider'; key?: string }
  | { type: 'group'; key?: string; label?: React.ReactNode; children?: MenuItemType[] };

export interface MenuClickInfo {
  key: string;
  keyPath: string[];
  domEvent: React.MouseEvent;
}

export interface MenuProps {
  items?: MenuItemType[];
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  mode?: 'vertical' | 'horizontal' | 'inline';
  onClick?: (info: MenuClickInfo) => void;
  onSelect?: (info: MenuClickInfo) => void;
  onOpenChange?: (openKeys: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

function isDivider(item: MenuItemType): item is { type: 'divider'; key?: string } {
  return 'type' in item && item.type === 'divider';
}
function isGroup(item: MenuItemType): item is { type: 'group'; key?: string; label?: React.ReactNode; children?: MenuItemType[] } {
  return 'type' in item && item.type === 'group';
}

export function Menu({
  items = [],
  selectedKeys,
  defaultSelectedKeys = [],
  openKeys,
  defaultOpenKeys = [],
  mode = 'vertical',
  onClick,
  onSelect,
  onOpenChange,
  className,
  style,
}: MenuProps) {
  const horizontal = mode === 'horizontal';

  const [selected, setSelected] = useControllableState<string[]>({
    value: selectedKeys,
    defaultValue: defaultSelectedKeys,
  });
  const [opened, setOpened] = useControllableState<string[]>({
    value: openKeys,
    defaultValue: defaultOpenKeys,
    onChange: onOpenChange,
  });

  const fire = (key: string, keyPath: string[], domEvent: React.MouseEvent) => {
    setSelected([key]);
    const info = { key, keyPath, domEvent };
    onClick?.(info);
    onSelect?.(info);
  };

  const toggle = (key: string) =>
    setOpened(opened.includes(key) ? opened.filter((k) => k !== key) : [...opened, key]);

  const renderItem = (item: MenuItemType, parents: string[] = [], index = 0) => {
    const fallbackKey = `${parents.join('-') || 'root'}-${index}`;

    if (isDivider(item)) {
      return <li key={item.key ?? fallbackKey} className="my-1 h-px bg-line" role="separator" />;
    }

    if (isGroup(item)) {
      return (
        <li key={item.key ?? fallbackKey} className="px-1">
          <div className="px-2 py-1.5 text-xs font-medium text-fg-tertiary">{item.label}</div>
          <ul className="m-0 list-none p-0">
            {item.children?.map((child, i) => renderItem(child, parents, i))}
          </ul>
        </li>
      );
    }

    const isSelected = selected.includes(item.key);
    const hasChildren = !!item.children?.length;

    if (hasChildren) {
      const open = opened.includes(item.key);
      return (
        <li key={item.key} className="group/sub relative">
          <button
            type="button"
            disabled={item.disabled}
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => toggle(item.key)}
            className={cn(
              'ax-press ax-focus flex w-full items-center gap-2 rounded-element px-2.5 text-start text-base',
              'h-9 text-fg transition-colors hover:bg-muted-soft',
              open && 'bg-muted-soft',
              'disabled:cursor-not-allowed disabled:text-fg-disabled',
            )}
          >
            {item.icon}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <ChevronRight
              className={cn(
                'size-4 shrink-0 text-fg-tertiary transition-transform duration-[125ms] ease-standard',
                horizontal ? 'rotate-90' : open && 'rotate-90',
              )}
            />
          </button>
          <ul
            className={cn(
              'm-0 list-none p-0',
              horizontal
                ? cn(
                    'absolute start-0 top-full z-20 mt-1 min-w-[180px] rounded-inner border border-line bg-surface p-1 shadow-med',
                    'hidden group-hover/sub:block',
                    open && 'block',
                  )
                : cn('ms-6 mt-0.5', !open && 'hidden'),
            )}
          >
            {item.children?.map((child, i) => renderItem(child, [...parents, item.key], i))}
          </ul>
        </li>
      );
    }

    return (
      <li key={item.key}>
        <button
          type="button"
          disabled={item.disabled}
          aria-current={isSelected || undefined}
          onClick={(e) => fire(item.key, [...parents, item.key].reverse(), e)}
          className={cn(
            'ax-press ax-focus flex w-full items-center gap-2 rounded-element px-2.5 text-start text-base',
            'h-9 transition-colors',
            isSelected ? 'bg-muted font-medium text-fg' : 'text-fg hover:bg-muted-soft',
            item.danger && 'text-danger-fg',
            'disabled:cursor-not-allowed disabled:text-fg-disabled',
          )}
        >
          {item.icon}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.extra}
          {isSelected && <Check className="size-4 shrink-0 text-accent" />}
        </button>
      </li>
    );
  };

  return (
    <ul
      role="menu"
      className={cn(
        'm-0 flex list-none flex-col gap-0.5 p-0',
        horizontal && 'flex-row items-center',
        className,
      )}
      style={style}
    >
      {items.map((item, i) => renderItem(item, [], i))}
    </ul>
  );
}

/* --------------------------------------------------------------- Dropdown */

export interface DropdownProps {
  menu?: {
    items: MenuItemType[];
    onClick?: (info: MenuClickInfo) => void;
    selectedKeys?: string[];
  };
  children: React.ReactNode;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  placement?:
    | 'bottomLeft'
    | 'bottom'
    | 'bottomRight'
    | 'topLeft'
    | 'top'
    | 'topRight';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  arrow?: boolean;
  overlayClassName?: string;
  overlay?: React.ReactNode;
  dropDownClassName?: string;
}

const PLACEMENT = {
  bottomLeft: { side: 'bottom', align: 'start' },
  bottom: { side: 'bottom', align: 'center' },
  bottomRight: { side: 'bottom', align: 'end' },
  topLeft: { side: 'top', align: 'start' },
  top: { side: 'top', align: 'center' },
  topRight: { side: 'top', align: 'end' },
} as const;

export function Dropdown({
  menu,
  children,
  trigger = ['hover'],
  placement = 'bottomLeft',
  open,
  onOpenChange,
  disabled,
  overlay,
  overlayClassName,
}: DropdownProps) {
  const { side, align } = PLACEMENT[placement] ?? PLACEMENT.bottomLeft;
  const hover = trigger.includes('hover');
  const [innerOpen, setInnerOpen] = useState(!!open);
  const isOpen = open ?? innerOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  return (
    <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={setOpen} modal={false}>
      <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
        <span
          className="inline-flex outline-none"
          onPointerEnter={() => hover && setOpen(true)}
          onPointerLeave={() => hover && setOpen(false)}
        >
          {children}
        </span>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          side={side}
          align={align}
          sideOffset={4}
          collisionPadding={8}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'ax-popover z-50 min-w-[180px] p-1 outline-none',
            POPUP_MOTION,
            overlayClassName,
          )}
        >
          {overlay ?? (
            <Menu
              items={menu?.items ?? []}
              selectedKeys={menu?.selectedKeys}
              onClick={menu?.onClick}
              className="min-w-0"
            />
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
