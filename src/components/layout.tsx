import { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '../lib/cn';

/* ------------------------------------------------------------------ Layout */

interface SiderContextValue {
  siderWidth: number;
  collapsed: boolean;
}

const SiderContext = createContext<SiderContextValue>({ siderWidth: 208, collapsed: false });

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  hasSider?: boolean;
}

function LayoutRoot({ hasSider, className, children, ...rest }: LayoutProps) {
  return (
    <div
      className={cn('flex min-h-0 w-full', hasSider ? 'flex-row' : 'flex-col', 'bg-bg', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  height?: number;
}

function Header({ className, height = 56, style, children, ...rest }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md',
        className,
      )}
      style={{ height, ...style }}
      {...rest}
    >
      {children}
    </header>
  );
}

export interface SiderProps extends React.HTMLAttributes<HTMLElement> {
  width?: number;
  collapsedWidth?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  trigger?: React.ReactNode | null;
  theme?: 'light' | 'dark';
}

function Sider({
  width = 208,
  collapsedWidth = 64,
  collapsible,
  collapsed,
  defaultCollapsed,
  onCollapse,
  trigger,
  className,
  style,
  children,
  ...rest
}: SiderProps) {
  const [inner, setInner] = useState(!!defaultCollapsed);
  const isCollapsed = collapsed ?? inner;
  const currentWidth = isCollapsed ? collapsedWidth : width;

  return (
    <SiderContext.Provider value={{ siderWidth: currentWidth, collapsed: isCollapsed }}>
      <aside
        className={cn(
          'relative flex shrink-0 flex-col border-e border-line bg-surface',
          'transition-[width] duration-[300ms] ease-standard',
          className,
        )}
        style={{ width: currentWidth, ...style }}
        data-collapsed={isCollapsed || undefined}
        {...rest}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {collapsible && trigger !== null && (
          <button
            type="button"
            onClick={() => {
              const next = !isCollapsed;
              if (collapsed === undefined) setInner(next);
              onCollapse?.(next);
            }}
            className="ax-press ax-focus absolute -end-3 top-6 grid size-6 place-items-center rounded-full border border-line bg-surface text-fg-tertiary shadow-pop hover:text-fg"
            aria-label={isCollapsed ? '展开侧栏' : '收起侧栏'}
          >
            <span className="text-2xs">{isCollapsed ? '›' : '‹'}</span>
          </button>
        )}
      </aside>
    </SiderContext.Provider>
  );
}

function Content({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <main className={cn('min-w-0 flex-1', className)} {...rest}>
      {children}
    </main>
  );
}

function Footer({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn('shrink-0 px-4 py-4 text-sm text-fg-tertiary', className)} {...rest}>
      {children}
    </footer>
  );
}

export const Layout = Object.assign(LayoutRoot, { Header, Sider, Content, Footer });
export { Header, Sider, Content, Footer };

/** 供页面读取当前侧栏宽度（C 端固定底栏时可以据此避让） */
export function useSider() {
  return useContext(SiderContext);
}

/* -------------------------------------------------------------------- Grid */

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  gutter?: number | [number, number];
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
  align?: 'top' | 'middle' | 'bottom' | 'stretch';
  wrap?: boolean;
}

const JUSTIFY = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-around': 'justify-around',
  'space-between': 'justify-between',
  'space-evenly': 'justify-evenly',
} as const;

const ALIGN = {
  top: 'items-start',
  middle: 'items-center',
  bottom: 'items-end',
  stretch: 'items-stretch',
} as const;

export function Row({ gutter = 0, justify, align, wrap = true, className, style, children, ...rest }: RowProps) {
  const [gx, gy] = Array.isArray(gutter) ? gutter : [gutter, 0];
  return (
    <div
      className={cn('flex', wrap ? 'flex-wrap' : 'flex-nowrap', justify && JUSTIFY[justify], align && ALIGN[align], className)}
      style={{ marginInline: -gx / 2, rowGap: gy, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number;
  offset?: number;
  flex?: number | string;
  order?: number;
  xs?: number | { span?: number; offset?: number };
  sm?: number | { span?: number; offset?: number };
  md?: number | { span?: number; offset?: number };
  lg?: number | { span?: number; offset?: number };
  xl?: number | { span?: number; offset?: number };
  xxl?: number | { span?: number; offset?: number };
}

export function Col({
  span = 24,
  offset = 0,
  flex,
  order,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  className,
  style,
  children,
  ...rest
}: ColProps) {
  const width = useViewportWidth();
  const responsive = { xs, sm, md, lg, xl, xxl } as const;
  let resolvedSpan = span;
  let resolvedOffset = offset;
  (['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[]).forEach((key) => {
    const value = responsive[key];
    if (value === undefined || width < BREAKPOINTS[key]) return;
    resolvedSpan = typeof value === 'number' ? value : (value.span ?? resolvedSpan);
    resolvedOffset = typeof value === 'number' ? resolvedOffset : (value.offset ?? resolvedOffset);
  });

  return (
    <div
      className={cn('min-w-0', className)}
      style={{
        flex: flex ?? `0 0 ${(resolvedSpan / 24) * 100}%`,
        maxWidth: flex ? undefined : `${(resolvedSpan / 24) * 100}%`,
        marginInlineStart: resolvedOffset ? `${(resolvedOffset / 24) * 100}%` : undefined,
        order,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** 24 栏栅格的容器，给不写 gutter 的场景一个等价写法 */
export function Grid({
  columns = 24,
  gap = 0,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { columns?: number; gap?: number | [number, number] }) {
  const [gx, gy] = Array.isArray(gap) ? gap : [gap, gap];
  return (
    <div
      className={cn('grid', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: gx, rowGap: gy }}
      {...rest}
    >
      {children}
    </div>
  );
}
