import { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, Tooltip } from '../src';
import { Foundations } from './sections/foundations';
import { General } from './sections/general';
import { LayoutSection } from './sections/layout';
import { DataEntry } from './sections/data-entry';
import { DataDisplay } from './sections/data-display';
import { Feedback } from './sections/feedback';
import { Navigation } from './sections/navigation';
import { Advanced } from './sections/advanced';
import { Scenes } from './scenes';
import { AgentScenes } from './scenes/agent';
import { Moon, Search, Sun } from './icons';

const NAV = [
  { group: '基座', items: [{ id: 'foundations', label: '设计基座', count: 'token' }] },
  {
    group: '组件',
    items: [
      { id: 'general', label: '通用', count: '5' },
      { id: 'layout', label: '布局', count: '4' },
      { id: 'data-entry', label: '数据录入', count: '17' },
      { id: 'data-display', label: '数据展示', count: '18' },
      { id: 'feedback', label: '反馈', count: '10' },
      { id: 'navigation', label: '导航', count: '7' },
      { id: 'advanced', label: '高级', count: '11' },
    ],
  },
];

const ALL_IDS = NAV.flatMap((g) => g.items.map((i) => i.id));

const VIEWS = [
  { id: 'components', label: '组件' },
  { id: 'scenes', label: '场景' },
  { id: 'agent', label: 'Agent' },
] as const;

type ViewId = (typeof VIEWS)[number]['id'];

