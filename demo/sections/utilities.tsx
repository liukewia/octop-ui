import { useState, type CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button, Checkbox, Tag } from '../../src';
import { cn } from '../../src/lib/cn';
import { Demo, Hint, Section } from '../primitives';

const MESSAGES = [
  { who: '林一', text: '结算页的地址校验改完了，顺手把空态也补上了。' },
  { who: '周舟', text: '收到，我这边跑一遍回归。' },
  { who: '林一', text: '顺便问一下，优惠券那块是谁在改？' },
  { who: '陈默', text: '我。今天会提 PR，先给你一个预览链接。' },
  { who: '周舟', text: '回归过了，两笔订单的问题没再出现。' },
  { who: '林一', text: '好，那我把这个工单关掉。' },
  { who: '陈默', text: '等一下，我想把退款文案也一起改了。' },
  { who: '周舟', text: '那我先不改分支，等你合完再跑一遍。' },
  { who: '林一', text: '记得把埋点一起加上，运营要看转化。' },
  { who: '陈默', text: '埋点已经在 PR 里了，事件名对过表。' },
  { who: '周舟', text: '收到，明早我再看一版。' },
  { who: '林一', text: '今天的同步就到这里，辛苦。' },
];

const TAGS = [
  'Design',
  'Engineering',
  'Marketing',
  'Product',
  'Research',
  'Sales',
  'Support',
  'Operations',
  'Finance',
  'Legal',
  'People',
  'Security',
];

