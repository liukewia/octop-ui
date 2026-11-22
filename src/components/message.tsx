import { useSyncExternalStore, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../lib/cn';
import { TOAST_IN } from '../lib/motion';

type NoticeType = 'success' | 'info' | 'warning' | 'error' | 'loading';

interface NoticeItem {
  id: number;
  type: NoticeType;
  content: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  duration: number;
  key?: string;
  closable?: boolean;
  onClose?: () => void;
  /** 自定义图标：给了就用它，否则按 type 取默认图标 */
  icon?: ReactNode;
}

let items: NoticeItem[] = [];
const listeners = new Set<() => void>();
const timers = new Map<number, number>();
let seq = 0;

function emit() {
  items = [...items];
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return items;
}

function remove(id: number) {
  const item = items.find((it) => it.id === id);
  if (!item) return;
  window.clearTimeout(timers.get(id));
  timers.delete(id);
  items = items.filter((it) => it.id !== id);
  emit();
  item.onClose?.();
}

function push(item: Omit<NoticeItem, 'id'>) {
  if (item.key) {
    const existing = items.find((it) => it.key === item.key);
    if (existing) {
      items = items.map((it) => (it.id === existing.id ? { ...it, ...item, id: existing.id } : it));
      emit();
      return existing.id;
    }
  }
  seq += 1;
  const id = seq;
  items = [...items, { ...item, id }];
  emit();
  if (item.duration > 0) {
    timers.set(
      id,
      window.setTimeout(() => remove(id), item.duration),
    );
  }
  return id;
}

/* ------------------------------------------------------------------ host */

function useNotices() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* 图标 17px：Astryx 的 Toast 里 icon 是 1.7 倍字号（14 × 1.2），
 * 用 lucide 的 17px 盒子能对齐原始卡片的行盒，不把高度顶到 44。 */
function NoticeIcon({ type }: { type: NoticeType }) {
  const className = 'size-[17px] shrink-0';
  if (type === 'loading') return <span className="ax-spinner size-[17px] shrink-0 text-fg-tertiary" />;
  if (type === 'success') return <CheckCircle2 className={cn(className, 'text-success')} />;
  if (type === 'error') return <XCircle className={cn(className, 'text-danger')} />;
  if (type === 'warning') return <AlertTriangle className={cn(className, 'text-warning-ink')} />;
  return <Info className={cn(className, 'text-info')} />;
}

function MessageViewport() {
  const list = useNotices().filter((item) => !item.title && !item.description && !item.actions);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[1000] flex flex-col items-center gap-2 px-4">
      {list.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            // Astryx 原始 Toast：白卡、12 圆角、1px 8% 描边，padding 10/16，
            // 行高 20 → 高度 42。没有配色底、没有图标容器，只有一道极淡的影。
            'pointer-events-auto flex max-w-[min(520px,100%)] items-center gap-2',
            'rounded-container border border-line bg-surface px-4 py-2.5 text-base text-fg shadow-toast',
            TOAST_IN,
          )}
        >
          {item.icon ?? <NoticeIcon type={item.type} />}
          <span className="min-w-0 flex-1">{item.content}</span>
        </div>
      ))}
    </div>
  );
}

function NotificationViewport() {
  const list = useNotices().filter((item) => item.title || item.description || item.actions);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[1000] flex flex-col items-end gap-2 px-4 sm:inset-x-auto sm:end-4 sm:w-[380px] sm:px-0">
      {list.map((item) => (
        <div
          key={item.id}
          role="status"
          className={`pointer-events-auto w-full rounded-container border border-line bg-surface px-6 py-3 shadow-toast ${TOAST_IN}`}
        >
          <div className="flex items-start gap-2.5">
            {item.icon ?? <NoticeIcon type={item.type} />}
            <div className="min-w-0 flex-1">
              {/* 原始卡片标题是 17/24、字重 400 —— 靠字号拉层级，不加粗 */}
              {item.title && <div className="text-lg font-normal text-fg">{item.title}</div>}
              {item.description && (
                <div className="mt-0.5 text-base leading-5 text-fg-secondary">{item.description}</div>
              )}
              {item.content}
              {item.actions && <div className="mt-3 flex items-center justify-end gap-2">{item.actions}</div>}
            </div>
            {item.closable !== false && (
              <button
                type="button"
                aria-label="关闭"
                onClick={() => remove(item.id)}
                className="ax-press -me-2 -mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-inner text-fg-tertiary hover:bg-muted hover:text-fg"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

let hostRoot: Root | null = null;
function ensureHost() {
  if (hostRoot || typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.setAttribute('data-octop-toast-root', '');
  document.body.appendChild(el);
  hostRoot = createRoot(el);
  hostRoot.render(
    <>
      <MessageViewport />
      <NotificationViewport />
    </>,
  );
}

/* --------------------------------------------------------------- message */

export interface MessageConfig {
  content: ReactNode;
  type?: NoticeType;
  duration?: number;
  key?: string;
  onClose?: () => void;
  className?: string;
}

function openMessage(config: MessageConfig | ReactNode, type: NoticeType = 'info', duration = 3) {
  ensureHost();
  const normalized: MessageConfig =
    typeof config === 'object' && config !== null && 'content' in (config as object)
      ? (config as MessageConfig)
      : { content: config as ReactNode };
  return push({
    type: normalized.type ?? type,
    content: normalized.content,
    duration: (normalized.duration ?? duration) * 1000,
    key: normalized.key,
    onClose: normalized.onClose,
  });
}

const messageApi = {
  open: (config: MessageConfig) => openMessage(config, config.type ?? 'info'),
  success: (content: ReactNode, duration?: number) => openMessage(content, 'success', duration),
  info: (content: ReactNode, duration?: number) => openMessage(content, 'info', duration),
  warning: (content: ReactNode, duration?: number) => openMessage(content, 'warning', duration),
  error: (content: ReactNode, duration?: number) => openMessage(content, 'error', duration),
  loading: (content: ReactNode, duration = 0) => openMessage(content, 'loading', duration),
  destroy: (key?: string | number) => {
    if (key === undefined) items.forEach((item) => remove(item.id));
    else items.filter((item) => item.key === key || item.id === key).forEach((item) => remove(item.id));
  },
  useMessage: () => [messageApi, null] as const,
};

export const message = messageApi;

/* ---------------------------------------------------------- notification */

export interface NotificationConfig {
  message?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  type?: NoticeType;
  duration?: number;
  key?: string;
  btn?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  placement?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
}

function openNotification(config: NotificationConfig, type: NoticeType = 'info') {
  ensureHost();
  return push({
    type: config.type ?? type,
    title: config.message ?? config.title,
    description: config.description,
    content: config.content,
    actions: config.actions ?? config.btn,
    duration: (config.duration ?? 4.5) * 1000,
    key: config.key,
    closable: config.closable,
    onClose: config.onClose,
    icon: config.icon,
  });
}

export const notification = {
  open: (config: NotificationConfig) => openNotification(config),
  success: (config: NotificationConfig) => openNotification(config, 'success'),
  info: (config: NotificationConfig) => openNotification(config, 'info'),
  warning: (config: NotificationConfig) => openNotification(config, 'warning'),
  error: (config: NotificationConfig) => openNotification(config, 'error'),
  destroy: (key?: string | number) => {
    if (key === undefined) items.forEach((item) => remove(item.id));
    else items.filter((item) => item.key === key || item.id === key).forEach((item) => remove(item.id));
  },
  useNotification: () => [notification, null] as const,
};

/** 若业务方希望自己挂载，可渲染这个空组件（浮层本身是全局单例） */
export function ToastHost() {
  return null;
}