/** Octop 的标记：一枚八爪鱼触须感的六辐星（沿用参考站的几何语言） */
function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.2v17.6M4.4 7.6l15.2 8.8M19.6 7.6L4.4 16.4"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() =>
    new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light',
  );
  const [view, setView] = useState<ViewId>(() => {
    const v = new URLSearchParams(window.location.search).get('view');
    return v === 'scenes' || v === 'agent' ? v : 'components';
  });
  const [active, setActive] = useState('foundations');
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    if (view !== 'components') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -72% 0px', threshold: 0 },
    );
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [view]);

  const go = (next: ViewId) => {
    setView(next);
    const url = new URL(window.location.href);
    // 每个视图只留自己的参数，避免从场景切到 Agent 后 URL 里挂着上一屏的 scene
    url.searchParams.delete('scene');
    url.searchParams.delete('agent');
    if (next === 'components') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', next);
    }
    url.hash = '';
    window.history.replaceState(null, '', url);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV;
    return NAV.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q) || i.id.includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <ConfigProvider theme={{ mode }} global>
      <div className="min-h-screen bg-bg text-fg">
        <header className="sticky top-0 z-50 grid h-12 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-line bg-bg px-2 max-md:gap-2">
          <a
            className="flex min-w-0 items-center gap-2 px-2 text-sm font-semibold text-fg no-underline sm:text-base"
            href={view === 'components' ? '#foundations' : '#'}
            onClick={(e) => {
              if (view !== 'components') {
                e.preventDefault();
                go('components');
              }
            }}
          >
            <span className="text-accent">
              <Mark />
            </span>
            <span className="truncate whitespace-nowrap sm:hidden">Octop</span>
            <span className="hidden truncate whitespace-nowrap sm:inline">Octop UI</span>
          </a>

          <nav aria-label="视图切换" className="flex items-center gap-0.5 rounded-full bg-canvas p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => go(v.id)}
                data-active={view === v.id}
                aria-current={view === v.id ? 'page' : undefined}
                className="ax-focus inline-flex h-7 items-center rounded-full px-3 text-sm text-fg-secondary transition-[background-color,color,box-shadow] duration-[125ms] ease-standard hover:text-fg data-[active=true]:bg-surface data-[active=true]:font-medium data-[active=true]:text-fg data-[active=true]:shadow-pop"
              >
                {v.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1">
            <Tooltip title={mode === 'dark' ? '切换到浅色' : '切换到深色'}>
              <button
                type="button"
                aria-label={mode === 'dark' ? '切换到浅色' : '切换到深色'}
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                className="ax-press ax-focus inline-flex size-8 items-center justify-center rounded-full text-fg transition-colors duration-[125ms] ease-standard hover:bg-muted"
              >
                {mode === 'dark' ? <Sun /> : <Moon />}
              </button>
            </Tooltip>
            <span className="ml-1 hidden h-8 items-center rounded-full bg-accent px-3 text-base font-medium whitespace-nowrap text-on-accent sm:inline-flex">
              v0.2.1
            </span>
          </div>
        </header>

        {view === 'scenes' ? (
          <Scenes />
        ) : view === 'agent' ? (
          <AgentScenes />
        ) : (
          <div className="flex items-start max-md:block">
            <aside className="sticky top-12 flex h-[calc(100vh-48px)] w-[260px] flex-none flex-col overflow-hidden p-2 max-md:static max-md:h-auto max-md:w-auto max-md:border-b max-md:border-line">
              <label className="flex h-8 items-center gap-1.5 rounded-container border border-line-strong bg-surface px-2 py-1 transition-colors duration-[125ms] ease-standard focus-within:border-fg-tertiary">
                <span className="flex-none text-fg-tertiary">
                  <Search />
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索组件…"
                  aria-label="搜索组件"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-fg outline-0 placeholder:text-fg-disabled"
                />
              </label>

              <nav className="mt-1 flex flex-1 flex-col gap-px overflow-y-auto py-2 max-md:max-h-none max-md:flex-row max-md:flex-wrap max-md:gap-1">
                {filteredNav.map((group) => (
                  <div key={group.group} className="max-md:contents">
                    <div className="px-2 pt-3 pb-1 text-xs font-medium text-fg-tertiary max-md:hidden">
                      {group.group}
                    </div>
                    {group.items.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        data-active={active === item.id}
                        className="flex h-8 items-center gap-2 rounded-container px-2 text-base text-fg no-underline transition-colors duration-[125ms] ease-standard hover:bg-muted-soft data-[active=true]:bg-muted data-[active=true]:font-medium max-md:bg-muted-soft max-md:px-3 max-md:data-[active=true]:bg-muted"
                      >
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        <span className="text-xs text-fg-disabled tabular-nums">{item.count}</span>
                      </a>
                    ))}
                  </div>
                ))}
                {filteredNav.length === 0 ? (
                  <div className="p-2 text-base text-fg-tertiary">没有匹配「{query}」的分区</div>
                ) : null}
              </nav>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-line px-2 pt-2 pb-1">
                <span className="text-xs font-medium text-fg-tertiary">外观</span>
                <span className="text-xs text-fg-tertiary">{mode === 'dark' ? 'Dark' : 'Light'}</span>
              </div>
            </aside>

            <main className="min-w-0 flex-1 px-8 pt-[72px] pb-[140px] max-md:px-5 max-md:pt-8 max-md:pb-20">
              <div className="mx-auto max-w-[912px]">
                <header className="mb-16">
                  <h1 className="m-0 mb-3 text-4xl font-semibold tracking-[-0.01em] text-fg max-md:text-3xl">
                    把熟悉的组件 API，换成 C 端的皮肤
                  </h1>
                  <p className="mb-5 flex flex-wrap items-center gap-2 text-xs text-fg-tertiary">
                    <code className="font-mono text-xs">68 个组件 · 12.9k 行</code>
                    <span>·</span>
                    <code className="font-mono text-xs">Radix + Tailwind v4 + CVA</code>
                    <span>·</span>
                    <span>零运行时主题 / 一根 import</span>
                  </p>
                  <p className="mb-6 max-w-[720px] text-lg text-fg-tertiary">
                    对外是 <strong className="font-medium text-fg">Button type="primary"</strong>、
                    <strong className="font-medium text-fg">Select options</strong>、
                    <strong className="font-medium text-fg">Modal open</strong>{' '}
                    这类熟手写法；对内统一令牌、焦点、按压与浮层动效，换掉 import 就能用。
                  </p>
                  <div className="mb-4 inline-block max-w-full overflow-x-auto rounded-container bg-canvas px-3 py-2 font-mono text-xs leading-[1.67] whitespace-pre text-fg-tertiary">
                    {`import { Button } from '@octop/ui';
import '@octop/ui/style.css';`}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {[
                      { name: 'accent', value: 'var(--ax-accent)' },
                      { name: 'bg', value: 'var(--ax-bg)' },
                      { name: 'surface', value: 'var(--ax-surface)' },
                      { name: 'line', value: 'var(--ax-line-strong)' },
                    ].map((t) => (
                      <span
                        key={t.name}
                        className="inline-flex h-6 items-center gap-1.5 rounded-full bg-canvas px-2.5 text-xs text-fg-tertiary tabular-nums"
                      >
                        <span
                          className="size-2.5 flex-none rounded-[3px] shadow-[inset_0_0_0_1px_var(--ax-line-strong)]"
                          style={{ background: t.value }}
                        />
                        {t.name}
                      </span>
                    ))}
                    <span className="inline-flex h-6 items-center rounded-full bg-canvas px-2.5 text-xs text-fg-tertiary tabular-nums">
                      radius 6 / 10 / 12 / 28
                    </span>
                    <span className="inline-flex h-6 items-center rounded-full bg-canvas px-2.5 text-xs text-fg-tertiary tabular-nums">
                      h 40 / 44 coarse
                    </span>
                    <button
                      type="button"
                      onClick={() => go('scenes')}
                      className="ax-focus inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
                    >
                      六个业务场景 →
                    </button>
                    <button
                      type="button"
                      onClick={() => go('agent')}
                      className="ax-focus inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
                    >
                      五个 Agent 场景 →
                    </button>
                  </div>
                </header>

                <Foundations />
                <General />
                <LayoutSection />
                <DataEntry />
                <DataDisplay />
                <Feedback />
                <Navigation />
                <Advanced />
              </div>
            </main>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}
