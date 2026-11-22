import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  FileSearch,
  GitBranch,
  RefreshCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Wand2,
} from 'lucide-react';
import {
  AgentActions,
  AgentBubble,
  AgentChat,
  AgentConfirmation,
  AgentContext,
  AgentInlineCitation,
  AgentModelSelector,
  AgentPlan,
  AgentPrompts,
  AgentReasoning,
  AgentSender,
  AgentSources,
  AgentThoughtChain,
  AgentTool,
  AgentWelcome,
  Button,
  Tag,
} from '../../src';
import type { AgentConfirmStatus } from '../../src';
import { Demo, Hint, Section, Stack } from '../primitives';

const MODELS = [
  { key: 'octop-large', label: 'Octop Large', description: '200k 上下文 · 慢一点，稳一点', group: '自带' },
  { key: 'octop-small', label: 'Octop Small', description: '32k 上下文 · 适合改一个文件', group: '自带' },
  { key: 'gpt-5', label: 'GPT-5', description: '1M 上下文 · 需要外部密钥', group: '第三方' },
];

const EFFORTS = [
  { key: 'low', label: '低', description: '直接答，不思考' },
  { key: 'medium', label: '中', description: '默认，先想三步' },
  { key: 'high', label: '高', description: '长思考，慢但更稳' },
];

const SOURCES = [
  {
    key: '1',
    title: 'Deploy pipeline · 缓存键里为什么有 commit hash',
    url: 'https://example.com/docs/deploy-cache',
    snippet: '镜像优化步骤的缓存键包含 GIT_SHA，因此每次提交都会全量重跑。',
  },
  {
    key: '2',
    title: 'next.config.js · images.unoptimized',
    url: 'https://example.com/docs/next-images',
    snippet: '关掉运行时优化后，构建产物变大，但部署不再等待图片处理。',
  },
  {
    key: '3',
    title: 'RFC-118 部署时长治理',
    url: 'https://example.com/rfc/118',
    snippet: '目标：主分支部署 P95 从 6m12s 降到 3m 以内。',
  },
];

const PROMPTS = [
  { key: 'p1', label: '为什么部署这么慢？', description: '看最近 20 次流水线，指出最慢的三段', icon: <FileSearch className="size-4" /> },
  { key: 'p2', label: '把失败用例整理成一页', description: '只留回归项，附上复现命令', icon: <GitBranch className="size-4" /> },
  { key: 'p3', label: '给这次改动写迁移说明', description: '面向调用方，写清破坏性变更', icon: <Wand2 className="size-4" /> },
  { key: 'p4', label: '检查这个 PR 的风险', description: '重点看并发与错误处理', icon: <Sparkles className="size-4" /> },
];

