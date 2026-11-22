import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  FlaskConical,
  Minus,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  Alert,
  Button,
  Checkbox,
  CodeBlock,
  Segmented,
  Statistic,
  Table,
  Tag,
  message,
  type ColumnType,
} from '../../../src';
import { SceneFrame, SceneLabel, ScenePanel } from '../frame';

type Verdict = 'stable' | 'fixed' | 'regression' | 'broken';

type Case = {
  id: string;
  name: string;
  kind: '工具调用' | '多轮' | '审批' | '格式';
  v3: boolean;
  v4: boolean;
  ms3: number;
  ms4: number;
  cost3: number;
  cost4: number;
  note?: string;
  diff?: string;
};

const CORE: Case[] = [
  {
    id: 'c01',
    name: '列固定后横向滚动对齐',
    kind: '工具调用',
    v3: false,
    v4: true,
    ms3: 21400,
    ms4: 14200,
    cost3: 0.062,
    cost4: 0.048,
    note: 'v3 把 sticky offset 算成了固定值，宽表一滚就错位；v4 先量列宽再算偏移。',
    diff: `- const offset = index * 120;
+ const offset = stickyOffset(columns, index, widths);`,
  },
  {
    id: 'c02',
    name: '写三个文件时触发审批',
    kind: '审批',
    v3: false,
    v4: true,
    ms3: 15600,
    ms4: 8600,
    cost3: 0.048,
    cost4: 0.031,
    note: 'v3 直接写入，没有走 write.auto 策略；v4 在第一次写之前就停下来问。',
    diff: `- await fs.patch(files);
+ if (files.length > 1) return askApproval(files);
+ await fs.patch(files);`,
  },
  {
    id: 'c03',
    name: '引用必须带行号',
    kind: '格式',
    v3: true,
    v4: true,
    ms3: 6800,
    ms4: 6200,
    cost3: 0.021,
    cost4: 0.019,
  },
  {
    id: 'c04',
    name: '类型报错后自行重试一次',
    kind: '多轮',
    v3: true,
    v4: true,
    ms3: 26100,
    ms4: 24800,
    cost3: 0.076,
    cost4: 0.072,
  },
  {
    id: 'c05',
    name: '不确定时追问而不是猜',
    kind: '多轮',
    v3: false,
    v4: false,
    ms3: 4200,
    ms4: 4100,
    cost3: 0.015,
    cost4: 0.014,
    note: '两版都会硬猜。已记为待修，但不算回归。',
  },
  {
    id: 'c06',
    name: '支付金额四舍五入到分',
    kind: '工具调用',
    v3: true,
    v4: false,
    ms3: 10800,
    ms4: 11200,
    cost3: 0.036,
    cost4: 0.038,
    note: 'v4 把 toFixed(2) 改成了 toFixed(3)，单测抓到，是本轮唯一的回归。',
    diff: `- const amount = (price * qty).toFixed(3);
+ const amount = (price * qty).toFixed(2);`,
  },
  {
    id: 'c07',
    name: '一次只改一个关注点',
    kind: '多轮',
    v3: true,
    v4: true,
    ms3: 19600,
    ms4: 18400,
    cost3: 0.055,
    cost4: 0.052,
  },
  {
    id: 'c08',
    name: '回答里不出现内部路径',
    kind: '格式',
    v3: false,
    v4: true,
    ms3: 9200,
    ms4: 5400,
    cost3: 0.024,
    cost4: 0.017,
  },
];

const EDGE: Case[] = [
  {
    id: 'e01',
    name: '空仓库时的降级提示',
    kind: '工具调用',
    v3: false,
    v4: true,
    ms3: 5200,
    ms4: 3900,
    cost3: 0.016,
    cost4: 0.011,
    note: 'v3 直接抛错，v4 会说明「没有可检索内容」并给出下一步。',
  },
  {
    id: 'e02',
    name: '审批超时后的行为',
    kind: '审批',
    v3: false,
    v4: true,
    ms3: 12800,
    ms4: 9200,
    cost3: 0.041,
    cost4: 0.028,
    note: 'v4 在 5 分钟超时后回滚并留下记录，v3 会一直挂着。',
  },
  {
    id: 'e03',
    name: '工具连续失败 3 次',
    kind: '工具调用',
    v3: true,
    v4: true,
    ms3: 16800,
    ms4: 15600,
    cost3: 0.048,
    cost4: 0.044,
  },
  {
    id: 'e04',
    name: '中英混排的代码注释',
    kind: '格式',
    v3: true,
    v4: false,
    ms3: 7400,
    ms4: 7800,
    cost3: 0.023,
    cost4: 0.024,
    note: 'v4 把中文注释截断了半个字符。',
    diff: `- // 列宽按内容测量，兜底 80px
+ // 列宽按内容测量，兜底 80`,
  },
  {
    id: 'e05',
    name: '预算耗尽时主动停下',
    kind: '多轮',
    v3: false,
    v4: true,
    ms3: 18200,
    ms4: 13400,
    cost3: 0.061,
    cost4: 0.046,
    note: 'v3 会继续调用直到报错，v4 到 80% 就汇报并给出剩余工作。',
  },
];

