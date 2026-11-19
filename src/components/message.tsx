import { useSyncExternalStore, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../lib/cn';

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

function NoticeIcon({ type }: { type: NoticeType }) {
  const className = 'size-4 shrink-0';
  if (type === 'loading') return <span className="ax-spinner size-4 shrink-0 text-fg-tertiary" />;
  if (type === 'success') return <CheckCircle2 className={cn(className, 'text-success')} />;
  if (type === 'error') return <XCircle className={cn(className, 'text-danger')} />;
  if (type === 'warning') return <AlertTriangle className={cn(className, 'text-warning')} />;
  return <Info className={cn(className, 'text-info')} />;
}

function MessageViewport() {
  const list = useNotices().filter((item) => !item.title && !item.description && !item.actions);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex flex-col items-center gap-2 px-4">
      {list.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            'pointer-events-auto flex max-w-[min(520px,100%)] animate-toast-in items-center gap-2',
            'min-h-10 rounded-container border border-line bg-surface px-3.5 py-2 text-base text-fg shadow-med',
          )}
        >
          <NoticeIcon type={item.type} />
          <span className="min-w-0 flex-1">{item.content}</span>
        </div>
      ))}
    </div>
  );
}

function NotificationViewport() {
  const list = useNotices().filter((item) => item.title || item.description || item.actions);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex flex-col items-end gap-2 px-4 sm:inset-x-auto sm:end-4 sm:w-[360px]">
      {list.map((item) => (
        <div
          key={item.id}
          role="status"
          className="pointer-events-auto w-full animate-toast-in rounded-container border border-line bg-surface p-4 shadow-med"
        >
          <div className="flex items-start gap-2.5">
            <NoticeIcon type={item.type} />
            <div className="min-w-0 flex-1">
              {item.title && <div className="text-base font-semibold text-fg">{item.title}</div>}
              {item.description && (
                <div className="mt-1 text-sm leading-relaxed text-fg-secondary">{item.description}</div>
              )}
              {item.content}
              {item.actions && <div className="mt-3 flex items-center justify-end gap-2">{item.actions}</div>}
            </div>
            {item.closable !== false && (
              <button
                type="button"
                aria-label="关闭"
                onClick={() => remove(item.id)}
                className="ax-press -me-1 -mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-inner text-fg-tertiary hover:bg-muted hover:text-fg"
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
