import { useMemo, useState } from 'react';
import { Bell, CheckCheck, CornerUpLeft, Search, Send } from 'lucide-react';
import { Avatar, Badge, Button, Empty, Input, Segmented, Tag } from '../../src';
import { SceneFrame, ScenePanel } from './frame';

type Kind = 'mention' | 'approval' | 'system';

type Thread = {
  id: string;
  from: string;
  initials: string;
  color: string;
  subject: string;
  preview: string;
  time: string;
  kind: Kind;
  unread: boolean;
  body: string[];
};

const KIND_META: Record<Kind, { label: string; tone: 'blue' | 'orange' | 'gray' }> = {
  mention: { label: '提及', tone: 'blue' },
  approval: { label: '审批', tone: 'orange' },
  system: { label: '系统', tone: 'gray' },
};

const INITIAL: Thread[] = [
  {
    id: 't1',
    from: '周霖',
    initials: '周',
    color: 'var(--ax-hue-blue-bg)',
    subject: '结算页改版的三个待确认点',
    preview: '地址簿那块我倾向于复用抽屉，不再单独开一页…',
    time: '10:24',
    kind: 'mention',
    unread: true,
    body: [
      '地址簿那块我倾向于复用抽屉，不再单独开一页 —— 从结算页跳出去再回来，购物车的选中态容易丢。',
      '另外两件事想确认：优惠券选择器要不要支持「不可用」分组置灰？还有发票入口放在金额明细下方，会不会被当成合计的一部分？',
      '如果没问题，我今天把交互稿补完，明天进开发。',
    ],
  },
  {
    id: 't2',
    from: '审批中心',
    initials: '批',
    color: 'var(--ax-hue-orange-bg)',
    subject: '「秋季会员日」折扣规则待你审批',
    preview: '运营组提交了一条满 300 减 50 的叠加规则…',
    time: '09:48',
    kind: 'approval',
    unread: true,
    body: [
      '运营组提交了一条满 300 减 50 的叠加规则，与现有会员折扣可叠加，预计影响毛利率 2.4pt。',
      '该规则将在 11 月 24 日 00:00 生效，审批截止时间为今天 18:00。',
    ],
  },
  {
    id: 't3',
    from: '李知遥',
    initials: '李',
    color: 'var(--ax-hue-green-bg)',
    subject: '设计令牌的命名我改了一版',
    preview: '把 line-strong 和 line 合并成了两档，组件里不用再判断…',
    time: '昨天',
    kind: 'mention',
    unread: false,
    body: [
      '把 line-strong 和 line 合并成了两档，组件里不用再判断「这个描边在灰底上看不看得见」。',
      '令牌表我已经同步到仓库，改完跑一遍截图对比就能看出来差异，主要影响卡片和表格的分隔线。',
    ],
  },
  {
    id: 't4',
    from: '系统通知',
    initials: '系',
    color: 'var(--ax-canvas)',
    subject: '本周有 3 个组件缺少窄屏验收',
    preview: 'DatePicker、Cascader、Transfer 在 390px 下未记录截图。',
    time: '昨天',
    kind: 'system',
    unread: false,
    body: [
      'DatePicker、Cascader、Transfer 在 390px 下未记录截图，发布前请补齐。',
      '这三类浮层在窄屏会贴边，需要确认圆角与遮罩仍然正确。',
    ],
  },
];