function BubbleDemo() {
  const [replay, setReplay] = useState(0);
  return (
    <Stack className="w-full gap-4">
      <AgentBubble
        placement="end"
        header="你 · 14:22"
        content="抽屉关闭以后焦点没回到触发按钮，键盘用户会掉到页面顶部。"
      />

      <AgentBubble
        placement="start"
        header="Octop Agent · 14:22"
        content={
          <span>
            是 <code className="rounded-[4px] bg-muted px-1 font-mono text-xs">onCloseAutoFocus</code>{' '}
            被覆盖了。Drawer 关闭时默认把焦点还给 Trigger，但如果内容里有自动聚焦的元素，就会优先落到它上面。
          </span>
        }
        footer={
          <AgentActions
            items={[
              { key: 'copy', icon: <Copy className="size-3.5" />, tooltip: '复制' },
              { key: 'up', icon: <ThumbsUp className="size-3.5" />, tooltip: '有帮助' },
              { key: 'down', icon: <ThumbsDown className="size-3.5" />, tooltip: '没帮助' },
              { key: 'retry', icon: <RefreshCcw className="size-3.5" />, tooltip: '重答' },
            ]}
          />
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <AgentBubble placement="start" loading />
        <Button size="small" icon={<RefreshCcw className="size-3.5" />} onClick={() => setReplay((v) => v + 1)}>
          重播打字
        </Button>
      </div>

      <AgentBubble
        key={replay}
        placement="start"
        avatar={false}
        typing={{ step: 2, interval: 26 }}
        className="ps-0"
        content="正在按「先定位、再改、最后跑一遍回归」的顺序处理这个 bug…"
      />
    </Stack>
  );
}

function SenderDemo() {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const [model, setModel] = useState('octop-large');
  const [effort, setEffort] = useState('medium');
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  return (
    <Stack className="w-full gap-3">
      <AgentSender
        value={value}
        onChange={setValue}
        loading={loading}
        maxLength={400}
        placeholder="让 Agent 做点什么…"
        attachments={[
          { key: 'a1', name: 'deploy.log', size: '128 KB' },
          { key: 'a2', name: 'next.config.js', size: '2 KB' },
        ]}
        actions={
          <AgentModelSelector
            models={MODELS}
            value={model}
            onChange={setModel}
            efforts={EFFORTS}
            effort={effort}
            onEffortChange={setEffort}
          />
        }
        footer="Agent 会读取仓库，但不会自己 push"
        onSubmit={(text) => {
          setSent((list) => [text, ...list].slice(0, 2));
          setValue('');
          setLoading(true);
          timer.current = setTimeout(() => setLoading(false), 2400);
        }}
        onCancel={() => setLoading(false)}
      />

      {sent.length > 0 && (
        <div className="flex flex-col gap-1 text-xs text-fg-tertiary">
          {sent.map((text, i) => (
            <span key={i} className="truncate">
              已提交 → <span className="text-fg-secondary">{text}</span>
            </span>
          ))}
        </div>
      )}
    </Stack>
  );
}

function ReasoningDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <Stack className="w-full gap-3">
      <AgentReasoning
        loading={loading}
        duration={5}
        content={
          <span>
            部署日志里有三段：install 38s、next build 52s，都正常。图片优化花了 3m50s，
            而且每次都重跑 —— 缓存键里带了 commit hash，等于永远命中不了。
          </span>
        }
      />
      <div className="flex items-center gap-2">
        <Button size="small" onClick={() => setLoading((v) => !v)}>
          {loading ? '结束思考' : '再想一次'}
        </Button>
        <span className="text-xs text-fg-tertiary">结束后自动收起；用户点开过就不再自动合上</span>
      </div>
    </Stack>
  );
}

function ThoughtChainDemo() {
  return (
    <AgentThoughtChain
      items={[
        {
          key: 'plan',
          title: '拆成三步',
          status: 'success',
          description: '0.4s',
          content: <p className="m-0">先量一遍最慢的流水线，再定位缓存键，最后给一条可以回滚的改法。</p>,
        },
        {
          key: 'read',
          title: '读取 next.config.js',
          status: 'success',
          description: '0.8s',
        },
        {
          key: 'edit',
          title: '修改 images 配置',
          status: 'running',
        },
        {
          key: 'test',
          title: '跑回归用例',
          status: 'error',
          description: '2 项失败',
          content: (
            <span className="block rounded-element bg-[var(--ax-danger-bg)] px-2.5 py-2 text-xs leading-relaxed text-[var(--ax-danger-fg)]">
              visual-regression › checkout.spec.ts — 快照差异 3.2%
            </span>
          ),
        },
        {
          key: 'todo',
          title: '写 rollout 说明',
          status: 'pending',
        },
      ]}
    />
  );
}

function ToolDemo() {
  return (
    <AgentTool
      name="read_file"
      status="success"
      duration={820}
      defaultOpen
      input={{ path: 'next.config.js', lines: [1, 24] }}
      output={`images: {\n  unoptimized: true,\n},\nexperimental: {\n  optimizePackageImports: ['lucide-react'],\n},`}
    />
  );
}

function SourcesDemo() {
  return (
    <Stack className="w-full gap-3">
      <p className="m-0 text-md leading-relaxed text-fg">
        卡在图片优化这一步：它的缓存键包含 commit hash，所以每次都全量重跑
        <AgentInlineCitation
          index={1}
          title={SOURCES[0].title}
          url={SOURCES[0].url}
          snippet={SOURCES[0].snippet}
        />
        。关掉运行时优化后部署降到 1m48s
        <AgentInlineCitation
          index={2}
          title={SOURCES[1].title}
          url={SOURCES[1].url}
          snippet={SOURCES[1].snippet}
        />
        ，代价是产物大了 11%。
      </p>
      <AgentSources items={SOURCES} />
    </Stack>
  );
}

