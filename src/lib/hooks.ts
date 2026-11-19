import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * 受控 / 非受控双模。
 * - 传了 value 就是受控：只能由 onChange 回去改，内部不落状态；
 * - 传了 defaultValue 就是非受控：内部状态，onChange 同时更新；
 * - 两者都传：受控优先，但 defaultValue 仍然作为首帧兜底（antd 的行为）。
 */
export function useControllableState<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}) {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<T>(defaultValue);
  const current = isControlled ? (value as T) : inner;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInner(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, setValue, isControlled] as const;
}

/** 合并多个 ref */
export function useComposedRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

/** 测量元素尺寸，用于 Tabs 墨条 / Segmented 滑块这类「指示器」 */
export function useMeasure<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState<{ width: number; left: number; height: number }>({
    width: 0,
    left: 0,
    height: 0,
  });

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next = el.getBoundingClientRect();
      setRect((prev) =>
        prev.width === next.width && prev.left === next.left && prev.height === next.height
          ? prev
          : { width: next.width, left: next.left, height: next.height },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [ref, rect] as const;
}

/** 响应式断点（C 端 Modal 在窄屏变底部抽屉用） */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 640px)');

/** 焦点还原：弹层关闭后把焦点还给触发器（Radix 也会做，这里给自研浮层用） */
export function useRestoreFocus(active: boolean) {
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (active) {
      previous.current = document.activeElement as HTMLElement | null;
      return;
    }
    previous.current?.focus?.({ preventScroll: true });
  }, [active]);
}
