import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BrainCircuit,
  Check,
  ChevronRight,
  FileCode2,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react';
import {
  Alert,
  Button,
  CodeBlock,
  Empty,
  Segmented,
  StatusDot,
  Tabs,
  Tag,
  message,
} from '../../../src';
import { cn } from '../../../src/lib/cn';
import { SceneFrame } from '../frame';

type StepStatus = 'done' | 'running' | 'wait' | 'blocked' | 'error';
type StepKind = 'plan' | 'recall' | 'tool' | 'answer';

type Step = {
  id: string;
  kind: StepKind;
  title: string;
  subtitle: string;
  status: StepStatus;
  ms: number;
  tokens: number;
  tool?: string;
  attempts?: number;
  input?: string;
  output?: string;
  log?: string;
};

const KIND_META: Record<StepKind, { label: string; icon: typeof Wrench }> = {
  plan: { label: '规划', icon: BrainCircuit },
  recall: { label: '检索', icon: Search },
  tool: { label: '工具', icon: Wrench },
  answer: { label: '输出', icon: Sparkles },
};

const STATUS_META: Record<StepStatus, { text: string; status: 'success' | 'processing' | 'warning' | 'error' | 'default' }> = {
  done: { text: '完成', status: 'success' },
  running: { text: '执行中', status: 'processing' },
  wait: { text: '未开始', status: 'default' },
  blocked: { text: '等待审批', status: 'warning' },
  error: { text: '已重试', status: 'error' },
};

const INITIAL: Step[] = [
  {
    id: 's1',
    kind: 'plan',
    title: '拆解任务',
    subtitle: '给 Table 加左右列固定，保持现有 API 不变',
    status: 'done',
    ms: 1840,
    tokens: 620,
    input: `{
  "task": "Table 支持 fixed 列",
  "constraints": ["不改 ColumnType", "兼容 sticky 表头", "窄屏不横向抖"],
  "subtasks": ["定位宽度计算", "抽 sticky 偏移", "补演示与文档"]
}`,
    output: '已拆成 3 个子任务，先定位表格宽度计算的位置。',
    log: '09:12:04 plan.created  subtasks=3\n09:12:05 plan.accepted  model=octop-4.1',
  },
  {
    id: 's2',
    kind: 'recall',
    title: '检索组件实现',
    subtitle: '命中 6 个文件，table.tsx 相关度 0.91',
    status: 'done',
    ms: 920,
    tokens: 1120,
    tool: 'code.search',
    input: `{ "query": "table colgroup width sticky offset", "path": "src/components" }`,
    output: `src/components/table.tsx       0.91
src/lib/field.ts                0.42
demo/sections/data-display.tsx  0.38`,
    log: '09:12:06 index.query  chunks=1,284  took=310ms\n09:12:07 index.rank   top=table.tsx',
  },
  {
    id: 's3',
    kind: 'tool',
    title: '读取 table.tsx',
    subtitle: '324 行，读到列宽与 sticky 表头两段',
    status: 'done',
    ms: 380,
    tokens: 2460,
    tool: 'fs.read',
    input: `{ "path": "src/components/table.tsx", "range": [1, 324] }`,
    output: `export interface ColumnType<T> {
  width?: number | string;
  fixed?: 'left' | 'right';
  …
}`,
    log: '09:12:07 fs.read  bytes=9,412\n09:12:07 fs.read  done',
  },
  {
    id: 's4',
    kind: 'tool',
    title: '跑类型检查',
    subtitle: '第一次失败 TS2322，第二次通过',
    status: 'error',
    ms: 12400,
    tokens: 840,
    tool: 'shell.exec',
    attempts: 2,
    input: `{ "cmd": "npm run typecheck", "cwd": "." }`,
    output: `src/components/table.tsx:284:7 - error TS2322:
  Type 'string | number' is not assignable to type 'number'.

Found 1 error in 1 file.`,
    log: '09:12:09 exec.start  pid=40218\n09:12:18 exec.exit   code=2  dur=9.1s\n09:12:19 retry      n=2 reason=TS2322\n09:12:30 exec.exit   code=0  dur=3.3s',
  },
  {
    id: 's5',
    kind: 'tool',
    title: '改写列宽计算',
    subtitle: '要写 3 个文件，按策略需要人工确认',
    status: 'blocked',
    ms: 0,
    tokens: 0,
    tool: 'fs.patch',
    input: `{
  "files": [
    "src/components/table.tsx",
    "src/lib/field.ts",
    "demo/sections/data-display.tsx"
  ],
  "diff": "+  const offset = stickyOffset(columns, index);"
}`,
    output: '等待审批：写操作命中 3 个文件，超过自动执行阈值（1 个）。',
    log: '09:12:31 policy.check  rule=write.auto  files=3 > 1\n09:12:31 run.paused    reason=approval_required',
  },
  {
    id: 's6',
    kind: 'tool',
    title: '复跑测试与类型检查',
    subtitle: '通过后才会汇总结果',
    status: 'wait',
    ms: 0,
    tokens: 0,
    tool: 'shell.exec',
    input: `{ "cmd": "npm run typecheck && npm test", "cwd": "." }`,
    output: `> tsc --noEmit
> vitest run tests/table.spec.ts

✓ 48 passed (48)
  9 skipped
Duration 4.62s`,
    log: '09:12:31 exec.start  pid=40302\n09:12:35 exec.exit   code=0  dur=4.8s',
  },
  {
    id: 's7',
    kind: 'answer',
    title: '汇总改动',
    subtitle: '生成 diff 说明与迁移提示',
    status: 'wait',
    ms: 0,
    tokens: 0,
    input: `{ "changed": 3, "added": 58, "removed": 12, "tests": "48 passed" }`,
    output: `改动说明
  1. table.tsx   列宽改为按内容测量，fixed 列用 sticky offset
  2. field.ts    fieldShell 增加 fixed 变体
  3. data-display.tsx  补一个宽表示例

迁移提示
  ColumnType.fixed 未变，无需改调用方。`,
    log: '09:12:36 summarize  parts=3  tokens=940',
  },
];

