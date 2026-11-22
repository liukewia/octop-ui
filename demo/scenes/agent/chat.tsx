import { useEffect, useRef, useState } from 'react';
import { Copy, Play, RefreshCcw, Sparkles, ThumbsUp, Timer } from 'lucide-react';
import {
  AgentActions,
  AgentBubble,
  AgentChat,
  AgentConfirmation,
  AgentContext,
  AgentInlineCitation,
  AgentModelSelector,
  AgentPlan,
  AgentReasoning,
  AgentSender,
  AgentSources,
  AgentThoughtChain,
  AgentTool,
  AgentWelcome,
  Button,
  Tag,
} from '../../../src';
import type { AgentConfirmStatus } from '../../../src';
import { SceneFrame } from '../frame';

const REASON = `先看最近 20 次流水线：install 38s、next build 52s，都正常。图片优化 3m50s，而且每次都全量重跑 —— 缓存键里带了 commit hash，等于永远命中不了。`;

const ANSWER_LEAD = '卡在图片优化这一步。它每次都全量重跑，占了整条流水线的 62%。';
const ANSWER_TAIL =
  '把缓存键从 commit hash 换成 lockfile + public/images，构建时间应该回到 1m50s 左右，产物不变。';

const LOGS = `# main · 最近 20 次，中位数
install           38.2s
next build        52.4s
image optimize    3m50s   ← 每次全量
upload            21.6s
--------------------------------
total             5m42s`;

const SOURCES = [
  {
    key: '1',
    title: 'Deploy pipeline · 缓存键里为什么有 commit hash',
    url: 'https://example.com/docs/deploy-cache',
    snippet: '镜像优化步骤的缓存键包含 GIT_SHA，因此每次提交都会全量重跑。',
  },
  {
    key: '2',
    title: 'RFC-118 部署时长治理',
    url: 'https://example.com/rfc/118',
    snippet: '目标：主分支部署 P95 从 6m12s 降到 3m 以内。',
  },
];

const PROMPTS = [
  { key: 'p1', label: '部署为什么变慢了？', description: '看最近 20 次流水线，指出最慢的三段', icon: <Timer className="size-4" /> },
  { key: 'p2', label: '帮我改缓存键', description: '给出 diff，不直接推主分支', icon: <Sparkles className="size-4" /> },
];

const QUESTION = '部署为什么从 4 分钟变成 6 分钟了？先别改，告诉我卡在哪。';

const MODELS = [
  { key: 'octop-large', label: 'Octop Large', description: '200k 上下文 · 慢一点，稳一点' },
  { key: 'octop-small', label: 'Octop Small', description: '32k 上下文 · 适合改一个文件' },
];

const EFFORTS = [
  { key: 'low', label: '低' },
  { key: 'medium', label: '中' },
  { key: 'high', label: '高' },
];

/**
 * 「对话模板」场景：一条真实的排查对话。
 * 左侧是消息流（思考、工具、回答、来源、确认），右侧是计划与预算。
 * 每一步都能看出 Agent 现在在做什么，而不是只有一个转圈。
 */
