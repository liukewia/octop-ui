import { useEffect, useState } from 'react';
import { BarChart3, Inbox, Settings2, ShoppingBag, Smartphone, Sparkles } from 'lucide-react';
import { cn } from '../../src/lib/cn';
import { AssistantScene } from './assistant';
import { CheckoutScene } from './checkout';
import { DashboardScene } from './dashboard';
import { InboxScene } from './inbox';
import { MobileScene } from './mobile';
import { SettingsScene } from './settings';

const SCENES = [
  {
    id: 'dashboard',
    label: '增长看板',
    icon: <BarChart3 className="size-3.5" />,
    desc: 'PC 后台的首页：指标卡、趋势、渠道表挤在一屏里，重点是数字对齐与留白节奏。',
    parts: ['Statistic', 'Segmented', 'Progress', 'Table', 'Tag'],
    render: () => <DashboardScene />,
  },
  {
    id: 'inbox',
    label: '消息中心',
    icon: <Inbox className="size-3.5" />,
    desc: '左列表右详情：未读态、筛选、空状态、回复框，都在同一块画布里切换。',
    parts: ['Input', 'Segmented', 'Badge', 'Avatar', 'Empty', 'TextArea'],
    render: () => <InboxScene />,
  },
  {
    id: 'settings',
    label: '账号设置',
    icon: <Settings2 className="size-3.5" />,
    desc: '表单密度最高的页面：Tab 分栏、开关清单、危险操作确认，任何一个都容易做得吵。',
    parts: ['Tabs', 'Input / Password', 'Select', 'Switch', 'Modal', 'Alert'],
    render: () => <SettingsScene />,
  },
  {
    id: 'checkout',
    label: '下单结算',
    icon: <ShoppingBag className="size-3.5" />,
    desc: 'C 端最不能出错的一屏：步骤、数量增减、优惠抵扣、二次确认，最后落到成功页。',
    parts: ['Steps', 'RadioGroup', 'InputNumber', 'Checkbox', 'Modal', 'Result'],
    render: () => <CheckoutScene />,
  },
  {
    id: 'assistant',
    label: 'AI 助手',
    icon: <Sparkles className="size-3.5" />,
    desc: '流式会话的样子：气泡、引用上标、来源列表、代码块与带停止键的输入框。',
    parts: ['ChatMessage', 'ChatComposer', 'Citation', 'CodeBlock', 'Select'],
    render: () => <AssistantScene />,
  },
  {
    id: 'mobile',
    label: '移动端',
    icon: <Smartphone className="size-3.5" />,
    desc: '390 宽的同一套皮肤：点触发底部抽屉，抓手能下拉，底部操作条始终在拇指区。',
    parts: ['BottomSheet', 'CheckableTag', 'InputNumber', 'Tag', 'Avatar'],
    render: () => <MobileScene />,
  },
];

function readScene() {
  const id = new URLSearchParams(window.location.search).get('scene');
  return SCENES.some((s) => s.id === id) ? (id as string) : SCENES[0].id;
}

export function Scenes() {
  const [active, setActive] = useState(readScene);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('scene', active);
    window.history.replaceState(null, '', url);
  }, [active]);

  const scene = SCENES.find((s) => s.id === active) ?? SCENES[0];

  return (
    <main className="mx-auto w-full max-w-[1080px] px-5 pt-8 pb-24 sm:px-8">
      <header className="mb-5">
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-fg sm:text-3xl">场景示例</h1>
        <p className="m-0 mt-2 max-w-[720px] text-sm leading-relaxed text-fg-secondary sm:text-md">
          查看组件在看板、消息中心、账号设置、结算、助手和移动页面中的用法。
        </p>
      </header>

      <nav aria-label="场景切换" className="-mx-1 mb-4 flex flex-wrap gap-1.5 px-1 pb-1">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            data-active={s.id === active}
            aria-current={s.id === active ? 'page' : undefined}
            className={cn(
              'ax-focus ax-press inline-flex h-9 flex-none items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors duration-[125ms] ease-standard',
              s.id === active
                ? 'border-transparent bg-accent font-medium text-on-accent'
                : 'border-line bg-surface text-fg-secondary hover:border-line-strong hover:text-fg',
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </nav>

      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="m-0 max-w-[680px] text-sm leading-relaxed text-fg-tertiary">{scene.desc}</p>
        <span className="flex flex-wrap items-center gap-1">
          {scene.parts.map((p) => (
            <code key={p} className="rounded-[4px] bg-canvas px-1.5 py-0.5 font-mono text-2xs text-fg-tertiary">
              {p}
            </code>
          ))}
        </span>
      </div>

      <div key={scene.id} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-[225ms] ease-standard">
        {scene.render()}
      </div>
    </main>
  );
}
