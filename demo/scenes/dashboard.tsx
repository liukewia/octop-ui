import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Download } from 'lucide-react';
import type { ColumnType } from '../../src';
import { Button, Progress, Segmented, Statistic, Table, Tag } from '../../src';
import { SceneFrame, SceneLabel, ScenePanel } from './frame';

type RangeKey = '7d' | '30d' | 'q';

const RANGES = [
  { label: '近 7 天', value: '7d' as const },
  { label: '近 30 天', value: '30d' as const },
  { label: '本季度', value: 'q' as const },
];

const STATS: Record<RangeKey, { users: number; active: number; cvr: number; aov: number }> = {
  '7d': { users: 12480, active: 63.2, cvr: 4.8, aov: 286 },
  '30d': { users: 48260, active: 61.4, cvr: 4.1, aov: 312 },
  q: { users: 143900, active: 58.7, cvr: 3.6, aov: 341 },
};

const SERIES: Record<RangeKey, number[]> = {
  '7d': [38, 46, 41, 58, 52, 71, 64],
  '30d': [22, 31, 28, 39, 36, 44, 41, 52, 48, 61, 57, 68],
  q: [30, 34, 33, 41, 46, 44, 52, 58, 56, 66, 72, 78],
};

const AXIS: Record<RangeKey, string[]> = {
  '7d': ['周一', '周三', '周五', '今天'],
  '30d': ['1 日', '10 日', '20 日', '30 日'],
  q: ['7 月', '8 月', '9 月', '本周'],
};

type Row = {
  key: string;
  channel: string;
  dot: string;
  users: number;
  cvr: number;
  status: '正常' | '观察' | '受限';
  tone: 'success' | 'warning' | 'error';
};

const ROWS: Row[] = [
  { key: 'natural', channel: '自然搜索', dot: 'var(--ax-hue-blue-fg)', users: 18420, cvr: 5.2, status: '正常', tone: 'success' },
  { key: 'social', channel: '社媒种草', dot: 'var(--ax-hue-pink-fg)', users: 12680, cvr: 4.6, status: '正常', tone: 'success' },
  { key: 'referral', channel: '老客推荐', dot: 'var(--ax-hue-green-fg)', users: 6240, cvr: 7.8, status: '观察', tone: 'warning' },
  { key: 'paid', channel: '信息流投放', dot: 'var(--ax-hue-orange-fg)', users: 9180, cvr: 2.1, status: '受限', tone: 'error' },
];

const COLUMNS: ColumnType<Row>[] = [
  {
    key: 'channel',
    dataIndex: 'channel',
    title: '渠道',
    render: (_v, row) => (
      <span className="flex items-center gap-2">
        <span className="size-1.5 flex-none rounded-full" style={{ background: row.dot }} />
        <span className="text-fg">{row.channel}</span>
      </span>
    ),
  },
  {
    key: 'users',
    dataIndex: 'users',
    title: '新增',
    align: 'right',
    render: (v) => <span className="tabular-nums">{(v as number).toLocaleString()}</span>,
  },
  {
    key: 'cvr',
    dataIndex: 'cvr',
    title: '转化率',
    align: 'right',
    render: (v) => <span className="tabular-nums text-fg-secondary">{(v as number).toFixed(1)}%</span>,
  },
  {
    key: 'status',
    dataIndex: 'status',
    title: '状态',
    align: 'right',
    render: (_v, row) => (
      <Tag color={row.tone === 'success' ? 'green' : row.tone === 'warning' ? 'yellow' : 'red'}>
        {row.status}
      </Tag>
    ),
  },
];

const GOALS = [
  { label: '销售目标', value: 68, note: '340 / 500 万' },
  { label: '新客获取', value: 82, note: '8,240 / 10,000' },
  { label: '次月续费', value: 46, note: '低于均值 8pt' },
];

