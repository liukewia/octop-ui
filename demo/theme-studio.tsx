import { useState } from 'react';
import {
  AgentActions,
  AgentBubble,
  AgentSender,
  Alert,
  Avatar,
  Button,
  Checkbox,
  Input,
  Progress,
  Segmented,
  Select,
  Switch,
  Tag,
  ThemeEditor,
  DEFAULT_THEME,
  TOKEN_GROUPS,
  type ThemeConfig,
} from '../src';
import { cn } from '../src/lib/cn';

type SceneId = 'card' | 'form' | 'chat';

const SCENES: { id: SceneId; label: string }[] = [
  { id: 'card', label: '卡片' },
  { id: 'form', label: '表单' },
  { id: 'chat', label: '会话' },
];

const TOKEN_CHIPS = [
  'bg',
  'surface',
  'canvas',
  'accent',
  'accent-soft',
  'on-accent',
  'line-strong',
];

const PEOPLE = [
  { initial: '陈', name: '陈默', meta: '二等座 · 12A', tag: '已确认', color: 'green' },
  { initial: '林', name: '林知夏', meta: '二等座 · 12C', tag: '待确认', color: 'orange' },
  { initial: '周', name: '周予安', meta: '儿童票 · 12B', tag: '需陪同', color: 'blue' },
];

function CardScene() {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-fg-tertiary">行程 · G7351</div>
          <h3 className="mt-1 text-xl font-semibold text-fg">上海虹桥 → 杭州东</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-tertiary">
            <span className="tabular-nums">08:42</span>
            <span className="text-fg-disabled">→</span>
            <span className="tabular-nums">09:38</span>
            <span className="text-fg-disabled">·</span>
            <span>1 小时 09 分</span>
          </div>
        </div>
        <Tag color="green">已出票</Tag>
      </div>

      <div className="mt-4 rounded-container border border-line bg-canvas p-3.5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="inline-flex h-5 items-center rounded-full bg-accent-soft px-2 text-2xs text-fg">
              待支付
            </span>
            <div className="mt-0.5 text-2xl font-semibold text-fg tabular-nums">¥ 73.00</div>
          </div>
          <Button type="primary" size="small">
            立即支付
          </Button>
        </div>
        <div className="mt-3">
          <Progress percent={68} size="small" showInfo={false} />
          <div className="mt-1.5 flex items-center justify-between text-2xs text-fg-tertiary">
            <span>已选座 2 / 3</span>
            <span>距发车 12 分钟</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {PEOPLE.map((person) => (
          <div
            key={person.name}
            className="flex items-center gap-2.5 border-t border-line py-2.5 first:border-t-0"
          >
            <Avatar size={30}>{person.initial}</Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-fg">{person.name}</div>
              <div className="truncate text-xs text-fg-tertiary">{person.meta}</div>
            </div>
            <Tag color={person.color}>{person.tag}</Tag>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
        <Button type="primary" size="small">
          值机选座
        </Button>
        <Button size="small">改签</Button>
        <Button type="text" size="small" className="ms-auto">
          退票
        </Button>
      </div>
    </div>
  );
}

function FormScene() {
  return (
    <form className="grid gap-3 p-4 sm:p-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs text-fg-secondary">联系人</span>
          <Input defaultValue="陈默" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs text-fg-secondary">手机号</span>
          <Input defaultValue="138 0000 1234" />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs text-fg-secondary">席别</span>
        <Select
          defaultValue="second"
          className="!w-full"
          options={[
            { label: '二等座 · ¥73', value: 'second' },
            { label: '一等座 · ¥117', value: 'first' },
            { label: '商务座 · ¥219', value: 'business' },
          ]}
        />
      </label>

      <div className="flex items-center justify-between gap-3 rounded-container border border-line px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-sm text-fg">接收行程提醒</div>
          <div className="text-xs text-fg-tertiary">发车前 30 分钟推送一次</div>
        </div>
        <Switch defaultChecked aria-label="接收行程提醒" />
      </div>

      <Alert type="warning" showIcon message="改签后原座位不再保留，差价按实时票价结算" />

      <Checkbox defaultChecked>我已阅读并同意《铁路旅客运输规程》</Checkbox>

      <div className="flex items-center gap-2">
        <Button type="primary" htmlType="submit" block>
          确认订单
        </Button>
        <Button type="text">取消</Button>
      </div>
    </form>
  );
}

function ChatScene() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      <AgentBubble
        placement="end"
        variant="filled"
        header={<span className="text-xs text-fg-tertiary">你 · 09:24</span>}
      >
        这班车能带宠物吗？
      </AgentBubble>

      <AgentBubble
        placement="start"
        header={<span className="text-xs text-fg-tertiary">Octop 助手 · 09:24</span>}
        footer={
          <AgentActions
            items={[
              { key: 'copy', label: '复制' },
              { key: 'retry', label: '重新生成' },
              { key: 'like', label: '有帮助' },
            ]}
          />
        }
      >
        <p className="m-0">
          可以，但要装进 <strong className="font-medium">≤ 20×40×55cm</strong>{' '}
          的宠物箱，并在发车前 40 分钟到车站办理托运。导盲犬不受此限。
        </p>
      </AgentBubble>

      <div className="flex flex-wrap items-center gap-1.5">
        <Tag>已核对 2026 版规程</Tag>
        <Tag color="blue">托运</Tag>
      </div>

      <AgentSender
        placeholder="继续问：宠物箱有尺寸要求吗？"
        footer={
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-[4px] border border-line bg-muted px-1 font-mono text-2xs text-fg-secondary">
              Enter
            </kbd>
            发送 · 内容仅供演示
          </span>
        }
        actions={<Tag color="purple">G7351</Tag>}
      />
    </div>
  );
}

