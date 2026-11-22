import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Ban,
  Bot,
  Check,
  ChevronRight,
  Coins,
  Gauge,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-react';
import { Avatar, Button, Popconfirm, Progress, Segmented, StatusDot, Tag, message } from '../../../src';
import { cn } from '../../../src/lib/cn';
import { SceneFrame, SceneLabel, ScenePanel } from '../frame';

type AgentState = 'running' | 'paused' | 'wait' | 'done';

type Agent = {
  id: string;
  name: string;
  role: string;
  model: string;
  task: string;
  state: AgentState;
  percent: number;
  tokens: number;
  tools: number;
  tint: string;
  icon: typeof Bot;
};

const AGENTS: Agent[] = [
  {
    id: 'lead',
    name: 'Planner',
    role: '主控',
    model: 'octop-4.1',
    task: '拆解任务、分派子 Agent、汇总结果',
    state: 'done',
    percent: 100,
    tokens: 18400,
    tools: 3,
    tint: 'var(--ax-accent)',
    icon: Sparkles,
  },
  {
    id: 'research',
    name: 'Researcher',
    role: '检索',
    model: 'octop-4.1 mini',
    task: '在 3 个仓库里定位旧结算逻辑',
    state: 'running',
    percent: 72,
    tokens: 52600,
    tools: 5,
    tint: 'var(--ax-info)',
    icon: Search,
  },
  {
    id: 'builder',
    name: 'Builder',
    role: '改写',
    model: 'octop-4.1',
    task: '重写 price.ts 与 12 个调用点',
    state: 'running',
    percent: 48,
    tokens: 41200,
    tools: 6,
    tint: 'var(--ax-success)',
    icon: Wrench,
  },
  {
    id: 'review',
    name: 'Reviewer',
    role: '校验',
    model: 'octop-4.1 mini',
    task: '快照测试 + 可访问性检查，等 Builder 交付',
    state: 'wait',
    percent: 0,
    tokens: 0,
    tools: 4,
    tint: 'var(--ax-hue-purple-fg)',
    icon: ShieldCheck,
  },
];

type Event = {
  id: string;
  from: string;
  to?: string;
  kind: 'handoff' | 'tool' | 'note';
  time: string;
  text: string;
  artifact?: string;
};

const EVENTS: Event[] = [
  {
    id: 'e1',
    from: 'lead',
    to: 'research',
    kind: 'handoff',
    time: '10:02',
    text: '先确认旧逻辑散在哪些仓库，重点看优惠券叠算和四舍五入。',
  },
  {
    id: 'e2',
    from: 'research',
    kind: 'note',
    time: '10:06',
    text: '命中 3 个仓库、18 个文件；coupon.ts 有 v1 / v2 两套实现，v1 仍在 7 处被调用。',
    artifact: 'report/research.md',
  },
  {
    id: 'e3',
    from: 'lead',
    to: 'builder',
    kind: 'handoff',
    time: '10:07',
    text: '以 v2 为准，把 v1 的 7 个调用点收口到新接口，保留旧签名做一层适配。',
  },
  {
    id: 'e4',
    from: 'builder',
    kind: 'tool',
    time: '10:11',
    text: 'fs.patch 写入第 8 个文件（共 12 个），类型检查已跑过 3 次。',
    artifact: 'diff/price.ts',
  },
  {
    id: 'e5',
    from: 'review',
    kind: 'note',
    time: '10:12',
    text: '已生成 42 个快照的基线，等 Builder 全量交付后一次性比对。',
  },
  {
    id: 'e6',
    from: 'lead',
    kind: 'note',
    time: '10:13',
    text: '预算已用 62%，超过 80% 我会先停下来汇报，不会自己加钱。',
  },
];