const DATASETS = [
  { label: '核心 8', value: 'core' },
  { label: '边界 5', value: 'edge' },
];

const VERDICT: Record<Verdict, { text: string; color: string }> = {
  stable: { text: '稳定通过', color: 'green' },
  fixed: { text: '已修复', color: 'blue' },
  regression: { text: '回归', color: 'red' },
  broken: { text: '仍失败', color: 'gray' },
};

function verdictOf(c: Case): Verdict {
  if (c.v3 && c.v4) return 'stable';
  if (!c.v3 && c.v4) return 'fixed';
  if (c.v3 && !c.v4) return 'regression';
  return 'broken';
}

export function AgentEvalsScene() {
  const [dataset, setDataset] = useState('core');
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const all = dataset === 'core' ? CORE : EDGE;
  const rows = onlyDiff ? all.filter((c) => c.v3 !== c.v4) : all;
  const pass3 = all.filter((c) => c.v3).length;
  const pass4 = all.filter((c) => c.v4).length;
  const rate3 = (pass3 / all.length) * 100;
  const rate4 = (pass4 / all.length) * 100;
  const delta = rate4 - rate3;
  const avgMs3 = all.reduce((s, c) => s + c.ms3, 0) / all.length;
  const avgMs4 = all.reduce((s, c) => s + c.ms4, 0) / all.length;
  const avgCost3 = all.reduce((s, c) => s + c.cost3, 0) / all.length;
  const avgCost4 = all.reduce((s, c) => s + c.cost4, 0) / all.length;
  const deltaMs = (avgMs4 - avgMs3) / 1000;
  const deltaCost = avgCost4 - avgCost3;
  const regressions = all.filter((c) => verdictOf(c) === 'regression').length;

  const columns: ColumnType<Case>[] = useMemo(
    () => [
      {
        key: 'name',
        title: '用例',
        minWidth: 210,
        render: (_v, r) => (
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-fg">{r.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <code className="font-mono text-[10px] text-fg-disabled">{r.id}</code>
              <Tag color="gray">{r.kind}</Tag>
            </div>
          </div>
        ),
      },
      {
        key: 'v3',
        title: 'v3',
        width: 76,
        align: 'center',
        render: (_v, r) =>
          r.v3 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-success-fg">
              <Check className="size-3" />
              通过
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-fg-disabled">
              <X className="size-3" />
              失败
            </span>
          ),
      },
      {
        key: 'v4',
        title: 'v4',
        width: 76,
        align: 'center',
        render: (_v, r) =>
          r.v4 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-success-fg">
              <Check className="size-3" />
              通过
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-danger-fg">
              <X className="size-3" />
              失败
            </span>
          ),
      },
      {
        key: 'verdict',
        title: '判定',
        width: 88,
        render: (_v, r) => {
          const v = VERDICT[verdictOf(r)];
          return <Tag color={v.color}>{v.text}</Tag>;
        },
      },
      {
        key: 'ms',
        title: '耗时',
        width: 74,
        align: 'right',
        render: (_v, r) => <span className="text-xs text-fg-secondary tabular-nums">{(r.ms4 / 1000).toFixed(1)}s</span>,
      },
      {
        key: 'cost',
        title: '成本',
        width: 68,
        align: 'right',
        render: (_v, r) => <span className="text-xs text-fg-secondary tabular-nums">¥{r.cost4.toFixed(3)}</span>,
      },
    ],
    [],
  );

  return (
    <SceneFrame url="agent/evals/v4" title="评测对比">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-base font-semibold text-fg">v4 到底比 v3 强在哪</h3>
            <Tag color="purple">8 月回归</Tag>
          </div>
          <p className="m-0 mt-1 max-w-[560px] text-xs leading-relaxed text-fg-tertiary">
            评测不是看一个总分：拉出每条用例的差异，才知道分数涨在哪、又退在哪。
          </p>
        </div>
        <div className="flex flex-none flex-wrap items-center gap-2">
          <Segmented size="small" shape="round" options={DATASETS} value={dataset} onChange={(v) => setDataset(v as string)} />
          <Button
            size="small"
            icon={<RefreshCw className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'} />}
            loading={refreshing}
            onClick={() => {
              setRefreshing(true);
              window.setTimeout(() => {
                setRefreshing(false);
                message.success(`已重新跑完 ${all.length} 条用例`);
              }, 1200);
            }}
          >
            重跑
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          {
            title: 'v4 通过率',
            value: rate4.toFixed(0),
            suffix: '%',
            delta: `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}pt`,
            tone: delta >= 0 ? 'up' : 'down',
            hint: `v3 ${rate3.toFixed(0)}%`,
          },
          {
            title: '平均耗时',
            value: (avgMs4 / 1000).toFixed(1),
            suffix: 's',
            delta: `${deltaMs <= 0 ? '−' : '+'}${Math.abs(deltaMs).toFixed(1)}s`,
            tone: deltaMs <= 0 ? 'up' : 'down',
            hint: `v3 ${(avgMs3 / 1000).toFixed(1)}s`,
          },
          {
            title: '单次成本',
            value: avgCost4.toFixed(3),
            prefix: '¥',
            delta: `${deltaCost <= 0 ? '−' : '+'}¥${Math.abs(deltaCost).toFixed(3)}`,
            tone: deltaCost <= 0 ? 'up' : 'down',
            hint: `v3 ¥${avgCost3.toFixed(3)}`,
          },
          {
            title: '回归用例',
            value: regressions,
            suffix: '条',
            delta: regressions ? '已标红' : '可以发布',
            tone: regressions ? 'flat' : 'up',
            hint: regressions ? '展开看 diff' : '没有退化',
          },
        ].map((s) => (
          <div key={s.title} className="rounded-container border border-line bg-surface px-3 py-2.5">
            <Statistic
              title={<span className="text-[11px] text-fg-tertiary">{s.title}</span>}
              value={s.value}
              prefix={s.prefix}
              suffix={<span className="text-xs font-normal text-fg-tertiary">{s.suffix}</span>}
            />
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                className={
                  s.tone === 'up'
                    ? 'inline-flex items-center gap-0.5 text-[10px] text-success-fg'
                    : s.tone === 'down'
                      ? 'inline-flex items-center gap-0.5 text-[10px] text-danger-fg'
                      : 'inline-flex items-center gap-0.5 text-[10px] text-fg-tertiary'
                }
              >
                {s.tone === 'up' ? (
                  <ArrowUpRight className="size-3" />
                ) : s.tone === 'down' ? (
                  <ArrowDownRight className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                {s.delta}
              </span>
              <span className="truncate text-[10px] text-fg-disabled">{s.hint}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <SceneLabel extra={`${rows.length} 条`}>
          {dataset === 'core' ? '核心用例' : '边界用例'}
        </SceneLabel>
        <ScenePanel className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <label className="flex items-center gap-2 text-[11px] text-fg-secondary">
              <Checkbox checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)}>
                只看有差异的用例
              </Checkbox>
            </label>
            <span className="flex items-center gap-2 text-[10px] text-fg-disabled">
              <BarChart3 className="size-3" />
              点行首箭头看失败原因与 diff
            </span>
          </div>
          <Table
            columns={columns}
            dataSource={rows}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 660 }}
            expandable={{
              expandedRowRender: (r) => (
                <div className="flex flex-col gap-2 py-1">
                  {r.note ? (
                    <Alert
                      type={verdictOf(r) === 'regression' ? 'error' : verdictOf(r) === 'fixed' ? 'success' : 'warning'}
                      showIcon={false}
                      message={
                        <span className="flex items-start gap-1.5 text-xs">
                          <AlertTriangle className="mt-0.5 size-3 flex-none" />
                          <span>{r.note}</span>
                        </span>
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-fg-tertiary">
                      <Minus className="size-3" />
                      两版行为一致，没有需要解释的差异。
                    </div>
                  )}
                  {r.diff ? (
                    <CodeBlock language="diff" title={`${r.id}.patch`} code={r.diff} maxHeight={140} />
                  ) : null}
                </div>
              ),
            }}
          />
        </ScenePanel>
      </div>

      <p className="m-0 mt-2 flex items-center gap-1.5 text-2xs text-fg-disabled">
        <FlaskConical className="size-3" />
        切换数据集会重算上面四个指标；「回归」永远是红的那一条，别让它藏在平均分里。
      </p>
    </SceneFrame>
  );
}
