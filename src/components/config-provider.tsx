import { useEffect, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ConfigProviderTheme {
  /** 'light' | 'dark'：切换 :root/.dark 上的整套令牌 */
  mode?: 'light' | 'dark';
  /** 直接覆写任意 --ax-* 令牌，例如 { '--ax-accent': '#0064e0' } */
  token?: Record<string, string>;
}

export interface ConfigProviderProps {
  theme?: ConfigProviderTheme;
  /** 与 antd 保持同名；这里只用于文案方向 */
  direction?: 'ltr' | 'rtl';
  componentSize?: 'small' | 'middle' | 'large';
  locale?: unknown;
  children?: ReactNode;
  className?: string;
  /** 把主题类写到 <html> 而不是包裹 div（弹层在 body 上也生效） */
  global?: boolean;
}

export function ConfigProvider({
  theme,
  direction = 'ltr',
  componentSize,
  children,
  className,
  global = true,
}: ConfigProviderProps) {
  const mode = theme?.mode;

  useEffect(() => {
    if (!global) return;
    const root = document.documentElement;
    if (mode) {
      root.classList.toggle('dark', mode === 'dark');
      root.dataset.theme = mode;
      root.style.colorScheme = mode;
    }
    if (direction) root.dir = direction;
    Object.entries(theme?.token ?? {}).forEach(([key, value]) => root.style.setProperty(key, value));
    return () => {
      Object.keys(theme?.token ?? {}).forEach((key) => root.style.removeProperty(key));
    };
  }, [mode, direction, global, theme?.token]);

  return (
    <div
      className={cn('min-h-0', className)}
      dir={direction}
      data-size={componentSize}
      data-theme={mode}
    >
      {children}
    </div>
  );
}
