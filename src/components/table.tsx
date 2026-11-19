import { Fragment, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronDown, ChevronUp, Filter, ListFilter } from 'lucide-react';
import { cn } from '../lib/cn';
import { Checkbox } from './checkbox';
import { Empty } from './empty';
import { Pagination } from './pagination';

export type SortOrder = 'ascend' | 'descend' | null;
export type Key = string | number;

export interface ColumnType<T> {
  key?: Key;
  dataIndex?: string | string[];
  title?: React.ReactNode;
  width?: number | string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;
  filters?: { text: React.ReactNode; value: string | number }[];
  filterMultiple?: boolean;
  filteredValue?: (string | number)[];
  onFilter?: (value: string | number, record: T) => boolean;
  ellipsis?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
  titleClassName?: string;
  hidden?: boolean;
}

export interface TablePagination {
  current?: number;
  pageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  pageSizeOptions?: number[];
  hideOnSinglePage?: boolean;
}

export interface RowSelection<T> {
  selectedRowKeys?: Key[];
  defaultSelectedRowKeys?: Key[];
  onChange?: (selectedRowKeys: Key[], selectedRows: T[]) => void;
  type?: 'checkbox' | 'radio';
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  columnWidth?: number;
}

export interface TableProps<T> {
  columns: ColumnType<T>[];
  dataSource?: T[];
  rowKey?: string | ((record: T) => Key);
  loading?: boolean;
  pagination?: false | TablePagination;
  rowSelection?: RowSelection<T>;
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  onChange?: (pagination: TablePagination, filters: Record<string, (string | number)[]>, sorter: { columnKey?: Key; order?: SortOrder }) => void;
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  showHeader?: boolean;
  scroll?: { x?: number | string; y?: number | string };
  sticky?: boolean;
  locale?: { emptyText?: React.ReactNode };
  className?: string;
  style?: React.CSSProperties;
  footer?: (data: T[]) => React.ReactNode;
  caption?: React.ReactNode;
  expandable?: {
    expandedRowRender?: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
    expandedRowKeys?: Key[];
    defaultExpandedRowKeys?: Key[];
    onExpand?: (expanded: boolean, record: T) => void;
  };
}

function readPath(record: unknown, path?: string | string[]) {
  if (!path) return undefined;
  const keys = Array.isArray(path) ? path : path.split('.');
  return keys.reduce<unknown>(
    (acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]),
    record,
  );
}