function MiniScroller({ className, items }: { className?: string; items: string[] }) {
  return (
    <div className="w-full overflow-hidden rounded-element border border-line">
      <ul className={cn('m-0 max-h-[132px] list-none overflow-y-auto p-0', className)}>
        {items.map((item) => (
          <li
            key={item}
            className="border-b border-line px-3 py-2 text-sm text-fg-secondary last:border-b-0"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Utilities() {
  const [fade, setFade] = useState(true);
  const [seed, setSeed] = useState(0);

  return (
    <Section
      id="utilities"
      title="工具类"
      api="scroll-fade / shimmer"
      desc="两个纯 CSS 的工具类：一个让滚动容器的边缘淡出，一个让「正在进行」的文字扫一道光。都不挂脚本、不写滚动监听。"
    >
      <Demo label="scroll-fade：纵向" code=".scroll-fade" span="full" dir="column">
        <div className="grid w-full gap-5 sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="overflow-hidden rounded-container border border-line">
              <ul
                className={cn(
                  'm-0 max-h-[232px] list-none overflow-y-auto p-0',
                  // 关掉时把 scroll-fade-none 叠在同一串类名上，验证它任何顺序都能压掉遮罩
                  fade ? 'scroll-fade' : 'scroll-fade scroll-fade-none',
                )}
              >
                {MESSAGES.map((m) => (
                  <li key={m.who + m.text} className="border-b border-line px-3 py-2 last:border-b-0">
                    <div className="text-xs text-fg-tertiary">{m.who}</div>
                    <div className="text-sm leading-relaxed text-fg">{m.text}</div>
                  </li>
                ))}
              </ul>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-fg-secondary">
              <Checkbox checked={fade} onChange={(e) => setFade(e.target.checked)} />
              启用渐隐
            </label>
          </div>

          <div className="flex min-w-0 flex-col gap-3 text-sm leading-relaxed text-fg-secondary">
            <p className="m-0">滚动时三个状态是连着的：</p>
            <ol className="m-0 flex list-none flex-col gap-2 p-0">
              {[
                ['静止', '起始边清晰，结束边渐隐，暗示下面还有'],
                ['滚动中', '起始边渐显，两端同时留一点雾'],
                ['到底', '结束边收回到 0，重新变清晰'],
              ].map(([label, text], i) => (
                <li key={label} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] text-fg-tertiary">
                    {i + 1}
                  </span>
                  <span>
                    <span className="text-fg">{label}</span>
                    <span className="text-fg-tertiary"> · {text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="m-0 text-fg-tertiary">
              遮罩写在 <code>mask-image</code> 上，淡掉的是内容本身，换背景不用改色；深度默认
              <code> min(12%, 40px)</code>，用 <code>--scroll-fade-size</code> 可以改。
            </p>
            <pre className="m-0 mt-auto whitespace-pre-wrap break-words rounded-element bg-muted px-3 py-2 font-mono text-xs leading-relaxed text-fg-secondary">
              {'<div className="scroll-fade max-h-[232px] overflow-y-auto">'}
            </pre>
            <p className="m-0 text-xs text-fg-tertiary">
              内容不溢出就不会淡，所以可以无脑加在列表上，不必先量高度。
            </p>
          </div>
        </div>
      </Demo>

      <Demo label="scroll-fade-x：横向" code=".scroll-fade-x" dir="column">
        <div className="scroll-fade-x flex w-full gap-2 overflow-x-auto pb-1">
          {TAGS.map((t) => (
            <Tag key={t} className="shrink-0">
              {t}
            </Tag>
          ))}
        </div>
        <Hint>
          起始边清晰、结束边淡出；行内方向跟着 <code>dir</code> 镜像，RTL 自动换成左边淡。
        </Hint>
      </Demo>

      <Demo label="单边与尺寸" code=".scroll-fade-b / .scroll-fade-24" dir="column">
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <MiniScroller
              className="scroll-fade-b"
              items={['Inbox triage', 'Design review', 'API contract', 'QA pass', 'Launch notes']}
            />
            <span className="text-xs text-fg-tertiary">scroll-fade-b</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <MiniScroller
              className="scroll-fade-24"
              items={['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']}
            />
            <span className="text-xs text-fg-tertiary">scroll-fade-24（96px 深）</span>
          </div>
        </div>
        <Hint>
          单边只让一侧跟滚动；尺寸按间距刻度走（<code>scroll-fade-24</code> = 96px），
          也可以直接给 <code>--scroll-fade-size</code> 或 <code>--scroll-fade-b-size</code> 任意值。
        </Hint>
      </Demo>

      <Demo label="shimmer：进行中" code=".shimmer" span="full" dir="column">
        <div className="grid w-full gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col justify-center gap-2 rounded-element bg-muted px-6 py-6">
            <p className="shimmer m-0 text-2xl font-medium text-fg">正在生成回答…</p>
            <span className="text-[11px] text-fg-tertiary">shimmer（默认 2s / 20°）</span>
          </div>

          <div className="grid min-w-0 gap-3">
            <div className="flex min-w-0 flex-col gap-1 rounded-element bg-muted px-4 py-3">
              <p className="shimmer shimmer-duration-1000 m-0 text-base text-fg">正在读取 4 个文件…</p>
              <span className="text-[11px] text-fg-tertiary">shimmer-duration-1000</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1 rounded-element bg-muted px-4 py-3">
              <p
                className="shimmer m-0 text-base text-fg"
                style={{ '--shimmer-color': 'var(--ax-accent)' } as CSSProperties}
              >
                正在调用工具…
              </p>
              <span className="text-[11px] text-fg-tertiary">--shimmer-color: var(--ax-accent)</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1 rounded-element bg-muted px-4 py-3">
              <p className="shimmer shimmer-angle-45 m-0 text-base text-fg">正在整理要点…</p>
              <span className="text-[11px] text-fg-tertiary">shimmer-angle-45</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="small" icon={<RotateCcw className="size-3.5" />} onClick={() => setSeed((s) => s + 1)}>
            重播一次
          </Button>
          <p
            key={seed}
            className="shimmer shimmer-once shimmer-duration-1200 m-0 text-base text-fg-secondary"
          >
            回答已生成。
          </p>
          <span className="text-[11px] text-fg-tertiary">shimmer-once + shimmer-duration-1200</span>
        </div>

        <Hint>
          高光由文字色与白色混合而来，浅色模式提亮、深色模式自动更亮；<code>prefers-reduced-motion</code>
          下直接回到普通文字。<code>shimmer-none</code> 可以按状态关掉。
        </Hint>
      </Demo>
    </Section>
  );
}
