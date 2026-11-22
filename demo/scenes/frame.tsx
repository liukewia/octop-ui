import type { ReactNode } from 'react';
import { cn } from '../../src/lib/cn';

/**
 * 场景外框：一圈窗口铬（三枚圆点 + 地址栏），
 * 让 demo 看起来像「一张产品截图」而不是又一段组件陈列。
 */
export function SceneFrame({
  url,
  title,
  children,
  className,
}: {
  url: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-container border border-line bg-surface shadow-pop',
        className,
      )}
    >
      <div className="flex h-10 items-center gap-2 border-b border-line bg-canvas px-3">
        <span className="flex flex-none items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="flex h-6 min-w-0 flex-1 items-center rounded-full bg-surface px-2.5 text-xs text-fg-tertiary">
          <span className="truncate">octop.app/{url}</span>
        </span>
        <span className="hidden flex-none text-xs text-fg-disabled sm:block">{title}</span>
      </div>
      <div className="bg-bg p-3 sm:p-5">{children}</div>
    </div>
  );
}

/** 场景里的小标题：比卡片标题轻一档，不抢戏 */
export function SceneLabel({ children, extra }: { children: ReactNode; extra?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="text-sm font-semibold text-fg">{children}</span>
      {extra ? <span className="text-xs text-fg-tertiary">{extra}</span> : null}
    </div>
  );
}

/** 场景之间统一的浅色面板 */
export function ScenePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-container border border-line bg-surface', className)}>{children}</div>
  );
}