function ConfirmationDemo() {
  const [status, setStatus] = useState<AgentConfirmStatus>('pending');
  return (
    <Stack className="w-full gap-3">
      <AgentConfirmation
        danger
        title="即将写入生产库"
        description="这一步会更新 3 张表的索引，期间读写正常但不保证性能。"
        tool="db.migrate"
        status={status}
        params={[
          { label: '目标库', value: 'prod-octop-cn' },
          { label: '迁移文件', value: '0042_add_index.sql' },
          { label: '预计锁表', value: '8s（不可回滚）', danger: true },
        ]}
        onApprove={() => setStatus('approved')}
        onDeny={() => setStatus('denied')}
      />
      {status !== 'pending' && (
        <Button size="small" onClick={() => setStatus('pending')}>
          回到待确认
        </Button>
      )}
    </Stack>
  );
}

function PlanDemo() {
  return (
    <AgentPlan
      items={[
        { key: '1', title: '拉取最近 20 次流水线', status: 'success' },
        { key: '2', title: '定位最慢的三段', status: 'success' },
        { key: '3', title: '验证缓存键改法', status: 'running', description: '正在本地构建对照' },
        { key: '4', title: '写迁移说明', status: 'pending' },
        { key: '5', title: '通知 on-call', status: 'skipped' },
      ]}
    />
  );
}

function ContextDemo() {
  return (
    <Stack className="w-full gap-4">
      <AgentContext
        used={42000}
        total={200000}
        segments={[
          { label: '系统提示', value: 6000 },
          { label: '工具定义', value: 9000 },
          { label: '对话历史', value: 27000 },
        ]}
      />
      <AgentContext used={172000} total={200000} size="small" />
    </Stack>
  );
}

function ChatDemo() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'user' as const, text: '部署为什么变慢了？' },
    {
      id: 2,
      role: 'assistant' as const,
      text: '图片优化那一步每次都全量重跑，占了整条流水线的 62%。把缓存键换成 lockfile + public/images 就够。',
    },
  ]);
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  return (
    <AgentChat className="h-[360px]">
      <AgentChat.Header
        title="Octop Agent"
        subtitle="读仓库 · 不改主分支"
        extra={
          <>
            <Tag color="green">在线</Tag>
            <AgentContext used={42000} total={200000} showLabel={false} className="w-24" />
          </>
        }
      />
      <AgentChat.Body>
        {messages.map((m) => (
          <AgentBubble key={m.id} placement={m.role === 'user' ? 'end' : 'start'} content={m.text} />
        ))}
        {pending && <AgentBubble placement="start" loading />}
      </AgentChat.Body>
      <AgentChat.Footer>
        <AgentSender
          value={value}
          onChange={setValue}
          loading={pending}
          placeholder="继续问…"
          attach={false}
          onSubmit={(text) => {
            setMessages((list) => [...list, { id: Date.now(), role: 'user', text }]);
            setValue('');
            setPending(true);
            timer.current = setTimeout(() => {
              setMessages((list) => [
                ...list,
                {
                  id: Date.now() + 1,
                  role: 'assistant',
                  text: '收到。这条是示例回复：真实实现里，这里接的是流式响应。',
                },
              ]);
              setPending(false);
            }, 1100);
          }}
          onCancel={() => setPending(false)}
        />
      </AgentChat.Footer>
    </AgentChat>
  );
}

