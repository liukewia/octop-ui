import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../lib/cn';
import { Tooltip } from './tooltip';

export interface FloatButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'> {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  type?: 'default' | 'primary';
  shape?: 'circle' | 'square';
  tooltip?: React.ReactNode;
  href?: string;
  target?: string;
  badge?: { count?: number; dot?: boolean };
  onClick?: (e: React.MouseEvent) => void;
}

const FloatButtonRoot = ({
  icon,
  description,
  type = 'default',
  shape = 'circle',
  tooltip,
  href,
  target,
  badge,
  className,
  onClick,
  children,
  ...rest
}: FloatButtonProps) => {
  const button = href ? (
    <a
      href={href}
      target={target}
      onClick={onClick}
      className={cn(
        'ax-press ax-focus relative inline-flex items-center justify-center gap-1 rounded-full shadow-med',
        'transition-colors duration-[125ms]',
        shape === 'square' && 'rounded-container',
        description ? 'h-10 px-4' : 'size-10',
        type === 'primary' ? 'bg-accent text-on-accent' : 'border border-line bg-surface text-fg',
        className,
      )}
    >
      {icon ?? children}
      {description && <span className="text-sm">{description}</span>}
      {badge && (badge.count || badge.dot) ? (
        <span className="absolute -end-1 -top-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-2xs font-medium text-white">
          {badge.dot ? '' : badge.count}
        </span>
      ) : null}
    </a>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'ax-press ax-focus relative inline-flex items-center justify-center gap-1 shadow-med',
        'transition-colors duration-[125ms]',
        shape === 'square' ? 'rounded-container' : 'rounded-full',
        description ? 'h-10 px-4' : 'size-10',
        type === 'primary' ? 'bg-accent text-on-accent' : 'border border-line bg-surface text-fg',
        className,
      )}
      {...rest}
    >
      {icon ?? children}
      {description && <span className="text-sm">{description}</span>}
      {badge && (badge.count || badge.dot) ? (
        <span className="absolute -end-1 -top-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-2xs font-medium text-white">
          {badge.dot ? '' : badge.count}
        </span>
      ) : null}
    </button>
  );

  return tooltip ? <Tooltip title={tooltip} placement="left">{button}</Tooltip> : button;
};

export interface FloatButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: 'circle' | 'square';
  open?: boolean;
  trigger?: 'click' | 'hover';
  icon?: React.ReactNode;
  closeIcon?: React.ReactNode;
}

function FloatButtonGroup({ shape = 'circle', open, trigger = 'hover', icon, children, className, ...rest }: FloatButtonGroupProps) {
  const [inner, setInner] = useState(!!open);
  const isOpen = open ?? inner;

  return (
    <div
      className={cn('fixed bottom-6 end-6 z-40 flex flex-col items-end gap-2', className)}
      onMouseEnter={() => trigger === 'hover' && setInner(true)}
      onMouseLeave={() => trigger === 'hover' && setInner(false)}
      {...rest}
    >
      <div
        className={cn(
          'flex flex-col items-end gap-2 transition-[opacity,transform] duration-[165ms] ease-standard',
          isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        )}
      >
        {children}
      </div>
      <FloatButtonRoot
        shape={shape}
        type="primary"
        icon={icon ?? <ArrowUp className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />}
        onClick={() => setInner(!isOpen)}
      />
    </div>
  );
}

function BackTop({
  visibilityHeight = 400,
  target,
  onClick,
  ...rest
}: Omit<FloatButtonProps, 'target'> & { visibilityHeight?: number; target?: () => HTMLElement }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const container = target?.();
      const top = container ? container.scrollTop : window.scrollY;
      setVisible(top > visibilityHeight);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [visibilityHeight, target]);

  if (!visible) return null;

  return (
    <FloatButtonRoot
      className="fixed bottom-6 end-6 z-40"
      icon={<ArrowUp className="size-4" />}
      tooltip="回到顶部"
      onClick={(e) => {
        onClick?.(e);
        const container = target?.();
        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      {...rest}
    />
  );
}

export const FloatButton = Object.assign(FloatButtonRoot, { Group: FloatButtonGroup, BackTop });