export function Table<T extends object>({
  columns,
  dataSource = [],
  rowKey = 'key',
  loading,
  pagination = {},
  rowSelection,
  onRow,
  onChange,
  size = 'middle',
  bordered,
  showHeader = true,
  scroll,
  sticky,
  locale,
  className,
  style,
  footer,
  caption,
  expandable,
}: TableProps<T>) {
  const [sort, setSort] = useState<{ key?: Key; order: SortOrder }>({ order: null });
  const [filters, setFilters] = useState<Record<string, (string | number)[]>>({});
  const [page, setPage] = useState(pagination === false ? 1 : (pagination.current ?? 1));
  const [pageSize, setPageSize] = useState(pagination === false ? 10 : (pagination.pageSize ?? 10));
  const [innerSelected, setInnerSelected] = useState<Key[]>(rowSelection?.defaultSelectedRowKeys ?? []);
  const [innerExpanded, setInnerExpanded] = useState<Key[]>(expandable?.defaultExpandedRowKeys ?? []);

  const getKey = (record: T, index: number): Key =>
    typeof rowKey === 'function'
      ? rowKey(record)
      : (((record as Record<string, unknown>)[rowKey] as Key) ?? index);

  const selectedKeys = rowSelection?.selectedRowKeys ?? innerSelected;
  const expandedKeys = expandable?.expandedRowKeys ?? innerExpanded;

  const visibleColumns = columns.filter((column) => !column.hidden);

  let rows = dataSource.slice();

  // filters
  Object.entries(filters).forEach(([key, values]) => {
    if (!values.length) return;
    const column = visibleColumns.find((c) => String(c.key ?? c.dataIndex) === key);
    if (!column?.onFilter) return;
    rows = rows.filter((record) => values.some((value) => column.onFilter?.(value, record)));
  });

  // sorter
  if (sort.order && sort.key !== undefined) {
    const column = visibleColumns.find((c) => String(c.key ?? c.dataIndex) === String(sort.key));
    if (column && column.sorter) {
      rows.sort((a, b) => {
        const result =
          typeof column.sorter === 'function'
            ? column.sorter(a, b)
            : String(readPath(a, column.dataIndex) ?? '').localeCompare(String(readPath(b, column.dataIndex) ?? ''));
        return sort.order === 'descend' ? -result : result;
      });
    }
  }

  const total = pagination === false ? rows.length : (pagination.total ?? rows.length);
  const paged = pagination === false ? rows : rows.slice((page - 1) * pageSize, page * pageSize);

  const padding =
    size === 'small' ? 'px-3 py-2' : size === 'large' ? 'px-5 py-4' : 'px-3 py-2.5';
  const alignCls = (align?: ColumnType<T>['align']) =>
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-start';

  const toggleSort = (column: ColumnType<T>) => {
    if (!column.sorter) return;
    const columnKey = column.key ?? column.dataIndex?.toString();
    const nextOrder: SortOrder =
      sort.key === columnKey ? (sort.order === 'ascend' ? 'descend' : sort.order === 'descend' ? null : 'ascend') : 'ascend';
    const next = { key: nextOrder ? columnKey : undefined, order: nextOrder };
    setSort(next);
    onChange?.({ current: page, pageSize, total }, filters, { columnKey: next.key, order: nextOrder });
  };

  const setFilter = (column: ColumnType<T>, values: (string | number)[]) => {
    const columnKey = String(column.key ?? column.dataIndex);
    const next = { ...filters, [columnKey]: values };
    setFilters(next);
    setPage(1);
    onChange?.({ current: 1, pageSize, total }, next, { columnKey: sort.key, order: sort.order });
  };

  const selectRows = (keys: Key[]) => {
    if (rowSelection?.selectedRowKeys === undefined) setInnerSelected(keys);
    const selectedRows = dataSource.filter((record, index) => keys.includes(getKey(record, index)));
    rowSelection?.onChange?.(keys, selectedRows);
  };

  const toggleExpand = (record: T, index: number) => {
    const key = getKey(record, index);
    const next = expandedKeys.includes(key) ? expandedKeys.filter((k) => k !== key) : [...expandedKeys, key];
    if (expandable?.expandedRowKeys === undefined) setInnerExpanded(next);
    expandable?.onExpand?.(next.includes(key), record);
  };

  const allKeys = paged.map((record, index) => getKey(record, index));
  const allSelected = allKeys.length > 0 && allKeys.every((key) => selectedKeys.includes(key));
  const someSelected = allKeys.some((key) => selectedKeys.includes(key)) && !allSelected;

  const colCount =
    visibleColumns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0);

  return (
    <div className={cn('w-full', className)} style={style}>
      <div
        className={cn(
          'overflow-hidden rounded-container border border-line bg-surface',
          bordered && '[&_td]:border-e [&_td:last-child]:border-e-0 [&_th]:border-e [&_th:last-child]:border-e-0',
        )}
      >
        <div
          className={cn(scroll?.y && 'overflow-y-auto')}
          style={scroll?.y ? { maxHeight: scroll.y } : undefined}
        >
          <table className="w-full border-collapse text-base" style={scroll?.x ? { minWidth: scroll.x } : undefined}>
            {caption && <caption className="px-3 py-2 text-start text-sm text-fg-tertiary">{caption}</caption>}
            {showHeader && (
              <thead className={cn(sticky && 'sticky top-0 z-10 bg-surface')}>
                <tr>
                  {expandable && <th className="w-9" />}
                  {rowSelection && (
                    <th className={cn('w-10', padding)}>
                      {rowSelection.type === 'radio' ? null : (
                        <Checkbox
                          aria-label="全选"
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const merged = Array.from(new Set([...selectedKeys, ...allKeys]));
                              selectRows(merged);
                            } else {
                              selectRows(selectedKeys.filter((key) => !allKeys.includes(key)));
                            }
                          }}
                        />
                      )}
                    </th>
                  )}
                  {visibleColumns.map((column) => {
                    const columnKey = String(column.key ?? column.dataIndex);
                    const active = sort.key === columnKey;
                    const filterValues = column.filteredValue ?? filters[columnKey] ?? [];
                    return (
                      <th
                        key={columnKey}
                        scope="col"
                        className={cn(
                          // 表头：14/600、次级色、与表体同色、没有灰底
                          'border-b border-line text-sm font-semibold text-fg-secondary',
                          padding,
                          alignCls(column.align),
                          column.titleClassName,
                        )}
                        style={{ width: column.width, minWidth: column.minWidth }}
                      >
                        <span className="inline-flex items-center gap-1">
                          <span className={cn(column.ellipsis && 'truncate')}>{column.title}</span>
                          {column.sorter && (
                            <button
                              type="button"
                              aria-label="排序"
                              onClick={() => toggleSort(column)}
                              className="ax-focus inline-flex flex-col rounded-[3px] text-fg-disabled hover:text-fg"
                            >
                              <ChevronUp
                                className={cn('-mb-1 size-3', active && sort.order === 'ascend' && 'text-accent')}
                                strokeWidth={2.5}
                              />
                              <ChevronDown
                                className={cn('size-3', active && sort.order === 'descend' && 'text-accent')}
                                strokeWidth={2.5}
                              />
                            </button>
                          )}
                          {column.filters && column.filters.length > 0 && (
                            <PopoverPrimitive.Root>
                              <PopoverPrimitive.Trigger asChild>
                                <button
                                  type="button"
                                  aria-label="筛选"
                                  className={cn(
                                    'ax-focus inline-flex size-6 items-center justify-center rounded-inner hover:bg-muted',
                                    filterValues.length ? 'text-accent' : 'text-fg-disabled hover:text-fg',
                                  )}
                                >
                                  {filterValues.length ? <ListFilter className="size-3.5" /> : <Filter className="size-3.5" />}
                                </button>
                              </PopoverPrimitive.Trigger>
                              <PopoverPrimitive.Portal>
                                <PopoverPrimitive.Content
                                  side="bottom"
                                  align="end"
                                  sideOffset={4}
                                  className="ax-popover z-50 min-w-[160px] p-1.5 outline-none data-[state=open]:animate-layer-in"
                                >
                                  <div className="flex flex-col">
                                    {column.filters.map((option) => {
                                      const checked = filterValues.includes(option.value);
                                      return (
                                        <label
                                          key={String(option.value)}
                                          className="flex cursor-pointer items-center gap-2 rounded-inner px-2 py-1.5 text-base hover:bg-muted-soft"
                                        >
                                          <Checkbox
                                            checked={checked}
                                            onChange={() =>
                                              setFilter(
                                                column,
                                                checked
                                                  ? filterValues.filter((v) => v !== option.value)
                                                  : column.filterMultiple === false
                                                    ? [option.value]
                                                    : [...filterValues, option.value],
                                              )
                                            }
                                          />
                                          <span className="truncate">{option.text}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-1 flex justify-end border-t border-line-soft pt-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setFilter(column, [])}
                                      className="ax-focus rounded-inner px-2 py-1 text-sm text-fg-secondary hover:bg-muted"
                                    >
                                      重置
                                    </button>
                                  </div>
                                </PopoverPrimitive.Content>
                              </PopoverPrimitive.Portal>
                            </PopoverPrimitive.Root>
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}
            <tbody className={cn(loading && 'opacity-40')}>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="px-3 py-8">
                    <Empty description={locale?.emptyText ?? '暂无数据'} image="simple" />
                  </td>
                </tr>
              )}
              {paged.map((record, rowIndex) => {
                const key = getKey(record, rowIndex);
                const selected = selectedKeys.includes(key);
                const expanded = expandedKeys.includes(key);
                const rowProps = onRow?.(record, rowIndex) ?? {};
                return (
                  <Fragment key={key}>
                    <tr
                      {...rowProps}
                      data-selected={selected || undefined}
                      className={cn(
                        'border-b border-line transition-colors duration-[125ms] last:border-b-0',
                        'hover:bg-muted-soft',
                        selected && 'bg-muted-soft',
                        rowProps.className,
                      )}
                    >
                      {expandable && (
                        <td className={cn('w-9', padding)}>
                          {expandable.rowExpandable?.(record) !== false && (
                            <button
                              type="button"
                              aria-label={expanded ? '收起' : '展开'}
                              aria-expanded={expanded}
                              onClick={() => toggleExpand(record, rowIndex)}
                              className="ax-focus inline-flex size-6 items-center justify-center rounded-inner text-fg-tertiary hover:bg-muted"
                            >
                              <ChevronDown
                                className={cn('size-4 transition-transform duration-[125ms]', !expanded && '-rotate-90')}
                              />
                            </button>
                          )}
                        </td>
                      )}
                      {rowSelection && (
                        <td className={cn('w-10', padding)}>
                          <Checkbox
                            checked={selected}
                            disabled={rowSelection.getCheckboxProps?.(record).disabled}
                            onChange={(e) => {
                              if (rowSelection.type === 'radio') {
                                selectRows([key]);
                                return;
                              }
                              selectRows(
                                e.target.checked ? [...selectedKeys, key] : selectedKeys.filter((k) => k !== key),
                              );
                            }}
                          />
                        </td>
                      )}
                      {visibleColumns.map((column) => {
                        const value = readPath(record, column.dataIndex);
                        return (
                          <td
                            key={String(column.key ?? column.dataIndex)}
                            className={cn(
                              padding,
                              alignCls(column.align),
                              'text-fg',
                              column.ellipsis && 'max-w-0 truncate',
                              column.className,
                            )}
                          >
                            {column.render ? column.render(value, record, rowIndex) : (value as React.ReactNode)}
                          </td>
                        );
                      })}
                    </tr>
                    {expandable && expanded && (
                      <tr className="border-b border-line last:border-b-0">
                        <td colSpan={colCount} className="bg-muted-soft px-4 py-3">
                          {expandable.expandedRowRender?.(record, rowIndex)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 border-t border-line-soft py-2 text-sm text-fg-tertiary">
            <span className="ax-spinner size-4 text-accent" />
            加载中
          </div>
        )}
      </div>
      {footer && <div className="mt-2 text-sm text-fg-secondary">{footer(paged)}</div>}
      {pagination !== false && total > 0 && (
        <div className="mt-3">
          <Pagination
            current={pagination.current ?? page}
            pageSize={pagination.pageSize ?? pageSize}
            total={total}
            showSizeChanger={pagination.showSizeChanger}
            showTotal={pagination.showTotal}
            pageSizeOptions={pagination.pageSizeOptions}
            hideOnSinglePage={pagination.hideOnSinglePage}
            onChange={(nextPage, nextSize) => {
              if (pagination.current === undefined) setPage(nextPage);
              if (pagination.pageSize === undefined) setPageSize(nextSize);
              pagination.onChange?.(nextPage, nextSize);
              onChange?.({ current: nextPage, pageSize: nextSize, total }, filters, {
                columnKey: sort.key,
                order: sort.order,
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