const FILTERS = [
  { label: '全部步骤', value: 'all' },
  { label: '只看工具', value: 'tool' },
];

export function AgentRunTraceScene() {
  const [steps, setSteps] = useState<Step[]>(INITIAL);
  const [selected, setSelected] = useState('s5');
  const [filter, setFilter] = useState('all');
  const [paused, setPaused] = useState(true);
  const timers = useRef<number[]>([]);
  const stage = useRef(0);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const patch = (id: string, next: Partial<Step>) =>
    setSteps((list) => list.map((s) => (s.id === id ? { ...s, ...next } : s)));

  const resume = () => {
    if (!paused) {
      // 暂停只是把还在排队的定时器清掉，当前步骤保持「执行中」，
      // 再点继续时从这一步的收尾接着排。
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      setPaused(true);
      return;
    }
    setPaused(false);
    const schedule = (from: number) => {
      if (from < 1) {
        patch('s5', { status: 'running', subtitle: '正在写入 3 个文件…' });
        setSelected('s5');
        timers.current.push(
          window.setTimeout(() => {
            patch('s5', { status: 'done', ms: 1240, tokens: 1680, subtitle: '3 个文件 +58 −12' });
            patch('s6', { status: 'running', subtitle: 'npm run typecheck && npm test' });
            setSelected('s6');
            stage.current = 1;
            schedule(1);
          }, 1100),
        );
        return;
      }
      if (from < 2) {
        patch('s6', { status: 'running', subtitle: 'npm run typecheck && npm test' });
        timers.current.push(
          window.setTimeout(() => {
            patch('s6', { status: 'done', ms: 4800, tokens: 520, subtitle: 'typecheck 通过，48 个用例全绿' });
            patch('s7', { status: 'running', subtitle: '正在生成变更说明…' });
            setSelected('s7');
            stage.current = 2;
            schedule(2);
          }, 1200),
        );
        return;
      }
      if (from < 3) {
        timers.current.push(
          window.setTimeout(() => {
            patch('s7', { status: 'done', ms: 760, tokens: 940, subtitle: '已生成 1 条 migration 提示' });
            stage.current = 3;
            message.success('任务已完成，共 7 步');
          }, 1000),
        );
      }
    };
    schedule(stage.current);
  };

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    stage.current = 0;
    setSteps(INITIAL);
    setSelected('s5');
    setPaused(true);
  };

  const visible = useMemo(
    () => (filter === 'tool' ? steps.filter((s) => s.kind === 'tool') : steps),
    [filter, steps],
  );
  const current = steps.find((s) => s.id === selected) ?? steps[0];
  // error 是「失败后已重试成功」的终态，算完成；否则计数永远停在 n−1
  const settled = (s: Step) => s.status === 'done' || s.status === 'error';
  const done = steps.filter(settled);
  const totalMs = done.reduce((sum, s) => sum + s.ms, 0);
  const totalTokens = done.reduce((sum, s) => sum + s.tokens, 0);
  const allDone = steps.every(settled);
  const KindIcon = KIND_META[current.kind].icon;

  return (
    <SceneFrame url="agent/runs/8f2a" title="运行轨迹">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-base font-semibold text-fg">给 Table 加列固定</h3>
            <Tag color="gray">#8f2a</Tag>
            <Tag color="purple">octop-4.1</Tag>
          </div>
          <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-tertiary">
            <span>分支 feat/table-fixed</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{(totalMs / 1000).toFixed(1)}s</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{totalTokens.toLocaleString()} tokens</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">¥{(totalTokens / 1000 * 0.012).toFixed(3)}</span>
          </p>
        </div>
        <div className="flex flex-none items-center gap-2">
          <StatusDot
            status={allDone ? 'success' : paused ? 'warning' : 'processing'}
            text={allDone ? '已完成' : paused ? '已暂停' : '执行中'}
          />
          <Button
            size="small"
            type={paused && !allDone ? 'primary' : 'default'}
            icon={paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            disabled={allDone}
            onClick={resume}
          >
            {allDone ? '已结束' : paused ? '继续执行' : '暂停'}
          </Button>
          <Button size="small" icon={<RotateCcw className="size-3.5" />} onClick={reset} aria-label="重跑" />
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="rounded-container border border-line bg-surface">
          <div className="flex items-center justify-between gap-2 border-b border-line px-2.5 py-2">
            <Segmented size="small" shape="round" options={FILTERS} value={filter} onChange={(v) => setFilter(v as string)} />
            <span className="text-2xs text-fg-tertiary tabular-nums">
              {done.length}/{steps.length}
            </span>
          </div>
          <div className="flex flex-col gap-px p-1.5">
            {visible.map((step, i) => {
              const meta = KIND_META[step.kind];
              const Icon = meta.icon;
              const active = step.id === selected;
              const status = STATUS_META[step.status];
              const last = i === visible.length - 1;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setSelected(step.id)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'ax-focus group relative flex items-start gap-2.5 rounded-container px-2 py-2 text-start transition-colors duration-[125ms] ease-standard',
                    active ? 'bg-muted' : 'hover:bg-muted-soft',
                  )}
                >
                  <span className="relative flex flex-none flex-col items-center self-stretch pt-0.5">
                    <span
                      className={cn(
                        'grid size-6 place-items-center rounded-element border',
                        step.status === 'done' && 'border-transparent bg-accent text-on-accent',
                        step.status === 'error' && 'border-transparent bg-canvas text-warning-ink',
                        step.status === 'blocked' && 'border-transparent bg-canvas text-warning-ink',
                        (step.status === 'running' || step.status === 'wait') && 'border-line bg-surface text-fg-tertiary',
                      )}
                    >
                      {step.status === 'done' ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                    </span>
                    {!last && <span aria-hidden className="mt-1 w-px flex-1 bg-line-strong" />}
                  </span>
                  <span className="min-w-0 flex-1 pb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-medium text-fg">{step.title}</span>
                      {step.tool ? (
                        <code className="flex-none rounded-[4px] bg-canvas px-1 py-px font-mono text-[10px] text-fg-tertiary">
                          {step.tool}
                        </code>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-2xs text-fg-tertiary">{step.subtitle}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[10px] text-fg-disabled tabular-nums">
                      <StatusDot size="small" status={status.status} text={status.text} pulse={step.status === 'running'} />
                      {step.ms > 0 ? <span>· {(step.ms / 1000).toFixed(1)}s</span> : null}
                      {step.tokens > 0 ? <span>· {step.tokens} tok</span> : null}
                      {step.attempts ? <span className="text-warning-ink">· 重试 {step.attempts} 次</span> : null}
                    </span>
                  </span>
                  <ChevronRight
                    className={cn(
                      'mt-1 size-3.5 flex-none text-fg-disabled transition-opacity',
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 flex-col self-start rounded-container border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-7 flex-none place-items-center rounded-element bg-canvas text-fg-secondary">
                <KindIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-fg">{current.title}</div>
                <div className="truncate text-2xs text-fg-tertiary">{KIND_META[current.kind].label} · {current.id}</div>
              </div>
            </div>
            <StatusDot
              status={STATUS_META[current.status].status}
              text={STATUS_META[current.status].text}
              pulse={current.status === 'running'}
            />
          </div>

          <div className="p-3">
            {current.status === 'blocked' ? (
              <Alert
                type="warning"
                showIcon
                className="mb-3"
                message="写操作已暂停，等待人工确认"
                description="策略 write.auto 只允许单文件自动写入；本次要改 3 个文件，需要你点一下。"
                action={
                  <Button
                    size="small"
                    onClick={() => message.info('真实产品里这里会跳到审批中心，本页的「工具审批」就是那一屏。')}
                  >
                    去处理
                  </Button>
                }
              />
            ) : null}

            {current.status === 'wait' ? (
              <Empty variant="simple" description="还没走到这一步" className="py-10" />
            ) : (
              <Tabs
                key={current.id}
                size="small"
                defaultActiveKey={current.input ? 'input' : current.output ? 'output' : 'log'}
                items={[
                  {
                    key: 'input',
                    label: '输入',
                    children: current.input ? (
                      <CodeBlock language="json" code={current.input} maxHeight={220} copyable />
                    ) : (
                      <Empty variant="simple" description="这一步没有入参" />
                    ),
                  },
                  {
                    key: 'output',
                    label: '输出',
                    children: current.output ? (
                      <CodeBlock language="text" code={current.output} maxHeight={220} copyable />
                    ) : (
                      <Empty variant="simple" description="还没有输出" />
                    ),
                  },
                  {
                    key: 'log',
                    label: '日志',
                    children: current.log ? (
                      <pre className="m-0 max-h-[220px] overflow-auto rounded-container bg-canvas p-3 font-mono text-2xs leading-relaxed text-fg-secondary">
                        {current.log}
                      </pre>
                    ) : (
                      <Empty variant="simple" description="没有日志" />
                    ),
                  },
                ]}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5">
            <span className="text-2xs text-fg-disabled tabular-nums">
              第 {steps.findIndex((s) => s.id === current.id) + 1} / {steps.length} 步
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="small"
                type="text"
                disabled={visible[0]?.id === current.id}
                onClick={() => {
                  const i = visible.findIndex((s) => s.id === current.id);
                  if (i > 0) setSelected(visible[i - 1].id);
                }}
              >
                上一步
              </Button>
              <Button
                size="small"
                type="text"
                disabled={visible[visible.length - 1]?.id === current.id}
                onClick={() => {
                  const i = visible.findIndex((s) => s.id === current.id);
                  if (i >= 0 && i < visible.length - 1) setSelected(visible[i + 1].id);
                }}
              >
                下一步
              </Button>
            </div>
          </div>
        </div>
      </div>

      <p className="m-0 mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-fg-disabled">
        <Terminal className="size-3" />
        <span>时间线、状态点、耗时与 token 都来自同一次运行记录，不是装饰。</span>
        <FileCode2 className="ms-1 size-3" />
        <span>点任意一步切换右侧详情；「继续执行」会把卡住的步骤真的跑完。</span>
      </p>
    </SceneFrame>
  );
}