export function ThemeStudio({
  theme,
  onThemeChange,
  mode,
  onModeChange,
}: {
  theme: ThemeConfig | null;
  onThemeChange: (config: ThemeConfig | null) => void;
  mode: 'light' | 'dark';
  onModeChange: (mode: 'light' | 'dark') => void;
}) {
  const [scene, setScene] = useState<SceneId>('card');
  const [phone, setPhone] = useState(false);

  return (
    <div className="min-h-[calc(100vh-48px)] bg-canvas lg:h-[calc(100vh-48px)] lg:overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1280px] flex-col px-5 pt-6 sm:px-8">
        <header className="mb-4 flex flex-none flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-fg-tertiary">
              <span className="inline-flex h-5 items-center rounded-full bg-accent px-2 text-2xs font-medium text-on-accent">
                主题
              </span>
              <span>
                5 个旋钮 · {TOKEN_GROUPS.reduce((n, group) => n + group.tokens.length, 0)} 枚令牌 · 0
                次重新构建
              </span>
            </div>
            <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-fg sm:text-3xl">
              主题是旋钮，不是分支
            </h1>
            <p className="mt-1.5 max-w-[760px] text-sm text-fg-tertiary">
              组件只写语义类（<code className="font-mono">bg-surface</code>、
              <code className="font-mono">text-fg</code>）。五个旋钮推出一整套令牌写进{' '}
              <code className="font-mono">:root</code>，改完立刻生效，不用重编、也不用给组件加 variant。
            </p>
          </div>
          <div className="flex flex-none items-center gap-1.5 text-xs text-fg-tertiary">
            <span
              className={cn(
                'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5',
                theme ? 'bg-accent-soft text-fg' : 'bg-surface text-fg-tertiary',
              )}
            >
              <span
                className={cn('size-1.5 rounded-full', theme ? 'bg-accent' : 'bg-fg-disabled')}
              />
              {theme ? '已存到本地' : '库默认令牌'}
            </span>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 pb-6 max-lg:pb-16 lg:grid-cols-[352px_minmax(0,1fr)]">
          <ThemeEditor
            value={theme ?? DEFAULT_THEME}
            onChange={(next) => onThemeChange(next)}
            onReset={() => onThemeChange(null)}
            mode={mode}
            onModeChange={onModeChange}
            className="max-lg:h-[min(720px,calc(100vh-120px))] lg:h-full lg:min-h-0"
          />

          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="mb-3 flex flex-none flex-wrap items-center justify-between gap-2">
              <Segmented
                shape="round"
                value={scene}
                options={SCENES.map((item) => ({ label: item.label, value: item.id }))}
                onChange={(next) => setScene(next as SceneId)}
              />
              <div className="flex items-center gap-1.5">
                <Segmented
                  shape="round"
                  value={phone ? 'phone' : 'desktop'}
                  options={[
                    { label: '桌面', value: 'desktop' },
                    { label: '手机', value: 'phone' },
                  ]}
                  onChange={(next) => setPhone(next === 'phone')}
                />
                <span className="hidden text-xs text-fg-tertiary sm:inline">实时预览</span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-container border border-line bg-surface/60 p-3 sm:p-5">
              <div
                className={cn(
                  'mx-auto overflow-hidden rounded-page border border-line bg-bg shadow-pop transition-[max-width] duration-[300ms] ease-standard',
                  phone ? 'max-w-[390px]' : 'max-w-none',
                )}
              >
                <div className="flex h-10 items-center gap-2 border-b border-line px-3">
                  <span className="size-2.5 rounded-full bg-accent" />
                  <span className="text-sm font-medium text-fg">Atlas 出行</span>
                  <span className="ms-auto flex items-center gap-1.5 text-xs text-fg-tertiary">
                    <span className="size-1.5 rounded-full bg-success" />
                    在线
                  </span>
                </div>
                {scene === 'card' ? <CardScene /> : null}
                {scene === 'form' ? <FormScene /> : null}
                {scene === 'chat' ? <ChatScene /> : null}
              </div>
            </div>

            <div className="mt-3 flex flex-none flex-wrap items-center gap-1.5">
              {TOKEN_CHIPS.map((token) => (
                <span
                  key={token}
                  className="inline-flex h-6 items-center gap-1.5 rounded-full bg-surface px-2 text-2xs text-fg-tertiary"
                >
                  <span
                    className="size-2.5 rounded-[3px] shadow-[inset_0_0_0_1px_var(--ax-line)]"
                    style={{ background: `var(--ax-${token})` }}
                  />
                  <span className="font-mono">{token}</span>
                </span>
              ))}
              <span className="text-2xs text-fg-disabled">
                色块直接读当前计算值，跟着旋钮走
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
