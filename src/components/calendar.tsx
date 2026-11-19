import { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

const WEEK = ['一', '二', '三', '四', '五', '六', '日'];

export interface CalendarProps {
  value?: Dayjs;
  defaultValue?: Dayjs;
  onSelect?: (date: Dayjs, info: { source: 'date' | 'month' | 'year' }) => void;
  onPanelChange?: (date: Dayjs, mode: 'month' | 'year') => void;
  fullscreen?: boolean;
  mode?: 'month' | 'year';
  dateCellRender?: (date: Dayjs) => React.ReactNode;
  monthCellRender?: (date: Dayjs) => React.ReactNode;
  headerRender?: (config: { value: Dayjs; onChange: (date: Dayjs) => void }) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Calendar({
  value,
  defaultValue,
  onSelect,
  onPanelChange,
  fullscreen = true,
  mode = 'month',
  dateCellRender,
  monthCellRender,
  headerRender,
  className,
  style,
}: CalendarProps) {
  const [inner, setInner] = useState(defaultValue ?? dayjs());
  const current = value ?? inner;
  const [cursor, setCursor] = useState(current);
  const [view, setView] = useState<'month' | 'year'>(mode);

  const days = useMemo(() => {
    const first = cursor.startOf('month');
    const offset = (first.day() + 6) % 7;
    const start = first.subtract(offset, 'day');
    return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
  }, [cursor]);

  const pick = (date: Dayjs, source: 'date' | 'month' | 'year') => {
    if (value === undefined) setInner(date);
    onSelect?.(date, { source });
    if (source === 'month') {
      setView('month');
      setCursor(date);
      onPanelChange?.(date, 'month');
    }
    if (source === 'year') {
      setView('month');
      onPanelChange?.(date, 'year');
    }
  };

  return (
    <div className={cn('w-full rounded-container border border-line bg-surface', className)} style={style}>
      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-2.5">
        {headerRender ? (
          headerRender({ value: cursor, onChange: (date) => setCursor(date) })
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="上个月"
                onClick={() => setCursor(cursor.subtract(1, view === 'year' ? 'year' : 'month'))}
                className="ax-press ax-focus inline-flex size-8 items-center justify-center rounded-inner text-fg-secondary hover:bg-muted"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView(view === 'month' ? 'year' : 'month')}
                className="ax-focus rounded-inner px-2 py-1 text-base font-semibold text-fg hover:bg-muted"
              >
                {cursor.format('YYYY年M月')}
              </button>
              <button
                type="button"
                aria-label="下个月"
                onClick={() => setCursor(cursor.add(1, view === 'year' ? 'year' : 'month'))}
                className="ax-press ax-focus inline-flex size-8 items-center justify-center rounded-inner text-fg-secondary hover:bg-muted"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setCursor(dayjs());
                pick(dayjs(), 'date');
              }}
              className="ax-focus rounded-full bg-muted px-2.5 py-1 text-xs text-fg-secondary hover:bg-muted-strong"
            >
              今天
            </button>
          </>
        )}
      </div>

      {view === 'year' ? (
        <div className="grid grid-cols-4 gap-2 p-4">
          {Array.from({ length: 12 }, (_, i) => {
            const date = cursor.month(i);
            const active = current.isSame(date, 'month');
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(date, 'month')}
                className={cn(
                  'ax-focus h-16 rounded-element text-base transition-colors',
                  active ? 'bg-accent text-on-accent' : 'text-fg hover:bg-muted',
                )}
              >
                {date.format('M')}月
                {monthCellRender && <div className="text-xs opacity-70">{monthCellRender(date)}</div>}
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 border-b border-line-soft text-center text-xs text-fg-tertiary">
            {WEEK.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((date) => {
              const outside = date.month() !== cursor.month();
              const active = current.isSame(date, 'day');
              const today = date.isSame(dayjs(), 'day');
              return (
                <button
                  key={date.valueOf()}
                  type="button"
                  onClick={() => pick(date, 'date')}
                  className={cn(
                    'ax-focus relative flex flex-col gap-0.5 border-b border-e border-line-soft p-1.5 text-start align-top transition-colors',
                    fullscreen ? 'min-h-[92px]' : 'min-h-[56px]',
                    'last:border-e-0 hover:bg-muted-soft',
                    outside && 'text-fg-disabled',
                  )}
                >
                  <span
                    className={cn(
                      'inline-grid size-6 place-items-center rounded-full text-sm tabular-nums',
                      active
                        ? 'bg-accent font-medium text-on-accent'
                        : today
                          ? 'font-semibold text-accent ring-1 ring-inset ring-accent'
                          : 'text-fg',
                    )}
                  >
                    {date.date()}
                  </span>
                  {dateCellRender && <span className="min-w-0 text-xs">{dateCellRender(date)}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