const FEED = [
  { time: '09:42', text: '投放渠道 A 的 CPC 超出阈值', tone: 'var(--ax-warning)' },
  { time: '09:10', text: '「秋季会员日」活动已上线', tone: 'var(--ax-success)' },
  { time: '昨天', text: '周报已生成并推送到邮箱', tone: 'var(--ax-fg-disabled)' },
];

export function DashboardScene() {
  const [range, setRange] = useState<RangeKey>('30d');
  const stats = STATS[range];
  const series = SERIES[range];
  const max = useMemo(() => Math.max(...series), [series]);

  const cards = [
    { title: '新增用户', value: stats.users, delta: '+12.4%', up: true },
    { title: '活跃率', value: stats.active, suffix: '%', delta: '+1.8pt', up: true },
    { title: '付费转化', value: stats.cvr, suffix: '%', delta: '-0.3pt', up: false },
    { title: '客单价', value: stats.aov, prefix: '¥', delta: '+6.1%', up: true },
  ];

  return (
    <SceneFrame url="console/overview" title="增长看板">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-lg font-semibold text-fg">增长看板</h3>
          <p className="m-0 mt-0.5 text-xs text-fg-tertiary">数据更新于 2 分钟前 · UTC+8</p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented options={RANGES} value={range} onChange={(v) => setRange(v as RangeKey)} size="small" />
          <Button size="small" icon={<Download className="size-3.5" />}>
            导出
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cards.map((c) => (
              <div key={c.title} className="rounded-container border border-line bg-surface p-3.5">
                <Statistic
                  title={c.title}
                  value={c.value}
                  suffix={c.suffix}
                  prefix={c.prefix}
                  valueStyle={{ fontSize: 22 }}
                />
                <div
                  className={`mt-1.5 inline-flex items-center gap-0.5 text-xs ${
                    c.up ? 'text-success' : 'text-danger'
                  }`}
                >
                  {c.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {c.delta}
                  <span className="ms-1 text-fg-tertiary">环比</span>
                </div>
              </div>
            ))}
          </div>

          <ScenePanel className="p-4">
            <SceneLabel extra="单位：万元">收入趋势</SceneLabel>
            <div className="flex h-[132px] items-end gap-1.5" role="img" aria-label="收入趋势柱状图">
              {series.map((v, i) => (
                <div key={i} className="group flex h-full flex-1 items-end" title={`${v} 万`}>
                  <div
                    className={`w-full rounded-[3px] transition-[height,background-color] duration-[300ms] ease-standard ${
                      i === series.length - 1 ? 'bg-accent' : 'bg-accent/25 group-hover:bg-accent/60'
                    }`}
                    style={{ height: `${Math.round((v / max) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-2xs text-fg-disabled">
              {AXIS[range].map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
          </ScenePanel>

          <div>
            <SceneLabel extra="按新增排序">渠道表现</SceneLabel>
            <Table
              columns={COLUMNS}
              dataSource={ROWS}
              rowKey="key"
              size="small"
              pagination={false}
              caption={undefined}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <ScenePanel className="p-4">
            <SceneLabel>目标进度</SceneLabel>
            <div className="flex flex-col gap-3.5">
              {GOALS.map((g) => (
                <div key={g.label}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="text-sm text-fg-secondary">{g.label}</span>
                    <span className="text-xs text-fg-tertiary tabular-nums">{g.note}</span>
                  </div>
                  <Progress percent={g.value} size="small" showInfo={false} />
                </div>
              ))}
            </div>
          </ScenePanel>

          <ScenePanel className="p-4">
            <SceneLabel>最近动态</SceneLabel>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {FEED.map((f) => (
                <li key={f.text} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 flex-none rounded-full" style={{ background: f.tone }} />
                  <span className="min-w-0 flex-1 text-sm leading-snug text-fg-secondary">{f.text}</span>
                  <span className="flex-none text-2xs text-fg-disabled tabular-nums">{f.time}</span>
                </li>
              ))}
            </ul>
          </ScenePanel>
        </div>
      </div>
    </SceneFrame>
  );
}
