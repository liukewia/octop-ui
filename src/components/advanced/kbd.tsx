import { cn } from '../../lib/cn';

export interface KbdProps {
  /** 组合键；不传则用 children 当单键 */
  keys?: React.ReactNode[];
  children?: React.ReactNode;
  /** 两个键之间的连接符，默认 `+` */
  separator?: React.ReactNode;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

const SIZE = {
  small: 'h-5 min-w-5 px-1 text-[11px]',
  middle: 'h-6 min-w-6 px-1.5 text-xs',
  large: 'h-7 min-w-7 px-2 text-sm',
} as const;

/**
 * 键帽：靠 1px 描边 + 底部加粗的那一条读「厚度」，不靠投影也不靠渐变。
 * 尺寸用高度和等宽字控住，中文注释里塞一两个键也不会跳行高。
 */
export function Kbd({
  keys,
  children,
  separator = '+',
  size = 'middle',
  className,
  style,
}: KbdProps) {
  const list = keys && keys.length > 0 ? keys : [children];

  return (
    <span className={cn('inline-flex items-center gap-1 align-middle', className)} style={style}>
      {list.map((key, index) => (
        <span key={index} className="inline-flex items-center gap-1">
          {index > 0 && (
            <span aria-hidden className="text-[10px] leading-none text-fg-disabled">
              {separator}
            </span>
          )}
          <kbd
            className={cn(
              'inline-flex items-center justify-center rounded-inner border border-b-2 border-line-strong bg-surface font-mono font-medium text-fg-secondary',
              SIZE[size],
            )}
          >
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}
