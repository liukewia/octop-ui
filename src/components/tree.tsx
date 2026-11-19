import { useState } from 'react';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '../lib/cn';

export interface TreeNodeData {
  key: string;
  title?: React.ReactNode;
  children?: TreeNodeData[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  icon?: React.ReactNode;
  checkable?: boolean;
  selectable?: boolean;
}

export interface TreeProps {
  treeData?: TreeNodeData[];
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (selectedKeys: string[], info: { selected: boolean; node: TreeNodeData }) => void;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  defaultExpandAll?: boolean;
  onExpand?: (expandedKeys: string[], info: { expanded: boolean; node: TreeNodeData }) => void;
  checkable?: boolean;
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheck?: (
    checkedKeys: string[],
    info: { checked: boolean; node: TreeNodeData; checkedNodes: TreeNodeData[] },
  ) => void;
  showLine?: boolean;
  showIcon?: boolean;
  blockNode?: boolean;
  multiple?: boolean;
  titleRender?: (node: TreeNodeData) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  switcherIcon?: React.ReactNode;
}

function collectKeys(nodes: TreeNodeData[], all = true): string[] {
  return nodes.flatMap((node) => [
    ...(all ? [node.key] : []),
    ...(node.children ? collectKeys(node.children) : []),
  ]);
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

export function Tree({
  treeData = [],
  selectedKeys,
  defaultSelectedKeys = [],
  onSelect,
  expandedKeys,
  defaultExpandedKeys = [],
  defaultExpandAll,
  onExpand,
  checkable,
  checkedKeys,
  defaultCheckedKeys = [],
  onCheck,
  showLine,
  showIcon,
  blockNode,
  multiple,
  titleRender,
  className,
  style,
  switcherIcon,
}: TreeProps) {
  const [innerExpanded, setInnerExpanded] = useState<string[]>(
    defaultExpandAll ? collectKeys(treeData) : defaultExpandedKeys,
  );
  const [innerSelected, setInnerSelected] = useState<string[]>(defaultSelectedKeys);
  const [innerChecked, setInnerChecked] = useState<string[]>(defaultCheckedKeys);

  const expanded = expandedKeys ?? innerExpanded;
  const selected = selectedKeys ?? innerSelected;
  const checked = checkedKeys ?? innerChecked;

  const toggleExpand = (node: TreeNodeData) => {
    const next = expanded.includes(node.key)
      ? expanded.filter((key) => key !== node.key)
      : [...expanded, node.key];
    if (expandedKeys === undefined) setInnerExpanded(next);
    onExpand?.(next, { expanded: next.includes(node.key), node });
  };

  const selectNode = (node: TreeNodeData) => {
    if (node.selectable === false || node.disabled) return;
    const next = multiple
      ? selected.includes(node.key)
        ? selected.filter((key) => key !== node.key)
        : [...selected, node.key]
      : [node.key];
    if (selectedKeys === undefined) setInnerSelected(next);
    onSelect?.(next, { selected: next.includes(node.key), node });
  };

  const toggleCheck = (node: TreeNodeData) => {
    if (node.disabled || node.disableCheckbox) return;
    const descendants = node.children ? collectKeys(node.children) : [];
    const own = [node.key, ...descendants];
    const isChecked = checked.includes(node.key);
    let next = isChecked ? checked.filter((key) => !own.includes(key)) : [...new Set([...checked, ...own])];

    // 父节点：子节点全选则选中，否则取消
    const walk = (nodes: TreeNodeData[]): boolean => {
      let allChecked = true;
      nodes.forEach((child) => {
        if (child.children) {
          const childAll = walk(child.children);
          if (childAll && !next.includes(child.key)) next = [...next, child.key];
          if (!childAll) next = next.filter((key) => key !== child.key);
          allChecked = allChecked && next.includes(child.key);
        } else {
          allChecked = allChecked && next.includes(child.key);
        }
      });
      return allChecked;
    };
    walk(treeData);

    if (checkedKeys === undefined) setInnerChecked(next);
    const nodes = next
      .map((key) => findNode(treeData, key))
      .filter((item): item is TreeNodeData => !!item);
    onCheck?.(next, { checked: !isChecked, node, checkedNodes: nodes });
  };

  const renderNodes = (nodes: TreeNodeData[], level = 0) => (
    <ul className={cn('m-0 list-none p-0', showLine && level > 0 && 'ms-4 border-s border-line ps-2')}>
      {nodes.map((node) => {
        const hasChildren = !!node.children?.length;
        const isExpanded = expanded.includes(node.key);
        const isSelected = selected.includes(node.key);
        const isChecked = checked.includes(node.key);
        return (
          <li key={node.key}>
            <div
              className={cn(
                'group flex min-h-9 items-center gap-1 rounded-element pe-2 transition-colors',
                blockNode && 'w-full',
                isSelected ? 'bg-muted' : 'hover:bg-muted-soft',
                node.disabled && 'text-fg-disabled',
              )}
            >
              <button
                type="button"
                aria-label={isExpanded ? '收起' : '展开'}
                aria-expanded={hasChildren ? isExpanded : undefined}
                onClick={() => hasChildren && toggleExpand(node)}
                className={cn(
                  'ax-focus grid size-6 shrink-0 place-items-center rounded-inner text-fg-tertiary',
                  !hasChildren && 'invisible',
                )}
              >
                {switcherIcon ?? (
                  <ChevronRight
                    className={cn('size-3.5 transition-transform duration-[125ms]', isExpanded && 'rotate-90')}
                  />
                )}
              </button>
              {checkable && (
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={node.disabled || node.disableCheckbox}
                  onChange={() => toggleCheck(node)}
                  aria-label="选择节点"
                  className="ax-focus size-4 shrink-0 cursor-pointer accent-[var(--ax-accent)]"
                />
              )}
              <button
                type="button"
                onClick={() => selectNode(node)}
                className={cn(
                  'ax-focus flex min-w-0 flex-1 items-center gap-1.5 rounded-inner py-1 text-start text-base',
                  isSelected ? 'font-medium text-fg' : 'text-fg',
                  node.disabled && 'cursor-not-allowed',
                )}
              >
                {showIcon && (
                  <span className="shrink-0 text-fg-tertiary">
                    {node.icon ?? (hasChildren ? isExpanded ? <FolderOpen className="size-4" /> : <Folder className="size-4" /> : <File className="size-4" />)}
                  </span>
                )}
                <span className="min-w-0 truncate">{titleRender ? titleRender(node) : node.title}</span>
              </button>
            </div>
            {hasChildren && isExpanded && renderNodes(node.children!, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={cn('w-full text-base', className)} style={style} role="tree">
      {treeData.length === 0 ? (
        <div className="px-3 py-6 text-center text-sm text-fg-disabled">暂无数据</div>
      ) : (
        renderNodes(treeData)
      )}
    </div>
  );
}