export function AgentTeamScene() {
  const [paused, setPaused] = useState<string[]>([]);
  const [selected, setSelected] = useState('all');
  const [stopped, setStopped] = useState(false);

  const stateOf = (a: Agent): AgentState =>
    stopped ? 'wait' : paused.includes(a.id) && a.state === 'running' ? 'paused' : a.state;

  const agents = AGENTS.map((a) => ({ ...a, state: stateOf(a) }));
  const list = useMemo(() => EVENTS.filter((e) => selected === 'all' || e.from === selected), [selected]);
  const total = Math.round(agents.reduce((sum, a) => sum + a.percent, 0) / agents.length);
  const tokens = agents.reduce((sum, a) => sum + a.tokens, 0);
  const budget = 160000;
  const used = Math.round((tokens / budget) * 100);

  const toggle = (id: string) => {
    setPaused((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  };

  const stopAll = () => {
    setStopped(true);
    message.warning('已终止全部子 Agent，未写入的改动会回滚');
  };

  const stateText: Record<AgentState, { text: string; status: 'success' | 'processing' | 'warning' | 'default' }> = {
    running: { text: '执行中', status: 'processing' },
    paused: { text: '已暂停', status: 'warning' },
    wait: { text: stopped ? '已终止' : '排队中', status: 'default' },
    done: { text: '已交付', status: 'success' },
  };

  return (
    <SceneFrame url="agent/teams/settle-refactor" title="多 Agent 协作">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-base font-semibold text-fg">重构结算页 · 4 个 Agent 并行</h3>
            <Tag color="green">运行中</Tag>
          </div>
          <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-tertiary">
            <span>主控 Planner 分派，子 Agent 各自持有上下文</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{tokens.toLocaleString()} / {budget.toLocaleString()} tokens</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">¥{(tokens / 1000 * 0.012).toFixed(2)}</span>
          </p>
        </div>
        <div className="flex flex-none flex-wrap items-center gap-2">
          <Button
            size="small"
            icon={paused.length ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            onClick={() => {
              if (stopped) return;
              setPaused(paused.length ? [] : AGENTS.filter((a) => a.state === 'running').map((a) => a.id));
            }}
            disabled={stopped}
          >
            {paused.length ? '全部继续' : '全部暂停'}
          </Button>
          <Popconfirm
            title="终止整轮任务？"
            description="已经写入的 8 个文件会回滚，已消耗的 token 不退。"
            okText="终止"
            cancelText="再想想"
            onConfirm={stopAll}
            disabled={stopped}
          >
            <Button size="small" danger icon={<Ban className="size-3.5" />} disabled={stopped}>
              终止
            </Button>
          </Popconfirm>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_262px]">
        <div className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-2">
            {agents.map((a) => {
              const Icon = a.icon;
              const st = stateText[a.state];
              const active = selected === a.id;
              return (
                <div
                  key={a.id}
                  className={cn(
                    'flex flex-col rounded-container border bg-surface transition-shadow duration-[125ms] ease-standard',
                    active ? 'border-fg-tertiary shadow-pop' : 'border-line hover:border-line-strong',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(active ? 'all' : a.id)}
                    className="ax-focus flex flex-1 flex-col gap-2 rounded-t-container p-3 text-start"
                  >
                    <span className="flex w-full items-start gap-2">
                      <Avatar size={30} shape="square" className="flex-none" style={{ background: a.tint, color: '#fff' }}>
                        <Icon className="size-4" />
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-medium text-fg">{a.name}</span>
                          <Tag color="gray">{a.role}</Tag>
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-fg-disabled">{a.model}</span>
                      </span>
                      <StatusDot size="small" status={st.status} text={st.text} pulse={a.state === 'running'} />
                    </span>
                    <span className="line-clamp-2 min-h-[32px] text-xs leading-relaxed text-fg-secondary">{a.task}</span>
                    <span className="flex items-center gap-2">
                      <Progress percent={a.percent} size="small" showInfo={false} className="min-w-0 flex-1" />
                      <span className="w-8 flex-none text-end text-2xs text-fg-tertiary tabular-nums">{a.percent}%</span>
                    </span>
                  </button>
                  <div className="flex items-center justify-between gap-2 border-t border-line-soft px-3 py-1.5 text-[10px] text-fg-disabled tabular-nums">
                    <span className="flex items-center gap-2">
                      <span>{a.tokens ? `${(a.tokens / 1000).toFixed(1)}k tok` : '—'}</span>
                      <span className="flex items-center gap-0.5">
                        <Wrench className="size-2.5" />
                        {a.tools}
                      </span>
                    </span>
                    {a.state === 'running' || a.state === 'paused' ? (
                      <button
                        type="button"
                        onClick={() => toggle(a.id)}
                        aria-label={a.state === 'paused' ? `继续 ${a.name}` : `暂停 ${a.name}`}
                        className="ax-focus inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] text-fg-tertiary hover:bg-muted hover:text-fg"
                      >
                        {a.state === 'paused' ? <Play className="size-2.5" /> : <Pause className="size-2.5" />}
                        {a.state === 'paused' ? '继续' : '暂停'}
                      </button>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <ChevronRight className="size-2.5" />
                        详情
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3">
            <SceneLabel extra={selected === 'all' ? '6 条' : `${list.length} 条`}>
              {selected === 'all' ? '协作记录' : `${AGENTS.find((a) => a.id === selected)?.name} 的记录`}
            </SceneLabel>
            <ScenePanel className="divide-y divide-line-soft">
              {list.length === 0 ? (
                <div className="p-4 text-center text-xs text-fg-tertiary">这个 Agent 还没有发言</div>
              ) : (
                list.map((e) => {
                  const from = AGENTS.find((a) => a.id === e.from)!;
                  const to = e.to ? AGENTS.find((a) => a.id === e.to) : undefined;
                  const FromIcon = from.icon;
                  return (
                    <div key={e.id} className="flex gap-2.5 px-3 py-2.5">
                      <span className="w-9 flex-none pt-0.5 text-[10px] text-fg-disabled tabular-nums">{e.time}</span>
                      <span className="mt-0.5 flex-none">
                        <Avatar size={20} shape="square" style={{ background: from.tint, color: '#fff' }}>
                          <FromIcon className="size-3" />
                        </Avatar>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="font-medium text-fg">{from.name}</span>
                          {to ? (
                            <>
                              <ArrowRight className="size-3 text-fg-disabled" />
                              <span className="text-fg-secondary">{to.name}</span>
                            </>
                          ) : null}
                          <span className="rounded-[4px] bg-canvas px-1 py-px text-[10px] text-fg-tertiary">
                            {e.kind === 'handoff' ? '交接' : e.kind === 'tool' ? '工具调用' : '记录'}
                          </span>
                        </div>
                        <p className="m-0 mt-0.5 text-xs leading-relaxed text-fg-secondary">{e.text}</p>
                        {e.artifact ? (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-[4px] bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-fg-tertiary">
                            {e.artifact}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </ScenePanel>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <ScenePanel className="p-3">
            <SceneLabel extra={`${total}%`}>整轮进度</SceneLabel>
            <Progress percent={total} size="small" showInfo={false} />
            <dl className="m-0 mt-3 grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs">
              <div className="min-w-0">
                <dt className="m-0 flex items-center gap-1 text-[10px] text-fg-tertiary">
                  <Bot className="size-3" />
                  活跃
                </dt>
                <dd className="m-0 mt-0.5 font-medium text-fg tabular-nums">
                  {agents.filter((a) => a.state === 'running').length} / {agents.length}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="m-0 flex items-center gap-1 text-[10px] text-fg-tertiary">
                  <Gauge className="size-3" />
                  预算
                </dt>
                <dd className="m-0 mt-0.5 font-medium text-fg tabular-nums">{used}%</dd>
              </div>
              <div className="min-w-0">
                <dt className="m-0 flex items-center gap-1 text-[10px] text-fg-tertiary">
                  <Coins className="size-3" />
                  已花
                </dt>
                <dd className="m-0 mt-0.5 font-medium text-fg tabular-nums">¥{(tokens / 1000 * 0.012).toFixed(2)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="m-0 flex items-center gap-1 text-[10px] text-fg-tertiary">
                  <Check className="size-3" />
                  写入
                </dt>
                <dd className="m-0 mt-0.5 font-medium text-fg tabular-nums">8 文件</dd>
              </div>
            </dl>
            <Progress percent={used} size="small" showInfo={false} className="mt-3" status={used > 80 ? 'exception' : 'normal'} />
            <p className="m-0 mt-1 text-[10px] text-fg-disabled">预算超过 80% 会自动降级到 mini 模型</p>
          </ScenePanel>

          <Alertish />

          <div className="rounded-container bg-canvas p-3 text-[11px] leading-relaxed text-fg-tertiary">
            <span className="mb-1 flex items-center gap-1 font-medium text-fg-secondary">
              <UserRound className="size-3" />
              人和 Agent 的分工
            </span>
            主控只做分派和汇总，不直接写文件；子 Agent 各自有工具白名单与预算。你随时可以暂停单条线，不会打断其他线。
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}

/** 右侧那张「需要人」的小卡：不抢主内容，但一眼能看到 */
function Alertish() {
  const [acked, setAcked] = useState(false);
  return (
    <div className="rounded-container border border-line bg-surface p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 grid size-6 flex-none place-items-center rounded-element bg-canvas text-warning-ink">
          <ShieldCheck className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-fg">Reviewer 需要一次确认</div>
          <p className="m-0 mt-0.5 text-[11px] leading-relaxed text-fg-tertiary">
            快照里有 3 处数字格式变化，属于预期内，需要你点一下才继续。
          </p>
          <Segmented
            size="small"
            shape="round"
            className="mt-2"
            options={[
              { label: '确认预期', value: 'ok' },
              { label: '这是回归', value: 'bug' },
            ]}
            value={acked ? 'ok' : undefined}
            onChange={() => {
              setAcked(true);
              message.success('已确认，Reviewer 继续');
            }}
          />
        </div>
      </div>
    </div>
  );
}
