import { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { cn } from '../lib/cn';
import {
  fieldShell,
  heightClass,
  textClass,
  variantClass,
  type SizeType,
  type StatusType,
  type VariantType,
} from '../lib/field';

const WEEK = ['一', '二', '三', '四', '五', '六', '日'];

export type PickerMode = 'date' | 'month' | 'year';

export interface DatePickerProps {
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (date: Dayjs | null, dateString: string) => void;
  picker?: PickerMode;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  size?: SizeType;
  status?: StatusType;
  variant?: VariantType;
  className?: string;
  style?: React.CSSProperties;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabledDate?: (current: Dayjs) => boolean;
  showTime?: boolean;
  presets?: { label: React.ReactNode; value: Dayjs }[];
  id?: string;
  'aria-label'?: string;
}

function formatOf(picker: PickerMode, showTime?: boolean, format?: string) {
  if (format) return format;
  if (picker === 'month') return 'YYYY-MM';
  if (picker === 'year') return 'YYYY';
  return showTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
}

function PanelHeader({
  label,
  onPrev,
  onNext,
  onLabel,
}: {
  label: React.ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onLabel: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <button
        type="button"
        aria-label="上一页"
        onClick={onPrev}
        className="ax-press ax-focus inline-flex size-8 items-center justify-center rounded-inner text-fg-secondary hover:bg-muted"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={onLabel}
        className="ax-focus rounded-inner px-2 py-1 text-base font-medium text-fg hover:bg-muted"
      >
        {label}
      </button>
      <button
        type="button"
        aria-label="下一页"
        onClick={onNext}
        className="ax-press ax-focus inline-flex size-8 items-center justify-center rounded-inner text-fg-secondary hover:bg-muted"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function CalendarPanel({
  cursor,
  setCursor,
  mode,
  setMode,
  selected,
  onSelect,
  disabledDate,
  rangeEnd,
  onHover,
}: {
  cursor: Dayjs;
  setCursor: (next: Dayjs) => void;
  mode: PickerMode;
  setMode: (next: PickerMode) => void;
  selected: Dayjs | null;
  onSelect: (date: Dayjs) => void;
  disabledDate?: (current: Dayjs) => boolean;
  rangeEnd?: Dayjs | null;
  onHover?: (date: Dayjs | null) => void;
}) {
  const days = useMemo(() => {
    const first = cursor.startOf('month');
    const offset = (first.day() + 6) % 7;
    const start = first.subtract(offset, 'day');
    return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
  }, [cursor]);

  if (mode === 'month') {
    return (
      <div className="w-[268px]">
        <PanelHeader
          label={cursor.format('YYYY')}
          onPrev={() => setCursor(cursor.subtract(1, 'year'))}
          onNext={() => setCursor(cursor.add(1, 'year'))}
          onLabel={() => setMode('year')}
        />
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }, (_, i) => {
            const date = cursor.month(i);
            const active = selected?.isSame(date, 'month');
            return (
              <button
                key={i}
                type="button"
                disabled={disabledDate?.(date)}
                onClick={() => onSelect(date)}
                className={cn(
                  'ax-focus h-9 rounded-element text-base transition-colors',
                  active ? 'bg-accent font-medium text-on-accent' : 'text-fg hover:bg-muted',
                  'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent',
                )}
              >
                {date.format('M')}月
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === 'year') {
    const startYear = Math.floor(cursor.year() / 12) * 12;
    return (
      <div className="w-[268px]">
        <PanelHeader
          label={`${startYear} - ${startYear + 11}`}
          onPrev={() => setCursor(cursor.subtract(12, 'year'))}
          onNext={() => setCursor(cursor.add(12, 'year'))}
          onLabel={() => setMode('date')}
        />
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }, (_, i) => {
            const date = cursor.year(startYear + i);
            const active = selected?.year() === startYear + i;
            return (
              <button
                key={i}
                type="button"
                disabled={disabledDate?.(date)}
                onClick={() => onSelect(date)}
                className={cn(
                  'ax-focus h-9 rounded-element text-base transition-colors',
                  active ? 'bg-accent font-medium text-on-accent' : 'text-fg hover:bg-muted',
                  'disabled:cursor-not-allowed disabled:text-fg-disabled',
                )}
              >
                {startYear + i}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[268px]">
      <PanelHeader
        label={cursor.format('YYYY年M月')}
        onPrev={() => setCursor(cursor.subtract(1, 'month'))}
        onNext={() => setCursor(cursor.add(1, 'month'))}
        onLabel={() => setMode('month')}
      />
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-fg-tertiary">
        {WEEK.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {days.map((date) => {
          const outside = date.month() !== cursor.month();
          const active = selected?.isSame(date, 'day');
          const inRange =
            selected && rangeEnd && date.isAfter(selected, 'day') && date.isBefore(rangeEnd, 'day');
          const edge = selected && rangeEnd && (date.isSame(selected, 'day') || date.isSame(rangeEnd, 'day'));
          return (
            <button
              key={date.valueOf()}
              type="button"
              disabled={disabledDate?.(date)}
              onClick={() => onSelect(date)}
              onMouseEnter={() => onHover?.(date)}
              className={cn(
                'ax-focus relative mx-auto grid size-8 place-items-center rounded-full text-base transition-colors',
                outside && 'text-fg-disabled',
                active || edge
                  ? 'bg-accent font-medium text-on-accent'
                  : inRange
                    ? 'bg-muted text-fg'
                    : 'text-fg hover:bg-muted',
                'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent',
              )}
            >
              {date.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DatePickerRoot({
  value,
  defaultValue,
  onChange,
  picker = 'date',
  format,
  placeholder = '请选择日期',
  disabled,
  allowClear = true,
  size = 'middle',
  status,
  variant = 'outlined',
  className,
  style,
  open,
  onOpenChange,
  disabledDate,
  showTime,
  presets,
  id,
  ...aria
}: DatePickerProps) {
  const [inner, setInner] = useState<Dayjs | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = open ?? innerOpen;
  const [mode, setMode] = useState<PickerMode>(picker);
  const [cursor, setCursor] = useState<Dayjs>(current ?? dayjs());

  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
    if (next) {
      setMode(picker);
      setCursor(current ?? dayjs());
    }
  };

  const commit = (date: Dayjs | null) => {
    if (value === undefined) setInner(date);
    onChange?.(date, date ? date.format(formatOf(picker, showTime, format)) : '');
    if (picker === 'date') setOpen(false);
    else if (mode === 'month' || mode === 'year') {
      // 月/年模式下选完就收，避免用户还要再点一次
      setOpen(false);
    }
  };

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={aria['aria-label']}
          onClick={() => setOpen(!isOpen)}
          className={cn(
            fieldShell({ size, variant, status, disabled, className }),
            'cursor-pointer text-start',
            isOpen && 'border-accent',
            status === 'error' && 'border-danger',
          )}
          style={style}
          data-invalid={status === 'error' || undefined}
        >
          <span className={cn('min-w-0 flex-1 truncate', !current && 'text-fg-disabled')}>
            {current ? current.format(formatOf(picker, showTime, format)) : placeholder}
          </span>
          {allowClear && current && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="清除"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                commit(null);
              }}
              className="ax-press -mr-1 inline-flex size-5 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
            >
              <X className="size-3.5" />
            </span>
          ) : showTime ? (
            <Clock className="size-4 shrink-0 text-fg-tertiary" />
          ) : (
            <CalendarDays className="size-4 shrink-0 text-fg-tertiary" />
          )}
        </button>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="ax-popover z-50 p-3 outline-none data-[state=open]:animate-layer-in data-[state=closed]:animate-layer-out"
        >
          <CalendarPanel
            cursor={cursor}
            setCursor={setCursor}
            mode={mode}
            setMode={setMode}
            selected={current}
            onSelect={(date) => {
              if (picker === 'month') commit(date.startOf('month'));
              else if (picker === 'year') commit(date.startOf('year'));
              else commit(date);
            }}
            disabledDate={disabledDate}
          />
          {presets && presets.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 border-t border-line-soft pt-2">
              {presets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => commit(preset.value)}
                  className="ax-press rounded-full bg-muted px-2.5 py-1 text-xs text-fg-secondary hover:bg-muted-strong"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export interface RangePickerProps
  extends Omit<DatePickerProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder'> {
  value?: [Dayjs | null, Dayjs | null] | null;
  defaultValue?: [Dayjs | null, Dayjs | null] | null;
  onChange?: (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => void;
  placeholder?: [string, string];
}

export function RangePicker({
  value,
  defaultValue,
  onChange,
  picker = 'date',
  format,
  placeholder = ['开始日期', '结束日期'],
  disabled,
  allowClear = true,
  size = 'middle',
  status,
  variant = 'outlined',
  className,
  style,
  open,
  onOpenChange,
  disabledDate,
}: RangePickerProps) {
  const [inner, setInner] = useState<[Dayjs | null, Dayjs | null] | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = open ?? innerOpen;
  const [cursor, setCursor] = useState<Dayjs>(current?.[0] ?? dayjs());
  const [hover, setHover] = useState<Dayjs | null>(null);
  const [picking, setPicking] = useState<'start' | 'end'>('start');

  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
    if (next) setPicking('start');
  };

  const commit = (next: [Dayjs | null, Dayjs | null] | null) => {
    if (value === undefined) setInner(next);
    onChange?.(
      next,
      [
        next?.[0] ? next[0].format(formatOf(picker, false, format)) : '',
        next?.[1] ? next[1].format(formatOf(picker, false, format)) : '',
      ],
    );
  };

  const pick = (date: Dayjs) => {
    if (picking === 'start' || !current?.[0]) {
      commit([date, null]);
      setPicking('end');
      return;
    }
    const start = current[0];
    const next: [Dayjs, Dayjs] = date.isBefore(start, 'day') ? [date, start] : [start, date];
    commit(next);
    setOpen(false);
  };

  const fmt = formatOf(picker, false, format);

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div
          onClick={() => setOpen(!isOpen)}
          className={cn(
            'ax-field flex cursor-pointer items-center gap-2 px-3',
            heightClass[size],
            textClass[size],
            variantClass[variant],
            isOpen && 'border-accent',
            status === 'error' && 'border-danger',
            disabled && 'cursor-not-allowed bg-muted-soft',
            className,
          )}
          style={style}
          data-invalid={status === 'error' || undefined}
        >
          <span className={cn('min-w-0 flex-1 truncate', !current?.[0] && 'text-fg-disabled')}>
            {current?.[0] ? current[0].format(fmt) : placeholder[0]}
          </span>
          <span className="text-fg-disabled">→</span>
          <span className={cn('min-w-0 flex-1 truncate', !current?.[1] && 'text-fg-disabled')}>
            {current?.[1] ? current[1].format(fmt) : placeholder[1]}
          </span>
          {allowClear && current?.[0] ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="清除"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                commit(null);
              }}
              className="ax-press inline-flex size-5 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
            >
              <X className="size-3.5" />
            </span>
          ) : (
            <CalendarDays className="size-4 shrink-0 text-fg-tertiary" />
          )}
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="ax-popover z-50 p-3 outline-none data-[state=open]:animate-layer-in data-[state=closed]:animate-layer-out"
        >
          <CalendarPanel
            cursor={cursor}
            setCursor={setCursor}
            mode={picker}
            setMode={() => undefined}
            selected={picking === 'end' && hover ? hover : (current?.[0] ?? null)}
            rangeEnd={picking === 'end' ? (current?.[1] ?? null) : null}
            onSelect={pick}
            disabledDate={disabledDate}
            onHover={setHover}
          />
          <div className="mt-2 border-t border-line-soft pt-2 text-xs text-fg-tertiary">
            {picking === 'start' ? '选择开始日期' : '选择结束日期'}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/* ------------------------------------------------------------- TimePicker */

export interface TimePickerProps {
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (time: Dayjs | null, timeString: string) => void;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  size?: SizeType;
  status?: StatusType;
  minuteStep?: number;
  hourStep?: number;
  className?: string;
}

export function TimePicker({
  value,
  defaultValue,
  onChange,
  format = 'HH:mm',
  placeholder = '请选择时间',
  disabled,
  allowClear = true,
  size = 'middle',
  status,
  minuteStep = 5,
  hourStep = 1,
  className,
}: TimePickerProps) {
  const [inner, setInner] = useState<Dayjs | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const [open, setOpen] = useState(false);

  const commit = (next: Dayjs | null) => {
    if (value === undefined) setInner(next);
    onChange?.(next, next ? next.format(format) : '');
  };

  const options = (count: number, step: number) =>
    Array.from({ length: Math.ceil(count / step) }, (_, i) => i * step);

  const base = current ?? dayjs().hour(0).minute(0).second(0);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            fieldShell({ size, status, disabled, className }),
            'cursor-pointer text-start',
            open && 'border-accent',
          )}
          data-invalid={status === 'error' || undefined}
        >
          <span className={cn('min-w-0 flex-1 truncate', !current && 'text-fg-disabled')}>
            {current ? current.format(format) : placeholder}
          </span>
          {allowClear && current && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="清除"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                commit(null);
              }}
              className="ax-press inline-flex size-5 items-center justify-center rounded-full text-fg-tertiary hover:text-fg"
            >
              <X className="size-3.5" />
            </span>
          ) : (
            <Clock className="size-4 shrink-0 text-fg-tertiary" />
          )}
        </button>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="ax-popover z-50 flex gap-1 p-2 outline-none data-[state=open]:animate-layer-in"
        >
          <div className="h-48 w-14 overflow-y-auto">
            {options(24, hourStep).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => commit(base.hour(h))}
                className={cn(
                  'ax-focus block h-8 w-full rounded-inner text-center text-base tabular-nums',
                  base.hour() === h ? 'bg-accent text-on-accent' : 'text-fg hover:bg-muted',
                )}
              >
                {String(h).padStart(2, '0')}
              </button>
            ))}
          </div>
          <div className="h-48 w-14 overflow-y-auto">
            {options(60, minuteStep).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  commit(base.minute(m));
                  setOpen(false);
                }}
                className={cn(
                  'ax-focus block h-8 w-full rounded-inner text-center text-base tabular-nums',
                  base.minute() === m ? 'bg-accent text-on-accent' : 'text-fg hover:bg-muted',
                )}
              >
                {String(m).padStart(2, '0')}
              </button>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/** DatePicker.RangePicker / DatePicker.TimePicker 都在同一组导出里 */
export const DatePicker = Object.assign(DatePickerRoot, { RangePicker, TimePicker });
export const DatePickerRange = RangePicker;
