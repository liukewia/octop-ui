import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  MessageCircle,
  Package,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import {
  Avatar,
  BottomSheet,
  Button,
  CheckableTag,
  InputNumber,
  Tag,
} from '../../src';
import { SceneFrame, SceneLabel } from './frame';

const COLORS = ['燕麦色', '炭黑', '雾蓝'];
const SIZES = ['S', 'M', 'L', 'XL'];

const REVIEWS = [
  { name: '林小满', text: '版型比想象中宽松，肩线落得刚好，洗过一次没变形。', score: 5 },
  { name: '陈默', text: '颜色比图片灰一点，但更好搭。物流第二天就到了。', score: 4 },
];

export function MobileScene() {
  const [sheet, setSheet] = useState(false);
  const [color, setColor] = useState('燕麦色');
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (text: string) => {
    setToast(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 1800);
  };

  const confirm = (action: 'cart' | 'buy') => {
    setSheet(false);
    flash(action === 'cart' ? '已加入购物车' : '正在为你锁定库存…');
  };

  return (
    <SceneFrame url="m/item/2049" title="移动端商品详情">
      <div className="grid gap-6 lg:grid-cols-[352px_minmax(0,1fr)] lg:items-start">
      <div className="mx-auto w-full max-w-[352px]">
        <div className="relative overflow-hidden rounded-[28px] border border-line-strong bg-surface">
          {/* 状态栏 */}
          <div className="flex h-8 items-center justify-between bg-surface px-4 text-2xs font-medium text-fg">
            <span className="tabular-nums">9:41</span>
            <span className="flex items-center gap-1" aria-hidden>
              <span className="h-2 w-3 rounded-[1px] bg-fg/80" />
              <span className="h-2 w-2 rounded-full bg-fg/80" />
              <span className="h-2 w-4 rounded-[2px] border border-fg/50" />
            </span>
          </div>

          {/* 导航 */}
          <div className="flex h-11 items-center gap-1 border-b border-line-soft px-2">
            <button
              type="button"
              aria-label="返回"
              className="ax-focus inline-flex size-8 items-center justify-center rounded-full text-fg hover:bg-muted"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="min-w-0 flex-1 truncate text-center text-sm font-medium text-fg">商品详情</span>
            <button
              type="button"
              aria-label="分享"
              className="ax-focus inline-flex size-8 items-center justify-center rounded-full text-fg hover:bg-muted"
            >
              <Share2 className="size-4" />
            </button>
          </div>

          <div className="flex h-[560px] flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* 主图 */}
              <div className="relative grid h-[188px] place-items-center bg-canvas">
                <Package className="size-10 text-fg-disabled" />
                <span className="absolute start-3 top-3">
                  <Tag color="blue" filled>
                    秋冬新品
                  </Tag>
                </span>
                <span className="absolute end-3 bottom-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`size-1.5 rounded-full ${i === 0 ? 'bg-accent' : 'bg-line-strong'}`}
                    />
                  ))}
                </span>
              </div>

              <div className="p-3.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-fg tabular-nums">
                    <span className="text-base">¥</span>399
                  </span>
                  <span className="text-xs text-fg-disabled line-through tabular-nums">¥499</span>
                  <span className="ms-auto text-xs text-fg-tertiary">已售 2,180 件</span>
                </div>
                <h3 className="m-0 mt-1.5 text-base font-medium leading-snug text-fg">
                  Cloud Knit 轻羽针织衫
                </h3>
                <p className="m-0 mt-1 text-xs leading-relaxed text-fg-tertiary">
                  14 针细密织法，落肩版型；单穿不扎，内搭不臃肿。
                </p>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  <Tag color="green" icon={<Truck className="size-3" />}>
                    顺丰包邮
                  </Tag>
                  <Tag color="gray" icon={<ShieldCheck className="size-3" />}>
                    7 天无理由
                  </Tag>
                  <Tag color="orange">仅剩 6 件</Tag>
                </div>

                <button
                  type="button"
                  onClick={() => setSheet(true)}
                  className="ax-focus mt-3 flex w-full items-center justify-between gap-2 rounded-container border border-line bg-surface px-3 py-2.5 text-start transition-colors duration-[125ms] ease-standard hover:border-line-strong"
                >
                  <span className="text-xs text-fg-tertiary">
                    已选 <span className="text-fg">{color} · {size} · {qty} 件</span>
                  </span>
                  <ChevronLeft className="size-4 rotate-180 text-fg-tertiary" />
                </button>

                <div className="mt-3 border-t border-line-soft pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-fg">买家评价</span>
                    <span className="flex items-center gap-1 text-xs text-fg-tertiary">
                      <Star className="size-3.5 fill-current text-warning" />
                      4.9 · 128 条
                    </span>
                  </div>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {REVIEWS.map((r) => (
                      <li key={r.name} className="flex items-start gap-2">
                        <Avatar size={24} className="flex-none text-2xs">
                          {r.name.slice(0, 1)}
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-fg">{r.name}</span>
                            <span className="flex" aria-label={`${r.score} 星`}>
                              {Array.from({ length: r.score }).map((_, i) => (
                                <Star key={i} className="size-2.5 fill-current text-warning" />
                              ))}
                            </span>
                          </div>
                          <p className="m-0 mt-0.5 text-xs leading-relaxed text-fg-secondary">{r.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 底部操作条 */}
            <div className="relative border-t border-line bg-surface px-2.5 py-2">
              {toast ? (
                <span className="absolute inset-x-0 -top-9 mx-auto w-max rounded-full bg-accent px-3 py-1 text-2xs font-medium text-on-accent shadow-toast">
                  {toast}
                </span>
              ) : null}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="客服"
                  className="ax-focus flex flex-col items-center gap-0.5 px-1 text-fg-secondary"
                >
                  <MessageCircle className="size-5" />
                  <span className="text-[10px]">客服</span>
                </button>
                <button
                  type="button"
                  aria-label="购物车"
                  className="ax-focus flex flex-col items-center gap-0.5 px-1 text-fg-secondary"
                >
                  <ShoppingCart className="size-5" />
                  <span className="text-[10px]">购物车</span>
                </button>
                <Button size="small" block onClick={() => setSheet(true)} className="flex-1">
                  加入购物车
                </Button>
                <Button size="small" type="primary" block onClick={() => setSheet(true)} className="flex-1">
                  立即购买
                </Button>
              </div>
            </div>
          </div>
        </div>
        <p className="m-0 mt-2 text-center text-2xs text-fg-tertiary">
          真机尺寸 390 × 844 · 底部抽屉可下拉关闭
        </p>
      </div>

      <aside className="hidden min-w-0 lg:block">
        <h4 className="m-0 text-sm font-semibold text-fg">移动端要盯的四件事</h4>
        <p className="m-0 mt-1 text-xs leading-relaxed text-fg-tertiary">
          同一套组件在 390 宽下会变高、变宽，但层级不能跟着变多。
        </p>
        <ol className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
          {[
            {
              title: '触控目标 ≥ 44px',
              desc: '按钮 44、输入框 44，底部操作条整条 64 —— 手指按得准，密度才有意义。',
            },
            {
              title: '主操作钉在拇指区',
              desc: '「立即购买」永远贴着底边，滚动时不跟着内容跑。',
            },
            {
              title: '浮层从下往上',
              desc: '规格选择用 BottomSheet 而不是居中弹窗；抓手下拉超过 96px 松手即关闭。',
            },
            {
              title: '留出安全区',
              desc: '底部条与抽屉都要吃 env(safe-area-inset-bottom)，否则在全面屏上会压到指示条。',
            },
          ].map((n, i) => (
            <li key={n.title} className="flex gap-2.5">
              <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full bg-canvas font-mono text-2xs text-fg-tertiary tabular-nums">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-fg">{n.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-fg-tertiary">{n.desc}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-container bg-canvas p-3 text-xs leading-relaxed text-fg-tertiary">
          点一下「立即购买」或「已选」那一行，底部抽屉会真的推上来；下拉抓手可以关掉。
        </div>
      </aside>

      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        height="auto"
        title="选择规格"
        // 桌面预览时收窄成手机宽度，否则一张 1440 宽的底部抽屉会把内容甩到两端
        className="sm:mx-auto sm:max-w-[440px]"
        footer={
          <div className="grid w-full grid-cols-2 gap-2">
            <Button block size="small" onClick={() => confirm('cart')}>
              加入购物车
            </Button>
            <Button block size="small" type="primary" onClick={() => confirm('buy')}>
              立即购买
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex items-center gap-3">
            <span className="grid size-16 flex-none place-items-center rounded-element bg-canvas text-fg-disabled">
              <Package className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-fg tabular-nums">
                <span className="text-sm">¥</span>399
              </div>
              <div className="mt-0.5 text-xs text-fg-tertiary">
                库存 6 件 · 已选 {color} / {size}
              </div>
            </div>
          </div>

          <div>
            <SceneLabel>颜色</SceneLabel>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <CheckableTag key={c} checked={color === c} onChange={() => setColor(c)}>
                  {c}
                </CheckableTag>
              ))}
            </div>
          </div>

          <div>
            <SceneLabel>尺码</SceneLabel>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((s) => (
                <CheckableTag key={s} checked={size === s} onChange={() => setSize(s)}>
                  {s}
                </CheckableTag>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-fg-secondary">数量</span>
            <InputNumber min={1} max={6} value={qty} onChange={(v) => setQty(v ?? 1)} className="w-[104px]" />
          </div>

          <p className="m-0 flex items-center gap-1.5 text-xs text-fg-tertiary">
            <Check className="size-3.5 text-success" />
            支持 7 天无理由退换，运费险已赠送
          </p>
        </div>
      </BottomSheet>
      </div>
    </SceneFrame>
  );
}
