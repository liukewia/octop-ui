import { forwardRef, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface StatisticProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> {
  title?: React.ReactNode;
  value?: string | number;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  valueStyle?: React.CSSProperties;
  formatter?: (value: string | number) => React.ReactNode;
  loading?: boolean;
  groupSeparator?: string;
}

function group(value: string, separator = ',') {
  const [int, decimal] = value.split('.');
  const sign = int.startsWith('-') ? '-' : '';
  const digits = sign ? int.slice(1) : int;
  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator)}${decimal ? `.${decimal}` : ''}`;
}

const StatisticRoot = forwardRef<HTMLDivElement, StatisticProps>(function Statistic(
  {
    title,
    value = 0,
    precision,
    prefix,
    suffix,
    valueStyle,
    formatter,
    loading,
    groupSeparator = ',',
    className,
    ...rest
  },
  ref,
) {
  const text =
    typeof value === 'number'
      ? group(precision !== undefined ? value.toFixed(precision) : String(value), groupSeparator)
      : group(String(value), groupSeparator);

  return (
    <div ref={ref} className={cn('min-w-0', className)} {...rest}>
      {title && <div className="text-sm text-fg-secondary">{title}</div>}
      {loading ? (
        <div className="ax-skeleton mt-2 h-8 w-24 animate-breathe" />
      ) : (
        <div
          className="mt-1 flex items-baseline gap-1 text-2xl font-semibold tabular-nums text-fg"
          style={valueStyle}
        >
          {prefix && <span className="text-lg">{prefix}</span>}
          <span>{formatter ? formatter(value) : text}</span>
          {suffix && <span className="text-lg font-normal text-fg-secondary">{suffix}</span>}
        </div>
      )}
    </div>
  );
});

export interface CountdownProps extends Omit<StatisticProps, 'value'> {
  /** 目标时间戳（ms），不是剩余毫秒 */
  value?: number;
  /** 支持 D / HH / H / mm / m / ss / s 占位符 */
  format?: string;
  onFinish?: () => void;
}

/** antd 的 Statistic.Countdown：只做展示层，值仍由调用方传入 */
export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(function Countdown(
  { value = 0, format = 'HH:mm:ss', title, onFinish, ...rest },
  ref,
) {
  const remainOf = () => Math.max(0, value - Date.now());
  const [remaining, setRemaining] = useState(remainOf);
  const finished = useRef(false);

  useEffect(() => {
    finished.current = false;
    setRemaining(Math.max(0, value - Date.now()));
    const id = window.setInterval(() => {
      const next = Math.max(0, value - Date.now());
      setRemaining(next);
      if (next === 0 && !finished.current) {
        finished.current = true;
        window.clearInterval(id);
        onFinish?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = Math.floor(remaining / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  // 先长后短，避免 HH 被 H 先替换掉
  const text = format
    .replace(/HH/g, pad(hours))
    .replace(/H/g, String(hours))
    .replace(/mm/g, pad(minutes))
    .replace(/m/g, String(minutes))
    .replace(/ss/g, pad(seconds))
    .replace(/s/g, String(seconds))
    .replace(/D/g, String(days));

  return <StatisticRoot ref={ref} title={title} value={text} {...rest} />;
});

export const Statistic = Object.assign(StatisticRoot, { Countdown });
