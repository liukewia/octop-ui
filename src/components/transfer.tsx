import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../lib/cn';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Empty } from './empty';

export interface TransferItem {
  key: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface TransferProps {
  dataSource?: TransferItem[];
  targetKeys?: string[];
  defaultTargetKeys?: string[];
  onChange?: (nextTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  titles?: [React.ReactNode, React.ReactNode];
  operations?: [React.ReactNode, React.ReactNode];
  showSearch?: boolean;
  disabled?: boolean;
  listStyle?: React.CSSProperties;
  className?: string;
  filterOption?: (inputValue: string, item: TransferItem) => boolean;
  render?: (item: TransferItem) => React.ReactNode;
  oneWay?: boolean;
}

export function Transfer({
  dataSource = [],
  targetKeys,
  defaultTargetKeys = [],
  onChange,
  titles = ['列表', '已选'],
  operations = ['添加', '移除'],
  showSearch,
  disabled,
  listStyle,
  className,
  filterOption,
  render,
  oneWay,
}: TransferProps) {
  const [inner, setInner] = useState<string[]>(defaultTargetKeys);
  const keys = targetKeys ?? inner;
  const [checkedLeft, setCheckedLeft] = useState<string[]>([]);
  const [checkedRight, setCheckedRight] = useState<string[]>([]);
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');

  const match = (item: TransferItem, keyword: string) =>
    !keyword || (filterOption ? filterOption(keyword, item) : String(item.title ?? '').toLowerCase().includes(keyword.toLowerCase()));

  const leftItems = useMemo(
    () => dataSource.filter((item) => !keys.includes(item.key) && match(item, leftSearch)),
    [dataSource, keys, leftSearch],
  );
  const rightItems = useMemo(
    () => dataSource.filter((item) => keys.includes(item.key) && match(item, rightSearch)),
    [dataSource, keys, rightSearch],
  );

  const move = (direction: 'left' | 'right') => {
    const moving = direction === 'right' ? checkedLeft : checkedRight;
    const next = direction === 'right' ? [...keys, ...moving] : keys.filter((key) => !moving.includes(key));
    if (targetKeys === undefined) setInner(next);
    onChange?.(next, direction, moving);
    if (direction === 'right') setCheckedLeft([]);
    else setCheckedRight([]);
  };

  const list = (
    items: TransferItem[],
    checked: string[],
    setChecked: (keys: string[]) => void,
    search: string,
    setSearch: (value: string) => void,
    emptyText: string,
  ) => (
    <div className="flex min-w-0 flex-1 flex-col rounded-element border border-line bg-surface" style={listStyle}>
      <div className="flex items-center justify-between gap-2 border-b border-line-soft px-3 py-2 text-sm font-medium text-fg">
        <span className="truncate">{emptyText}</span>
        <span className="shrink-0 text-xs tabular-nums text-fg-tertiary">
          {checked.length}/{items.length}
        </span>
      </div>
      {showSearch && (
        <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2">
          <Search className="size-3.5 shrink-0 text-fg-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索"
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-fg-disabled"
          />
        </div>
      )}
      <div className="min-h-[180px] flex-1 overflow-y-auto p-1">
        {items.length === 0 ? (
          <Empty image="simple" description="暂无数据" className="py-6" />
        ) : (
          items.map((item) => (
            <label
              key={item.key}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-inner px-2 py-1.5 text-base hover:bg-muted-soft',
                item.disabled && 'cursor-not-allowed text-fg-disabled',
              )}
            >
              <Checkbox
                checked={checked.includes(item.key)}
                disabled={disabled || item.disabled}
                onChange={(e) =>
                  setChecked(e.target.checked ? [...checked, item.key] : checked.filter((key) => key !== item.key))
                }
              />
              <span className="min-w-0 flex-1 truncate">
                {render ? render(item) : item.title}
                {item.description && <span className="block text-xs text-fg-tertiary">{item.description}</span>}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('flex items-stretch gap-3', className)}>
      {list(leftItems, checkedLeft, setCheckedLeft, leftSearch, setLeftSearch, titles[0] as string)}
      <div className="flex shrink-0 flex-col items-center justify-center gap-2">
        <Button
          size="small"
          shape="circle"
          disabled={disabled || checkedLeft.length === 0}
          onClick={() => move('right')}
          aria-label={String(operations[0])}
          icon={<ChevronRight />}
        />
        {!oneWay && (
          <Button
            size="small"
            shape="circle"
            disabled={disabled || checkedRight.length === 0}
            onClick={() => move('left')}
            aria-label={String(operations[1])}
            icon={<ChevronLeft />}
          />
        )}
      </div>
      {list(rightItems, checkedRight, setCheckedRight, rightSearch, setRightSearch, titles[1] as string)}
    </div>
  );
}
