import { Demo, Hint, Row, Section, Stack } from '../primitives';
import { Button, Tag } from '../../src';
import { useLiveTokens } from '../live-tokens';

const SURFACES = [
  { name: 'bg', value: 'var(--ax-bg)', note: '页面' },
  { name: 'surface', value: 'var(--ax-surface)', note: '卡片' },
  { name: 'canvas', value: 'var(--ax-canvas)', note: '画布 / 输入底' },
  { name: 'muted', value: 'var(--ax-muted)', note: '悬停' },
  { name: 'line', value: 'var(--ax-line-strong)', note: '描边' },
  { name: 'accent', value: 'var(--ax-accent)', note: '主色' },
];

const HUES = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
] as const;

const TYPE = [
  { name: '4xl', size: 42, sample: '页面标题' },
  { name: '3xl', size: 29, sample: '小节标题' },
  { name: 'lg', size: 17, sample: '导语 / 说明' },
  { name: 'md', size: 15, sample: '正文' },
  { name: 'base', size: 14, sample: '控件 / 表格' },
  { name: 'xs', size: 12, sample: '元信息' },
];

const CLOCKS = [
  { token: '120ms', use: '提示入场' },
  { token: '125ms', use: '遮罩淡入淡出' },
  { token: '180ms', use: '菜单与选择器入场' },
  { token: '220ms', use: '标签页指示器' },
  { token: '240ms', use: '弹窗入场、分段滑块' },
  { token: '280ms', use: '抽屉入场' },
];

export function Foundations() {
  const { radius } = useLiveTokens();

  return (
    <Section
      id="foundations"
      title="设计基座"
      api="--ax-*"
      desc="颜色、圆角和控件尺寸可在主题编辑器中调整。"
    >
      <Demo label="面与线" code="bg-surface / border-line" dir="block">
        <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-6">
          {SURFACES.map((s) => (
            <div key={s.name} className="min-w-0">
              <div
                className="h-12 w-full rounded-element shadow-[inset_0_0_0_1px_var(--ax-line)]"
                style={{ background: s.value }}
              />
              <div className="mt-1.5 truncate font-mono text-[11px] text-fg-tertiary">{s.name}</div>
              <div className="truncate text-[11px] text-fg-disabled">{s.note}</div>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="十色板" code="Tag / Badge" dir="block">
        <div className="grid w-full grid-cols-2 gap-2">
          {HUES.map((hue) => (
            <div
              key={hue}
              className="flex items-center justify-between gap-2 rounded-element px-2.5 py-1.5 font-mono text-[11px]"
              style={{
                background: `var(--ax-hue-${hue}-bg)`,
                color: `var(--ax-hue-${hue}-fg)`,
              }}
            >
              <span>{hue}</span>
              <span className="opacity-70">bg / fg</span>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="字阶" code="--text-*" dir="block">
        <Stack className="gap-1">
          {TYPE.map((t) => (
            <div key={t.name} className="flex items-baseline gap-3">
              <span className="w-14 shrink-0 font-mono text-[11px] text-fg-disabled">
                {t.size}px
              </span>
              <span className="truncate text-fg" style={{ fontSize: t.size, lineHeight: 1.3 }}>
                {t.sample}
              </span>
            </div>
          ))}
        </Stack>
      </Demo>

      <Demo label="形状" code={`radius ${radius.join(' / ')}`} dir="block">
        <Row className="items-end">
          {[
            { r: 'var(--ax-radius-inner)', n: `inner ${radius[0]}` },
            { r: 'var(--ax-radius-element)', n: `element ${radius[1]}` },
            { r: 'var(--ax-radius-container)', n: `container ${radius[2]}` },
            { r: 'var(--ax-radius-page)', n: `page ${radius[3]}` },
          ].map((x) => (
            <Stack key={x.n} className="w-auto items-center gap-1.5">
              <div
                className="size-14 bg-muted shadow-[inset_0_0_0_1px_var(--ax-line)]"
                style={{ borderRadius: x.r }}
              />
              <span className="font-mono text-[11px] text-fg-disabled">{x.n}</span>
            </Stack>
          ))}
        </Row>
      </Demo>

      <Demo label="动画时长" span="full" dir="block">
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {CLOCKS.map((c) => (
            <div key={c.token} className="flex items-baseline gap-2">
              <span className="w-12 shrink-0 font-mono text-[11px] text-fg tabular-nums">
                {c.token}
              </span>
              <span className="truncate text-xs text-fg-tertiary">{c.use}</span>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="焦点样式" code=".ax-field / .ax-focus" span="full" dir="block">
        <Row className="items-start">
          <Stack className="w-auto max-w-[300px] gap-2">
            <span className="text-xs text-fg-tertiary">文本类：描边加深 + 内阴影，没有外环</span>
            <div className="ax-field h-[var(--ax-h-md)] rounded-element bg-surface px-3 text-base text-fg">
              <input
                defaultValue="聚焦看这里"
                aria-label="文本类焦点示例"
                className="h-full w-full border-0 bg-transparent text-base outline-0"
              />
            </div>
          </Stack>
          <Stack className="w-auto max-w-[300px] gap-2">
            <span className="text-xs text-fg-tertiary">其余控件：2px 外环 + 3px 偏移</span>
            <Button className="ax-focus">Tab 到我身上</Button>
          </Stack>
        </Row>
      </Demo>

      <Demo label="按压语法" code=".ax-press" span="full">
        <Stack className="w-auto items-center gap-2">
          <Button type="primary">按住看叠色</Button>
          <Hint>按下时加深底色，松开后在 125ms 内恢复。</Hint>
        </Stack>
        <Stack className="w-auto items-center gap-2">
          <Row className="justify-center">
            <Tag color="red">red</Tag>
            <Tag color="yellow">yellow</Tag>
            <Tag color="green">green</Tag>
            <Tag color="blue">blue</Tag>
            <Tag color="purple">purple</Tag>
          </Row>
          <Hint>浅色底搭配同色系深色文字。</Hint>
        </Stack>
      </Demo>
    </Section>
  );
}
