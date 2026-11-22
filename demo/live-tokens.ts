import { useEffect, useState } from 'react';

export interface LiveTokens {
  /** inner / element / container / page，单位 px */
  radius: number[];
  /** sm / md / lg，单位 px */
  heights: number[];
}

const RADIUS = ['inner', 'element', 'container', 'page'];
const HEIGHTS = ['sm', 'md', 'lg'];

function read(): LiveTokens {
  if (typeof window === 'undefined') return { radius: [6, 10, 12, 28], heights: [32, 40, 48] };
  const style = getComputedStyle(document.documentElement);
  const pick = (prefix: string, keys: string[]) =>
    keys.map((key) => Math.round(parseFloat(style.getPropertyValue(`--ax-${prefix}-${key}`)) || 0));
  return { radius: pick('radius', RADIUS), heights: pick('h', HEIGHTS) };
}

/**
 * 文档里那些「radius 6 / 10 / 12 / 28」原本是写死的；
 * 主题可以改，它们就得跟着令牌走。applyTheme 会广播 octop:theme。
 */
export function useLiveTokens(): LiveTokens {
  const [tokens, setTokens] = useState<LiveTokens>(read);

  useEffect(() => {
    const sync = () => setTokens(read());
    sync();
    window.addEventListener('octop:theme', sync);
    return () => window.removeEventListener('octop:theme', sync);
  }, []);

  return tokens;
}
