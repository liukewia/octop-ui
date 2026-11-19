import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

export interface AnchorItem {
  key: string;
  href: string;
  title: React.ReactNode;
  children?: AnchorItem[];
}

export interface AnchorProps {
  items?: AnchorItem[];
  affix?: boolean;
  offsetTop?: number;
  targetOffset?: number;
  bounds?: number;
  onChange?: (currentLink: string) => void;
  onClick?: (e: React.MouseEvent, link: { href: string; title: React.ReactNode }) => void;
  getCurrentAnchor?: () => string;
  className?: string;
  style?: React.CSSProperties;
  direction?: 'vertical' | 'horizontal';
  /** 相对滚动容器；默认 window */
  getContainer?: () => HTMLElement | Window;
}

function flatten(items: AnchorItem[] = []): AnchorItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children ?? [])]);
}

export function Anchor({
  items = [],
  offsetTop = 0,
  targetOffset = 0,
  onChange,
  onClick,
  className,
  style,
  direction = 'vertical',
  getContainer,
}: AnchorProps) {
  const links = flatten(items);
  const [active, setActive] = useState(links[0]?.href ?? '');

  useEffect(() => {
    const container = getContainer?.();
    const scroller: HTMLElement | Window = container ?? window;
    const readScroll = () =>
      container instanceof HTMLElement
        ? container.scrollTop
        : window.scrollY || document.documentElement.scrollTop;

    const onScroll = () => {
      let current = links[0]?.href ?? '';
      links.forEach((link) => {
        const el = document.querySelector<HTMLElement>(link.href);
        if (!el) return;
        const top = el.getBoundingClientRect().top + readScroll() - offsetTop - 8;
        if (readScroll() >= top) current = link.href;
      });
      setActive(current);
      onChange?.(current);
    };

    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [links.map((l) => l.href).join(','), offsetTop]); // eslint-disable-line react-hooks/exhaustive-deps

  const jump = (e: React.MouseEvent, link: AnchorItem) => {
    e.preventDefault();
    const el = document.querySelector<HTMLElement>(link.href);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - targetOffset - offsetTop;
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', link.href);
    }
    onClick?.(e, { href: link.href, title: link.title });
  };

  const renderLink = (link: AnchorItem, level = 0) => (
    <li key={link.key} className="relative">
      <a
        href={link.href}
        onClick={(e) => jump(e, link)}
        className={cn(
          'ax-focus block truncate rounded-inner py-1.5 text-sm transition-colors',
          direction === 'vertical' ? 'ps-3' : 'px-2',
          level > 0 && 'ps-6 text-[13px]',
          active === link.href ? 'font-medium text-fg' : 'text-fg-tertiary hover:text-fg',
        )}
      >
        {direction === 'vertical' && active === link.href && (
          <span className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-accent" aria-hidden />
        )}
        {link.title}
      </a>
      {link.children && link.children.length > 0 && (
        <ul className="m-0 list-none p-0">{link.children.map((child) => renderLink(child, level + 1))}</ul>
      )}
    </li>
  );

  return (
    <nav
      aria-label="页内导航"
      className={cn(
        direction === 'vertical' ? 'sticky top-16 border-s border-line' : 'flex items-center gap-1 overflow-x-auto',
        className,
      )}
      style={style}
    >
      <ul className={cn('m-0 list-none p-0', direction === 'horizontal' && 'flex items-center')}>
        {items.map((item) => renderLink(item))}
      </ul>
    </nav>
  );
}
