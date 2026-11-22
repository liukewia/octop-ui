import { useEffect, useRef, useState } from 'react';
import { Camera, Laptop, Smartphone, ShieldCheck, Trash2 } from 'lucide-react';
import {
  Alert,
  Avatar,
  Button,
  Input,
  Modal,
  Select,
  Segmented,
  Switch,
  Tabs,
  Tag,
} from '../../src';
import { SceneFrame } from './frame';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm text-fg-secondary">{label}</span>
      {children}
      {hint ? <span className="text-xs text-fg-tertiary">{hint}</span> : null}
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-soft py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-sm text-fg">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-fg-tertiary">{desc}</div>
      </div>
      <Switch checked={checked} onChange={onChange} aria-label={title} className="mt-0.5 flex-none" />
    </div>
  );
}

const TZ = [
  { label: '中国标准时间（UTC+8）', value: 'sh' },
  { label: '日本标准时间（UTC+9）', value: 'tk' },
  { label: '太平洋时间（UTC-8）', value: 'sf' },
];

const LANG = [
  { label: '简体中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
];

export function SettingsScene() {
  const [tab, setTab] = useState('profile');
  const [nickname, setNickname] = useState('刘可');
  const [email, setEmail] = useState('liu.ke@octop.app');
  const [tz, setTz] = useState('sh');
  const [lang, setLang] = useState('zh');
  const [digest, setDigest] = useState<'realtime' | 'daily' | 'weekly'>('daily');
  const [notif, setNotif] = useState({ mention: true, approval: true, report: false, marketing: false });
  const [twoFactor, setTwoFactor] = useState(true);
  const [saved, setSaved] = useState(false);
  const [danger, setDanger] = useState(false);
  const [deactivated, setDeactivated] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const save = () => {
    setSaved(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaved(false), 2400);
  };

  const profile = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size={56} className="text-lg font-medium">
          刘
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-fg">刘可</span>
            <Tag color="green">已实名</Tag>
            <Tag color="purple">管理员</Tag>
          </div>
          <p className="m-0 mt-0.5 text-xs text-fg-tertiary">加入于 2023 年 4 月 · 最近登录 2 小时前</p>
        </div>
        <Button size="small" icon={<Camera className="size-3.5" />} className="w-full justify-center sm:w-auto">
          更换头像
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="昵称">
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} showCount />
        </Field>
        <Field label="邮箱" hint="用于接收审批与安全通知">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} prefix={<span className="text-fg-tertiary">@</span>} />
        </Field>
        <Field label="手机号">
          <Input value="138****6621" disabled suffix={<Tag color="green">已验证</Tag>} />
        </Field>
        <Field label="职位">
          <Input defaultValue="前端 · 设计系统" />
        </Field>
        <Field label="时区">
          <Select options={TZ} value={tz} onChange={(v) => setTz(v as string)} />
        </Field>
        <Field label="界面语言">
          <Select options={LANG} value={lang} onChange={(v) => setLang(v as string)} />
        </Field>
      </div>
    </div>
  );

  const notices = (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 text-sm text-fg-secondary">提醒方式</div>
        <Segmented
          value={digest}
          onChange={(v) => setDigest(v as typeof digest)}
          options={[
            { label: '实时', value: 'realtime' },
            { label: '每日摘要', value: 'daily' },
            { label: '每周摘要', value: 'weekly' },
          ]}
        />
        <p className="m-0 mt-2 text-xs text-fg-tertiary">
          {digest === 'realtime'
            ? '每条消息立即推送，适合需要即时响应的审批岗。'
            : digest === 'daily'
              ? '每天 09:00 汇总一条，夜里不打扰。'
              : '每周一 09:00 汇总，适合只关心结果的成员。'}
        </p>
      </div>
      <div>
        <ToggleRow
          title="评论与提及"
          desc="有人 @ 你或在你的稿件下留言时提醒。"
          checked={notif.mention}
          onChange={(v) => setNotif({ ...notif, mention: v })}
        />
        <ToggleRow
          title="审批结果"
          desc="提交的审批被通过或驳回时提醒，含驳回原因。"
          checked={notif.approval}
          onChange={(v) => setNotif({ ...notif, approval: v })}
        />
        <ToggleRow
          title="周报摘要"
          desc="每周一推送上周的组件改动与待办。"
          checked={notif.report}
          onChange={(v) => setNotif({ ...notif, report: v })}
        />
        <ToggleRow
          title="产品与活动"
          desc="新版本、线下活动与调研邀请。"
          checked={notif.marketing}
          onChange={(v) => setNotif({ ...notif, marketing: v })}
        />
      </div>
    </div>
  );

  const security = (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="当前密码">
          <Input.Password defaultValue="octop-2024" />
        </Field>
        <Field label="新密码" hint="至少 8 位，含数字与字母">
          <Input.Password placeholder="输入新密码" />
        </Field>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-container bg-canvas p-3.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 flex-none text-success" />
          <div>
            <div className="text-sm font-medium text-fg">两步验证</div>
            <div className="mt-0.5 text-xs text-fg-tertiary">登录新设备时额外验证一次，管理员账号建议开启。</div>
          </div>
        </div>
        <Switch checked={twoFactor} onChange={setTwoFactor} aria-label="两步验证" className="flex-none" />
      </div>

      <div>
        <div className="mb-2 text-sm text-fg-secondary">登录设备</div>
        <ul className="m-0 flex list-none flex-col p-0">
          {[
            { icon: <Laptop className="size-4" />, name: 'MacBook Pro · Chrome', meta: '上海 · 当前设备', now: true },
            { icon: <Smartphone className="size-4" />, name: 'iPhone 15 · 企业微信', meta: '上海 · 2 小时前', now: false },
            { icon: <Laptop className="size-4" />, name: 'Windows · Edge', meta: '杭州 · 3 天前', now: false },
          ].map((d) => (
            <li
              key={d.name}
              className="flex items-center gap-2.5 border-b border-line-soft py-2.5 last:border-b-0"
            >
              <span className="flex-none text-fg-tertiary">{d.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-fg">{d.name}</span>
                <span className="block text-2xs text-fg-tertiary">{d.meta}</span>
              </span>
              {d.now ? (
                <Tag color="green">在线</Tag>
              ) : (
                <Button size="small" type="text">
                  退出
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-container border border-line p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-fg">注销账号</div>
            <div className="mt-0.5 text-xs text-fg-tertiary">注销后 30 天内可撤销，到期后数据不可恢复。</div>
          </div>
          <Button danger size="small" icon={<Trash2 className="size-3.5" />} onClick={() => setDanger(true)}>
            注销
          </Button>
        </div>
      </div>

      {deactivated ? (
        <Alert
          type="warning"
          showIcon
          closable
          onClose={() => setDeactivated(false)}
          message="已提交注销申请"
          description="账号进入 30 天冷静期，此期间登录即可撤销。"
        />
      ) : null}
    </div>
  );

  return (
    <SceneFrame url="settings/account" title="账号设置">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-4">
          <h3 className="m-0 text-lg font-semibold text-fg">账号设置</h3>
          <p className="m-0 mt-0.5 text-xs text-fg-tertiary">改动会实时同步到团队内的所有设备。</p>
        </div>

        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            { key: 'profile', label: '个人资料', children: profile },
            { key: 'notices', label: '通知', children: notices },
            { key: 'security', label: '安全', children: security },
          ]}
        />

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-xs text-fg-tertiary">
            {saved ? <span className="text-success">已保存，同步中…</span> : '上次修改：3 天前'}
          </span>
          <div className="flex items-center gap-2">
            <Button size="small">取消</Button>
            <Button size="small" type="primary" onClick={save}>
              保存更改
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={danger}
        onCancel={() => setDanger(false)}
        onOk={() => {
          setDanger(false);
          setDeactivated(true);
        }}
        okText="确认注销"
        cancelText="再想想"
        title="注销账号？"
        okButtonProps={{ danger: true }}
        width={420}
      >
        <p className="m-0 text-sm leading-relaxed text-fg-secondary">
          你的稿件、评论与审批记录会在 30 天后清除。若你负责审批流，需要先移交审批权限。
        </p>
      </Modal>
    </SceneFrame>
  );
}