export function AgentChatScene() {
  const [step, setStep] = useState(0);
  const [reasonChars, setReasonChars] = useState(0);
  const [value, setValue] = useState('');
  const [model, setModel] = useState('octop-large');
  const [effort, setEffort] = useState('medium');
  const [confirm, setConfirm] = useState<AgentConfirmStatus>('pending');
  const [extra, setExtra] = useState<{ id: number; text: string; reply?: string }[]>([]);
  const timers = useRef<number[]>([]);

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setStep(0);
    setReasonChars(0);
    setConfirm('pending');
    setExtra([]);
    setValue('');
  };

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // 状态机：1 提问 → 2 思考（流式）→ 3 调工具 → 4 回答（打字机）→ 5 收尾
  useEffect(() => {
    if (step === 1) {
      const id = window.setTimeout(() => setStep(2), 700);
      timers.current.push(id);
      return () => window.clearTimeout(id);
    }
    if (step === 3) {
      const id = window.setTimeout(() => setStep(4), 1200);
      timers.current.push(id);
      return () => window.clearTimeout(id);
    }
    if (step === 4) {
      const id = window.setTimeout(() => setStep(5), 950);
      timers.current.push(id);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [step]);

  useEffect(() => {
    if (step !== 2) return undefined;
    if (reasonChars >= REASON.length) {
      setStep(3);
      return undefined;
    }
    const id = window.setTimeout(() => setReasonChars((n) => Math.min(REASON.length, n + 3)), 22);
    return () => window.clearTimeout(id);
  }, [step, reasonChars]);

  const started = step >= 1;
  const answered = step >= 5;
  const approved = confirm === 'approved';

  return (
    <SceneFrame url="agent/chat" title="Octop Agent · 对话模板">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_248px]">
        <AgentChat className="h-[560px] lg:h-[620px]">
          <AgentChat.Header
            title="Octop Agent"
            subtitle="读仓库 · 跑流水线 · 不改主分支"
            extra={
              <>
                <Tag color="green">在线</Tag>
                <Button
                  size="small"
                  type="text"
                  aria-label="重放"
                  icon={<RefreshCcw className="size-3.5" />}
                  onClick={reset}
                />
              </>
            }
          />

          <AgentChat.Body padding="px-4 py-3.5">
            {!started && (
              <AgentWelcome
                title="先看哪一段？"
                description="我能读仓库、跑命令、看流水线。先把问题缩到一个文件或一次构建。"
                items={PROMPTS}
                onItemClick={() => setStep(1)}
              />
            )}

            {started && (
              <>
                <AgentBubble placement="end" content={QUESTION} header="你 · 14:22" />

                {step >= 2 && (
                  <div className="flex flex-col gap-2.5">
                    <AgentReasoning
                      loading={step === 2}
                      duration={5}
                      content={<span>{REASON.slice(0, step === 2 ? reasonChars : REASON.length)}</span>}
                    />
                  </div>
                )}

                {step >= 3 && (
                  <AgentTool
                    // 跑的时候展开、跑完自动收起；用户仍然可以自己点开
                    key={step === 3 ? 'running' : 'done'}
                    name="ci.pipeline_runs"
                    status={step === 3 ? 'running' : 'success'}
                    duration={1240}
                    defaultOpen={step === 3}
                    input={{ branch: 'main', limit: 20, fields: ['stage', 'median'] }}
                    output={LOGS}
                  />
                )}

                {step === 4 && <AgentBubble placement="start" loading />}

                {answered && (
                  <AgentBubble
                    content={
                      <span>
                        {ANSWER_LEAD}
                        <AgentInlineCitation
                          index={1}
                          title={SOURCES[0].title}
                          url={SOURCES[0].url}
                          snippet={SOURCES[0].snippet}
                        />
                        {ANSWER_TAIL}
                        <AgentInlineCitation
                          index={2}
                          title={SOURCES[1].title}
                          url={SOURCES[1].url}
                          snippet={SOURCES[1].snippet}
                        />
                      </span>
                    }
                    header="Octop Agent"
                    footer={
                      <>
                        <AgentActions
                          items={[
                            { key: 'copy', icon: <Copy className="size-3.5" />, tooltip: '复制' },
                            { key: 'good', icon: <ThumbsUp className="size-3.5" />, tooltip: '有帮助' },
                            { key: 'retry', icon: <RefreshCcw className="size-3.5" />, tooltip: '重答' },
                          ]}
                        />
                        <span className="text-[11px] text-fg-disabled">2 次工具调用 · 4.8s</span>
                      </>
                    }
                  />
                )}

                {answered && <AgentSources items={SOURCES} />}

                {answered && (
                  <AgentConfirmation
                    title="要不要在 staging 跑一次对照实验？"
                    description="只跑构建阶段，不部署、不写任何环境。跑完给你两边的耗时分段。"
                    tool="ci.run_job"
                    status={confirm}
                    params={[
                      { label: '分支', value: 'cache-key-experiment' },
                      { label: '环境', value: 'staging-only' },
                      { label: '预计耗时', value: '4m 10s', danger: true },
                    ]}
                    onApprove={() => setConfirm('approved')}
                    onDeny={() => setConfirm('denied')}
                  />
                )}

                {approved && (
                  <AgentBubble
                    content="对照实验跑完了：1m48s，比现在快 4 分 12 秒。要我开一个 PR 只改缓存键吗？"
                    header="Octop Agent · 刚刚"
                  />
                )}

                {extra.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4">
                    <AgentBubble placement="end" content={item.text} />
                    {item.reply ? (
                      <AgentBubble content={item.reply} />
                    ) : (
                      <AgentBubble placement="start" loading />
                    )}
                  </div>
                ))}

                {confirm === 'denied' && (
                  <AgentBubble
                    content="好，那不动流水线。我把改法写在 issue 里，等你方便的时候再看。"
                    header="Octop Agent · 刚刚"
                  />
                )}
              </>
            )}
          </AgentChat.Body>

          <AgentChat.Footer>
            <AgentSender
              value={value}
              onChange={setValue}
              loading={step === 3}
              placeholder={started ? '继续问…' : '问点什么，或点上面的例子'}
              onCancel={() => setStep(4)}
              maxLength={500}
              footer="Agent 会读仓库，但不会自己 push"
              actions={
                <AgentModelSelector
                  models={MODELS}
                  value={model}
                  onChange={setModel}
                  efforts={EFFORTS}
                  effort={effort}
                  onEffortChange={setEffort}
                  compact
                />
              }
              onSubmit={(text) => {
                setValue('');
                if (!started) {
                  setStep(1);
                  return;
                }
                const id = Date.now();
                setExtra((list) => [...list, { id, text }]);
                const timer = window.setTimeout(() => {
                  setExtra((list) =>
                    list.map((item) =>
                      item.id === id ? { ...item, reply: '这条是示例回复：换成真实后端时，这里接流式响应。' } : item,
                    ),
                  );
                }, 900);
                timers.current.push(timer);
              }}
            />
          </AgentChat.Footer>
        </AgentChat>

        <aside className="flex min-w-0 flex-col gap-3">
          <div className="rounded-container border border-line bg-surface p-3">
            <AgentPlan
              title="这一步的计划"
              items={[
                {
                  key: '1',
                  title: '拉取最近 20 次流水线',
                  status: step >= 4 ? 'success' : step === 3 ? 'running' : 'pending',
                },
                { key: '2', title: '定位最慢的一段', status: step >= 4 ? 'success' : 'pending' },
                {
                  key: '3',
                  title: '验证缓存键改法',
                  status: approved ? 'success' : answered ? 'running' : 'pending',
                },
                {
                  key: '4',
                  title: '开 PR 改配置',
                  status: approved ? 'pending' : confirm === 'denied' ? 'skipped' : 'pending',
                },
              ]}
            />
          </div>

          <div className="flex flex-col gap-2.5 rounded-container border border-line bg-surface p-3">
            <AgentContext
              used={approved ? 58000 : answered ? 42000 : 12000}
              total={200000}
              segments={[
                { label: '系统提示', value: 6000 },
                { label: '工具定义', value: 9000 },
                { label: '对话历史', value: approved ? 43000 : answered ? 27000 : 4000 },
              ]}
            />
            <div className="flex items-center justify-between gap-2 text-[11px] text-fg-tertiary">
              <span>本次花费</span>
              <span className="tabular-nums text-fg-secondary">¥0.08</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] text-fg-tertiary">
              <span>工具调用</span>
              <span className="tabular-nums text-fg-secondary">{step >= 3 ? 2 : 0}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-container border border-line bg-surface p-3">
            <span className="text-xs font-medium text-fg-secondary">换一个模型</span>
            <AgentModelSelector
              models={MODELS}
              value={model}
              onChange={setModel}
              efforts={EFFORTS}
              effort={effort}
              onEffortChange={setEffort}
              className="flex-wrap"
            />
            <span className="text-[11px] leading-relaxed text-fg-tertiary">
              强度越高，思考行的段落越长，首字时间也越晚。
            </span>
          </div>

          {step === 0 && (
            <Button
              type="primary"
              size="small"
              icon={<Play className="size-3.5" />}
              onClick={() => setStep(1)}
              className="self-start"
            >
              直接跑一遍
            </Button>
          )}

          {step > 0 && (
            <AgentThoughtChain
              size="small"
              items={[
                {
                  key: 'trace',
                  title: '这一次的调用',
                  status: answered ? 'success' : 'running',
                  description: answered ? '4.8s' : undefined,
                  content: (
                    <span className="text-xs leading-relaxed text-fg-tertiary">
                      reasoning → ci.pipeline_runs → answer。第 3 步需要你确认后才会执行。
                    </span>
                  ),
                },
              ]}
            />
          )}
        </aside>
      </div>
    </SceneFrame>
  );
}