export function AgentTemplate() {
  const [model, setModel] = useState('octop-large');
  const [effort, setEffort] = useState('medium');
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <Section
      id="agent-template"
      title="Agent 模板"
      api="AgentBubble / AgentSender / AgentThoughtChain …"
      desc={
        <>
          对应 shadcn 的 AI Elements：对话、步骤、来源、确认、计划、上下文这几块「模式」。
          视觉仍走 Astryx（留白、细描边、单色 accent），API 沿用 antd / antd-x 的命名
          （items / placement / status / onSubmit）。
        </>
      }
    >
      <Demo label="气泡" code="AgentBubble" span="full" dir="column">
        <BubbleDemo />
        <Hint>
          用户侧是反相实底，Agent 侧不加边框 —— 长回答不会被一个圆角框反复切断。
          <code>loading</code> 换成三点，<code>typing</code> 走打字机（只对字符串生效）。
        </Hint>
      </Demo>

      <Demo label="输入区" code="AgentSender" span="full" dir="column">
        <SenderDemo />
        <Hint>
          <code>onSubmit</code> 只给文本，不替你清空；<code>loading</code> 时发送键变停止键。
          附件、模型选择、上下文提示分别落在 header / actions / footer 三个槽位。
        </Hint>
      </Demo>

      <Demo label="开场与提示" code="AgentWelcome / AgentPrompts" span="full" dir="column">
        <AgentWelcome
          title="今天看哪一段？"
          description="我能读仓库、跑命令、看流水线。先把问题缩小到一个文件或一次构建。"
          items={PROMPTS}
          onItemClick={(item) => setPicked(String(item.label))}
        />
        <p className="m-0 text-center text-xs text-fg-tertiary">
          {picked ? `已选：${picked}` : '点一张卡片，这里会显示它被发出去了'}
        </p>
        <div className="border-t border-line pt-3">
          <AgentPrompts
            title="单独用：横向两列"
            columns={2}
            items={PROMPTS.slice(0, 2)}
            onItemClick={(item) => setPicked(String(item.label))}
          />
        </div>
        <Hint>
          提示卡而不是胶囊：装得下「把上周的部署失败原因整理成一页」这种真实长度的提问。
        </Hint>
      </Demo>

      <Demo label="思考" code="AgentReasoning" dir="column">
        <ReasoningDemo />
        <Hint>
          思考中展开且标题扫光，结束后自动收起 —— 只在用户没动过的时候自动，点开过就听用户的。
        </Hint>
      </Demo>

      <Demo label="步骤链" code="AgentThoughtChain" dir="column">
        <ThoughtChainDemo />
        <Hint>
          竖线只在行与行之间出现，图标报状态（待办 / 进行 / 完成 / 失败），标题报动作。
        </Hint>
      </Demo>

      <Demo label="工具调用" code="AgentTool" span="full" dir="column">
        <ToolDemo />
        <Hint>
          入参按 JSON 展开，输出走 CodeBlock；失败时把错误原文摆在同一条线上。
        </Hint>
      </Demo>

      <Demo label="来源与行内引用" code="AgentSources / AgentInlineCitation" span="full" dir="column">
        <SourcesDemo />
        <Hint>
          <code>[n]</code> 悬停开小卡，带摘录与域名；键盘用户可以直接点进原页面。
        </Hint>
      </Demo>

      <Demo label="确认" code="AgentConfirmation" span="full" dir="column">
        <ConfirmationDemo />
        <Hint>
          做什么（tool + 参数）、影响什么（危险项标红）、拒绝会怎样，三件事在一屏里给全。
          确认后卡片自己收成一行结论。
        </Hint>
      </Demo>

      <Demo label="计划" code="AgentPlan" dir="column">
        <PlanDemo />
        <Hint>顶部只给进度条和 n/m —— 计划是承诺，不是仪表盘。</Hint>
      </Demo>

      <Demo label="上下文与模型" code="AgentContext / AgentModelSelector" dir="column">
        <ContextDemo />
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <AgentModelSelector
            models={MODELS}
            value={model}
            onChange={setModel}
            efforts={EFFORTS}
            effort={effort}
            onEffortChange={setEffort}
          />
          <span className="min-w-0 truncate text-xs text-fg-tertiary">
            {model} · {effort}
          </span>
        </div>
        <Hint>
          上下文是仪表盘上的读数，一条细横条就够；模型与强度分成两颗胶囊，选中的写在按钮上。
        </Hint>
      </Demo>

      <Demo label="会话外壳" code="AgentChat" span="full" dir="column">
        <ChatDemo />
        <Hint>
          <code>AgentChat.Body</code> 自带 <code>scroll-fade</code> 和贴底逻辑：用户往上翻就暂停，
          回到底部再恢复。<code>Check</code> 图标只是装饰，别当状态用。
        </Hint>
      </Demo>
    </Section>
  );
}
