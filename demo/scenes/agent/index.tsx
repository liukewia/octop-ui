import { useEffect, useState } from 'react';
import { ClipboardCheck, FlaskConical, GitBranch, ListTree, Network, Settings2 } from 'lucide-react';
import { cn } from '../../../src/lib/cn';
import { AgentApprovalScene } from './approval';
import { AgentBuilderScene } from './builder';
import { AgentEvalsScene } from './evals';
import { AgentRunTraceScene } from './run-trace';
import { AgentTeamScene } from './team';

const AGENT_SCENES = [
  {
    id: 'trace',
    label: '运行轨迹',
    icon: <ListTree className="size-3.5" />,
    desc: '一次任务的完整回放：规划、检索、工具调用、失败重试、等待审批。每一步都能展开入参、输出与日志。',
    parts: ['StatusDot', 'Tabs', 'CodeBlock', 'Alert', 'Segmented'],
    render: () => <AgentRunTraceScene />,
  },
  {
    id: 'approval',
    label: '工具审批',
    icon: <ClipboardCheck className="size-3.5" />,
    desc: '写生产库之前的那一次点头。计划、影响面、回滚脚本摆在一张卡上，确认框只让你确认「我知道了」。',
    parts: ['Drawer', 'Descriptions', 'Collapse', 'Checkbox', 'ChatMessage'],
    render: () => <AgentApprovalScene />,
  },
  {
    id: 'team',
    label: '多 Agent',
    icon: <Network className="size-3.5" />,
    desc: '主控把任务分给三个子 Agent，各自持有预算与工具白名单。点卡片能筛出这条线的交接记录。',
    parts: ['Progress', 'Avatar', 'Popconfirm', 'Tag', 'Segmented'],
    render: () => <AgentTeamScene />,
  },
  {
    id: 'builder',
    label: '编排配置',
    icon: <Settings2 className="size-3.5" />,
    desc: '配一个 Agent：提示、工具、知识库、预算。右边实时算代价，写权限与自动执行同时打开时会亮红。',
    parts: ['Input', 'TextArea', 'Select', 'Slider', 'Switch', 'Modal'],
    render: () => <AgentBuilderScene />,
  },
  {
    id: 'evals',
    label: '评测对比',
    icon: <FlaskConical className="size-3.5" />,
    desc: 'v3 与 v4 的逐条对比。通过率只是结果，标红的那几条回归用例才是要处理的东西。',
    parts: ['Table 展开行', 'Statistic', 'Segmented', 'CodeBlock'],
    render: () => <AgentEvalsScene />,
  },
];

function readScene() {
  const id = new URLSearchParams(window.location.search).get('agent');
  return AGENT_SCENES.some((s) => s.id === id) ? (id as string) : AGENT_SCENES[0].id;
}

export function AgentScenes() {
  const [active, setActive] = useState(readScene);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('agent', active);
    window.history.replaceState(null, '', url);
  }, [active]);

  const scene = AGENT_SCENES.find((s) => s.id === active) ?? AGENT_SCENES[0];

  return (
    <main className="mx-auto w-full max-w-[1080px] px-5 pt-8 pb-24 sm:px-8">
      <header className="mb-5">
        <p className="m-0 flex items-center gap-1.5 text-xs font-medium text-fg-tertiary">
          <GitBranch className="size-3.5" />
          Agent 场景
        </p>
        <h1 className="m-0 mt-1.5 text-2xl font-semibold tracking-[-0.01em] text-fg sm:text-3xl">
          把「不确定的过程」画清楚
        </h1>
        <p className="m-0 mt-2 max-w-[720px] text-sm leading-relaxed text-fg-secondary sm:text-md">
          Agent 产品的难点从来不是聊天气泡，而是它现在在干什么、为什么停下、要你确认什么、花了多少钱。
          下面五屏都在回答这四个问题。
        </p>
      </header>

      <nav aria-label="Agent 场景切换" className="-mx-1 mb-4 flex flex-wrap gap-1.5 px-1 pb-1">
        {AGENT_SCENES.map((s) => (
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
