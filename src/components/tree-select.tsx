import { useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { POPUP_MOTION } from '../lib/motion';
import { fieldShell, type SizeType, type StatusType } from '../lib/field';
import { Tag } from './tag';
import { Tree, type TreeNodeData } from './tree';

export interface TreeSelectProps {
  treeData?: TreeNodeData[];
  value?: string | string[] | null;
  defaultValue?: string | string[];
  onChange?: (
    value: string | string[] | undefined,
    label: React.ReactNode | React.ReactNode[],
    extra: { selected?: boolean; checked?: boolean; triggerValue: string },
  ) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  multiple?: boolean;
  treeCheckable?: boolean;
  showSearch?: boolean;
  treeDefaultExpandAll?: boolean;
  size?: SizeType;
  status?: StatusType;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxTagCount?: number;
}

function findNode(nodes: TreeNodeData[], key: string): TreeNodeData | undefined {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNode(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}

export function TreeSelect({
  treeData = [],
  value,
  defaultValue,
  onChange,
  placeholder = '请选择',
  disabled,
  allowClear = true,
  multiple,
  treeCheckable,
  treeDefaultExpandAll,
  showSearch,
  size = 'middle',
  status,
  className,
  open,
  onOpenChange,
  maxTagCount,
}: TreeSelectProps) {
  const [inner, setInner] = useState<string[]>(
    defaultValue === undefined ? [] : Array.isArray(defaultValue) ? defaultValue : [defaultValue],
  );
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = open ?? innerOpen;
  const [keyword, setKeyword] = useState('');

  const values = value === undefined ? inner : value === null ? [] : Array.isArray(value) ? value : [value];
  const multi = multiple || treeCheckable;

  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
    if (!next) setKeyword('');
  };

  const emit = (next: string[]) => {
    if (value === undefined) setInner(next);
    const labels = next.map((key) => findNode(treeData, key)?.title ?? key);
    if (multi) onChange?.(next, labels, { checked: true, triggerValue: next[next.length - 1] ?? '' });
    else onChange?.(next[0], labels[0], { selected: true, triggerValue: next[0] ?? '' });
  };

  const filtered = keyword
    ? treeData
        .map((node) => filterNode(node, keyword))
        .filter((node): node is TreeNodeData => !!node)
    : treeData;

  const display = values.map((key) => findNode(treeData, key)?.title ?? key);
  const shown = maxTagCount ? display.slice(0, maxTagCount) : display;

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!isOpen)}
          className={cn(
            fieldShell({ size, status: status as StatusType, disabled, className }),
            'cursor-pointer text-start',
            isOpen && 'border-accent',
          )}
        >
          <span className={cn('flex min-w-0 flex-1 items-center gap-1', !display.length && 'text-fg-disabled')}>
            {display.length === 0 ? (
              placeholder
            ) : multi ? (
              shown.map((label, i) => (
                <Tag
                  key={i}
                  closable={!disabled}
                  onClose={(e) => {
                    e.preventDefault();
                    emit(values.filter((key) => key !== values[i]));
                  }}
                >
                  {label as React.ReactNode}
                </Tag>
              ))
            ) : (
              <span className="truncate">{display[0] as React.ReactNode}</span>
            )}
            {maxTagCount && display.length > maxTagCount && <Tag>+{display.length - maxTagCount}</Tag>}
          </span>
          {allowClear && display.length > 0 && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="清除"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                emit([]);
              }}
              className="ax-press inline-flex size-5 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
            >
              <X className="size-3.5" />
            </span>
          ) : (
            <ChevronDown
              className={cn('size-4 shrink-0 text-fg-tertiary transition-transform duration-[125ms]', isOpen && 'rotate-180')}
            />
          )}
        </button>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className={`ax-popover z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] p-2 outline-none ${POPUP_MOTION}`}
        >
          {showSearch && (
            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索"
              className="mb-1 h-8 w-full rounded-inner bg-muted-soft px-2 text-base outline-none placeholder:text-fg-disabled"
            />
          )}
          <div className="max-h-[264px] overflow-y-auto">
            <Tree
              treeData={filtered}
              defaultExpandAll={treeDefaultExpandAll}
              checkable={treeCheckable}
              multiple={multi && !treeCheckable}
              selectedKeys={treeCheckable ? [] : values}
              checkedKeys={treeCheckable ? values : undefined}
              onSelect={(keys, info) => {
                if (treeCheckable) return;
                emit(multi ? keys : info.selected ? keys : []);
              }}
              onCheck={(keys) => emit(keys)}
              blockNode
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function filterNode(node: TreeNodeData, keyword: string): TreeNodeData | null {
  const match = String(node.title ?? '').toLowerCase().includes(keyword.toLowerCase());
  const children = node.children
    ?.map((child) => filterNode(child, keyword))
    .filter((child): child is TreeNodeData => !!child);
  if (!match && !children?.length) return null;
  return { ...node, children };
}
