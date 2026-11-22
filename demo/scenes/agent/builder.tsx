import { useMemo, useState } from 'react';
import {
  BookOpen,
  Bot,
  Check,
  Coins,
  FlaskConical,
  Gauge,
  Globe,
  Lock,
  Save,
  Settings2,
  ShieldAlert,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react';
import {
  Alert,
  Button,
  Checkbox,
  CodeBlock,
  Input,
  Modal,
  Segmented,
  Select,
  Slider,
  StatusDot,
  Switch,
  Tag,
  TextArea,
  Timeline,
  message,
} from '../../../src';
import { cn } from '../../../src/lib/cn';
import { SceneFrame, SceneLabel, ScenePanel } from '../frame';

const MODELS = [
  { label: 'octop-4.1 · 推理强，慢', value: 'octop-4.1' },
  { label: 'octop-4.1 mini · 快，便宜', value: 'mini' },
  { label: 'octop-3.5 · 只读场景', value: 'legacy' },
];

const TOOLS = [
  { id: 'search', name: 'code.search', desc: '在授权的仓库里检索代码与文档', icon: Globe },
  { id: 'read', name: 'fs.read', desc: '读取文件内容，只读', icon: BookOpen },
  { id: 'patch', name: 'fs.patch', desc: '写入文件；写操作会按策略要求确认', icon: Wrench },
  { id: 'shell', name: 'shell.exec', desc: '运行白名单命令（typecheck / test / build）', icon: Terminal },
];

const KNOWLEDGE = [
  { label: 'octop-ui 组件文档', value: 'ui' },
  { label: '设计令牌规范', value: 'tokens' },
  { label: '历史评审记录', value: 'reviews' },
];

const PROMPT = `你是 Octop UI 的维护助手。
先读代码再回答，引用文件要带行号。
需要写操作时，先说清改哪几个文件、风险是什么，再等我确认。`;

export function AgentBuilderScene() {
  const [name, setName] = useState('组件维护助手');
  const [model, setModel] = useState('octop-4.1');
  const [prompt, setPrompt] = useState(PROMPT);
  const [tools, setTools] = useState(['search', 'read', 'patch']);
  const [kb, setKb] = useState(['ui', 'tokens']);
  const [budget, setBudget] = useState(12);
  const [rounds, setRounds] = useState('8');
  const [mode, setMode] = useState<'read' | 'write'>('write');
  const [autoApprove, setAutoApprove] = useState(false);
  const [trial, setTrial] = useState(false);

  const selected = TOOLS.filter((t) => tools.includes(t.id));
  const risky = autoApprove && tools.includes('patch') && mode === 'write';
  const estimate = useMemo(
    () => (0.006 * selected.length + (model === 'mini' ? 0.01 : 0.04) + budget * 0.004).toFixed(2),
    [selected.length, model, budget],
  );

  const toggleTool = (id: string, on: boolean) =>
    setTools((list) => (on ? [...list, id] : list.filter((t) => t !== id)));

  return (
    <SceneFrame url="agent/builder/new" title="Agent 编排">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-base font-semibold text-fg">编排一个 Agent</h3>
            <Tag color="gray">草稿</Tag>
            {risky ? <Tag color="red">有风险</Tag> : null}
          </div>
          <p className="m-0 mt-1 max-w-[560px] text-xs leading-relaxed text-fg-tertiary">
            左边配能力，右边实时算代价。工具、权限、预算三者要一起看 —— 只加工具不限预算，是最常见的翻车方式。
          </p>
        </div>
        <div className="flex flex-none items-center gap-2">
          <StatusDot status={risky ? 'warning' : 'success'} text={risky ? '需要复核' : '可以发布'} />
          <Button size="small" icon={<FlaskConical className="size-3.5" />} onClick={() => setTrial(true)}>
            试运行
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<Save className="size-3.5" />}
            onClick={() => message.success('草稿已保存，未发布')}
          >
            保存草稿
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_286px]">
        <div className="flex min-w-0 flex-col gap-3">
          <ScenePanel className="p-3">
            <SceneLabel extra="必填">基本</SceneLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-[11px] text-fg-tertiary">名称</span>
                <Input size="small" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-[11px] text-fg-tertiary">模型</span>
                <Select size="small" options={MODELS} value={model} onChange={(v) => setModel(v as string)} />
              </label>
            </div>
            <label className="mt-3 flex min-w-0 flex-col gap-1">
              <span className="flex items-center justify-between text-[11px] text-fg-tertiary">
                <span>系统提示</span>
                <span className="tabular-nums">{prompt.length} 字</span>
              </span>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                autoSize={{ minRows: 4, maxRows: 8 }}
                className="text-xs leading-relaxed"
              />
            </label>
          </ScenePanel>

          <ScenePanel>
            <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                <Wrench className="size-3.5 text-fg-tertiary" />
                工具
              </span>
              <span className="text-[11px] text-fg-tertiary tabular-nums">已选 {tools.length} / {TOOLS.length}</span>
            </div>
            <div className="divide-y divide-line-soft">
              {TOOLS.map((t) => {
                const Icon = t.icon;
                const on = tools.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={cn(
                      'flex items-start gap-2.5 px-3 py-2.5 transition-colors',
                      on ? 'bg-muted-soft' : 'hover:bg-muted-soft',
                    )}
                  >
                    <Checkbox
                      checked={on}
                      onChange={(e) => toggleTool(t.id, e.target.checked)}
                      aria-label={`启用 ${t.name}`}
                      className="mt-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTool(t.id, !on)}
                      className="ax-focus flex min-w-0 flex-1 items-start gap-2.5 rounded-[4px] text-start"
                    >
                      <span className="grid size-6 flex-none place-items-center rounded-element bg-canvas text-fg-tertiary">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <code className="font-mono text-[11px] text-fg">{t.name}</code>
                          {t.id === 'patch' ? <Tag color="yellow">写</Tag> : null}
                          {t.id === 'shell' ? <Tag color="gray">白名单</Tag> : null}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-fg-tertiary">{t.desc}</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </ScenePanel>

          <ScenePanel className="p-3">
            <SceneLabel extra="多选">知识库</SceneLabel>
            <Select
              mode="multiple"
              size="small"
              options={KNOWLEDGE}
              value={kb}
              onChange={(v) => setKb(v as string[])}
              placeholder="选择可检索的知识库"
              maxTagCount="responsive"
              className="w-full"
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-1 flex items-center justify-between text-[11px] text-fg-tertiary">
                  <span className="flex items-center gap-1">
                    <Coins className="size-3" />
                    单次预算上限
                  </span>
                  <span className="font-medium text-fg tabular-nums">¥{budget}</span>
                </div>
                <Slider value={budget} min={1} max={50} onChange={(v) => typeof v === 'number' && setBudget(v)} />
              </div>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-[11px] text-fg-tertiary">最多轮次</span>
                <Select
                  size="small"
                  options={[
                    { label: '4 轮 · 快', value: '4' },
                    { label: '8 轮 · 默认', value: '8' },
                    { label: '16 轮 · 长任务', value: '16' },
                  ]}
                  value={rounds}
                  onChange={(v) => setRounds(v as string)}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-3">
              <div className="min-w-0">
                <div className="text-xs font-medium text-fg">权限</div>
                <div className="text-[11px] text-fg-tertiary">只读模式会隐藏所有写工具</div>
              </div>
              <Segmented
                size="small"
                shape="round"
                options={[
                  { label: '只读', value: 'read' },
                  { label: '可写', value: 'write' },
                ]}
                value={mode}
                onChange={(v) => setMode(v as 'read' | 'write')}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-3">
              <div className="min-w-0">
                <div className="text-xs font-medium text-fg">自动执行写操作</div>
                <div className="text-[11px] text-fg-tertiary">关掉后每次写入都会进审批队列</div>
              </div>
              <Switch checked={autoApprove} onChange={setAutoApprove} />
            </div>
          </ScenePanel>
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-3 lg:self-start">
          <ScenePanel className="overflow-hidden">
            <div className="bg-canvas px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="grid size-7 flex-none place-items-center rounded-element bg-accent text-on-accent">
                  <Bot className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-fg">{name || '未命名 Agent'}</div>
                  <div className="truncate text-[10px] text-fg-tertiary">
                    {MODELS.find((m) => m.value === model)?.label}
                  </div>
                </div>
              </div>
            </div>
            <dl className="m-0 divide-y divide-line-soft">
              {[
                { label: '工具', value: `${selected.length} 个`, icon: Wrench },
                { label: '知识库', value: `${kb.length} 个`, icon: BookOpen },
                { label: '权限', value: mode === 'write' ? '可写 · 需审批' : '只读', icon: mode === 'write' ? Wrench : Lock },
                { label: '预算', value: `¥${budget} / 次`, icon: Coins },
                { label: '轮次', value: `${rounds} 轮`, icon: Gauge },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                    <dt className="m-0 flex items-center gap-1.5 text-fg-tertiary">
                      <Icon className="size-3" />
                      {r.label}
                    </dt>
                    <dd className="m-0 font-medium text-fg tabular-nums">{r.value}</dd>
                  </div>
                );
              })}
            </dl>
            <div className="border-t border-line px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-fg-tertiary">预估单次成本</span>
                <span className="text-sm font-semibold text-fg tabular-nums">¥{estimate}</span>
              </div>
              <p className="m-0 mt-0.5 text-[10px] text-fg-disabled">按 8 轮、平均 3 次工具调用估算</p>
            </div>
          </ScenePanel>

          {risky ? (
            <div className="flex flex-col gap-2">
              <Alert
                type="warning"
                showIcon
                message="写操作会自动执行"
                description="当前允许 fs.patch 且关闭了审批。生产仓库建议至少保留一次人工确认。"
              />
              <Button size="small" className="w-full" onClick={() => setAutoApprove(false)}>
                改成需审批
              </Button>
            </div>
          ) : (
            <Alert
              type="success"
              showIcon
              message="策略看起来合理"
              description={mode === 'read' ? '只读模式即使误配也不会改仓库。' : '写操作仍会进入审批队列。'}
            />
          )}

          <div className="rounded-container bg-canvas p-3">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-fg-secondary">
              <Sparkles className="size-3" />
              能力清单
            </span>
            <div className="flex flex-wrap gap-1">
              {selected.length === 0 ? (
                <span className="text-[11px] text-fg-tertiary">还没选工具，它只能聊天</span>
              ) : (
                selected.map((t) => (
                  <Tag key={t.id} color={t.id === 'patch' ? 'yellow' : t.id === 'shell' ? 'purple' : 'blue'}>
                    {t.name}
                  </Tag>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={trial}
        onCancel={() => setTrial(false)}
        title="试运行 · 不会写入任何文件"
        width={520}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button size="small" onClick={() => setTrial(false)}>
              关闭
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<Check className="size-3.5" />}
              onClick={() => {
                setTrial(false);
                message.success('已保存并启用');
              }}
            >
              保存并启用
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-fg-tertiary">
            <Tag color="gray">{name || '未命名'}</Tag>
            <Tag color="blue">{MODELS.find((m) => m.value === model)?.label}</Tag>
            <span className="tabular-nums">{selected.length} 个工具</span>
          </div>
          <Timeline
            items={[
              {
                key: '1',
                color: 'green',
                children: (
                  <div className="text-xs">
                    <div className="font-medium text-fg">读到了 table.tsx</div>
                    <div className="text-fg-tertiary">324 行，定位到 fixed 列的宽度计算</div>
                  </div>
                ),
              },
              {
                key: '2',
                color: 'green',
                children: (
                  <div className="text-xs">
                    <div className="font-medium text-fg">生成了一版补丁</div>
                    <div className="text-fg-tertiary">3 个文件 · +58 −12，未写入</div>
                  </div>
                ),
              },
              {
                key: '3',
                color: 'blue',
                children: (
                  <div className="text-xs">
                    <div className="font-medium text-fg">等你确认</div>
                    <div className="text-fg-tertiary">试运行到写操作前停下，正是策略期望的行为</div>
                  </div>
                ),
              },
            ]}
          />
          <CodeBlock
            language="text"
            title="策略判定"
            code={`tool.fs.patch  allowed=true
  policy write.repo  requires_approval=${autoApprove ? 'false' : 'true'}
  budget             used=¥1.82 / ¥${budget}
  rounds             used=3 / ${rounds}`}
            maxHeight={160}
          />
          <div className="flex items-start gap-1.5 text-[11px] leading-relaxed text-fg-tertiary">
            <ShieldAlert className="mt-0.5 size-3 flex-none" />
            <span>试运行会真实调用模型，但工具调用全部走 mock，不落盘、不发请求。</span>
          </div>
        </div>
      </Modal>

      <p className="m-0 mt-3 flex items-center gap-1.5 text-2xs text-fg-disabled">
        <Settings2 className="size-3" />
        改任意一项，右侧的摘要与成本都会立刻重算；这就是「配置即结果」的那一屏。
      </p>
    </SceneFrame>
  );
}