export function InboxScene() {
  const [threads, setThreads] = useState(INITIAL);
  const [activeId, setActiveId] = useState('t1');
  const [filter, setFilter] = useState<'all' | 'unread' | 'mention'>('all');
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];
  const unreadCount = threads.filter((t) => t.unread).length;
  const mentionCount = threads.filter((t) => t.kind === 'mention').length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter((t) => {
      if (filter === 'unread' && !t.unread) return false;
      if (filter === 'mention' && t.kind !== 'mention') return false;
      if (!q) return true;
      return `${t.from}${t.subject}${t.preview}`.toLowerCase().includes(q);
    });
  }, [threads, filter, query]);

  const select = (id: string) => {
    setActiveId(id);
    setSent(false);
    setReply('');
  };

  const markRead = () => {
    setThreads((list) => list.map((t) => (t.id === active.id ? { ...t, unread: false } : t)));
  };

  const send = () => {
    if (!reply.trim()) return;
    setReply('');
    setSent(true);
    setThreads((list) => list.map((t) => (t.id === active.id ? { ...t, unread: false } : t)));
  };

  return (
    <SceneFrame url="inbox" title="消息中心">
      <div className="grid min-h-[520px] gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ScenePanel className="flex min-w-0 flex-col overflow-hidden">
          <div className="border-b border-line p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                收件箱
                <Badge count={unreadCount} size="small" />
              </span>
              <Button size="small" type="text" icon={<CheckCheck className="size-3.5" />}>
                全部已读
              </Button>
            </div>
            <Input
              size="small"
              placeholder="搜索消息"
              prefix={<Search className="size-3.5" />}
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-2">
              <Segmented
                block
                size="small"
                value={filter}
                onChange={(v) => setFilter(v as typeof filter)}
                options={[
                  { label: '全部', value: 'all' },
                  { label: `未读 ${unreadCount}`, value: 'unread' },
                  { label: `提及 ${mentionCount}`, value: 'mention' },
                ]}
              />
            </div>
          </div>

          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {visible.length === 0 ? (
              <div className="p-6">
                <Empty description="没有符合条件的消息" />
              </div>
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {visible.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => select(t.id)}
                      data-active={t.id === active.id}
                      className="ax-focus flex w-full items-start gap-2.5 border-b border-line-soft px-3 py-3 text-start transition-colors duration-[125ms] ease-standard hover:bg-muted-soft data-[active=true]:bg-muted"
                    >
                      <Avatar
                        size={32}
                        style={{ background: t.color }}
                        className="flex-none text-xs font-medium text-fg"
                      >
                        {t.initials}
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium text-fg">{t.from}</span>
                          <span className="flex-none text-2xs text-fg-disabled tabular-nums">{t.time}</span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5">
                          {t.unread && <span className="size-1.5 flex-none rounded-full bg-accent" />}
                          <span className="truncate text-sm text-fg">{t.subject}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-fg-tertiary">{t.preview}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScenePanel>

        <ScenePanel className="flex min-w-0 flex-col overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Tag color={KIND_META[active.kind].tone}>{KIND_META[active.kind].label}</Tag>
                {active.unread ? <Tag color="blue" filled>未读</Tag> : null}
              </div>
              <h3 className="m-0 text-lg font-semibold leading-snug text-fg">{active.subject}</h3>
              <p className="m-0 mt-1 flex items-center gap-2 text-xs text-fg-tertiary">
                <Avatar size={22} style={{ background: active.color }} className="text-2xs text-fg">
                  {active.initials}
                </Avatar>
                {active.from}
                <span aria-hidden>·</span>
                {active.time}
              </p>
            </div>
            <div className="flex flex-none items-center gap-1.5">
              <Button
                size="small"
                icon={<Bell className="size-3.5" />}
                onClick={markRead}
                disabled={!active.unread}
              >
                {active.unread ? '标记已读' : '已读'}
              </Button>
              <Button size="small" type="primary" icon={<CornerUpLeft className="size-3.5" />}>
                回复
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="flex flex-col gap-3">
              {active.body.map((p) => (
                <p key={p} className="m-0 text-sm leading-relaxed text-fg-secondary">
                  {p}
                </p>
              ))}
            </div>
            {sent ? (
              <p className="m-0 mt-4 inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-xs text-success">
                <CheckCheck className="size-3.5" />
                回复已发送，对方会收到站内信
              </p>
            ) : null}
          </div>

          <div className="border-t border-line p-3">
            <Input.TextArea
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`回复 ${active.from}…`}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-2xs text-fg-disabled">⌘ + Enter 发送</span>
              <Button
                size="small"
                type="primary"
                icon={<Send className="size-3.5" />}
                disabled={!reply.trim()}
                onClick={send}
              >
                发送
              </Button>
            </div>
          </div>
        </ScenePanel>
      </div>
    </SceneFrame>
  );
}
