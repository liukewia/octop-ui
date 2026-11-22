import { useEffect, useMemo, useState } from 'react';
import { Check, Package, Plus, ShieldCheck, Truck } from 'lucide-react';
import {
  Button,
  Checkbox,
  InputNumber,
  Modal,
  RadioGroup,
  Result,
  Select,
  Spin,
  Statistic,
  Steps,
  Tag,
} from '../../src';
import { useIsMobile } from '../../src/lib/hooks';
import { SceneFrame, SceneLabel, ScenePanel } from './frame';

const ITEMS = [
  { key: 'p1', name: 'Cloud Knit 轻羽针织衫', spec: '燕麦色 / M', price: 399 },
  { key: 'p2', name: 'Canvas Tote 帆布托特包', spec: '炭黑 / 均码', price: 259 },
];

const COUPONS = [
  { label: '不使用优惠券', value: 'none' },
  { label: '新人立减 ¥50', value: 'c50' },
  { label: '满 900 减 ¥120', value: 'c120' },
];

const COUPON_VALUE: Record<string, number> = { none: 0, c50: 50, c120: 120 };

const ADDRESSES = [
  { label: '家 · 徐汇区田林路 200 号 3 栋 502', value: 'home' },
  { label: '公司 · 静安区南京西路 1266 号 18F', value: 'office' },
];

const SHIPPING = [
  { label: '标准配送 · 免运费', value: 'std' },
  { label: '次日达 · ¥18', value: 'next' },
];

const PAYMENTS = [
  { label: '微信支付', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: '银行卡', value: 'card' },
];

export function CheckoutScene() {
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState<Record<string, number>>({ p1: 1, p2: 2 });
  const [addr, setAddr] = useState('home');
  const [ship, setShip] = useState('std');
  const [pay, setPay] = useState('wechat');
  const [coupon, setCoupon] = useState('c120');
  const [points, setPoints] = useState(true);
  const [confirm, setConfirm] = useState(false);
  // 窄屏一行只放得下三个圆圈，这里只留标题，描述会让「收件地址」折成两行
  const isMobile = useIsMobile();

  useEffect(() => {
    if (step !== 1) return;
    const t = window.setTimeout(() => setStep(2), 1400);
    return () => window.clearTimeout(t);
  }, [step]);

  const { subtotal, count } = useMemo(() => {
    let sum = 0;
    let n = 0;
    ITEMS.forEach((it) => {
      const q = qty[it.key] ?? 1;
      sum += it.price * q;
      n += q;
    });
    return { subtotal: sum, count: n };
  }, [qty]);

  const shipFee = ship === 'next' ? 18 : 0;
  const discount = COUPON_VALUE[coupon] ?? 0;
  const pointCut = points ? 12 : 0;
  const total = subtotal + shipFee - discount - pointCut;

  const reset = () => {
    setStep(0);
    setConfirm(false);
  };

  return (
    <SceneFrame url="checkout" title="下单结算">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-5 rounded-container border border-line bg-surface px-4 py-4">
          <Steps
            current={step}
            size="small"
            items={
              isMobile
                ? [{ title: '确认' }, { title: '支付' }, { title: '完成' }]
                : [
                    { title: '确认订单', description: '收件地址' },
                    { title: '支付', description: '支付方式' },
                    { title: '完成', description: '短信通知' },
                  ]
            }
          />
        </div>

        {step === 2 ? (
          <ScenePanel className="py-6">
            <Result
              status="success"
              title="支付成功"
              subTitle={`订单号 OCT202611220087 · 实付 ¥${total.toFixed(2)}`}
              extra={
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button size="small" type="primary">
                    查看订单
                  </Button>
                  <Button size="small" onClick={reset}>
                    继续购物
                  </Button>
                </div>
              }
            />
          </ScenePanel>
        ) : step === 1 ? (
          <ScenePanel className="grid min-h-[320px] place-items-center p-8">
            <div className="text-center">
              <Spin size="large" />
              <p className="m-0 mt-3 text-sm text-fg-secondary">正在唤起{pay === 'wechat' ? '微信支付' : pay === 'alipay' ? '支付宝' : '银行卡支付'}…</p>
              <p className="m-0 mt-1 text-xs text-fg-tertiary">请勿关闭页面</p>
            </div>
          </ScenePanel>
        ) : (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_268px]">
            <div className="flex min-w-0 flex-col gap-3">
              <ScenePanel className="p-4">
                <SceneLabel extra={<Button size="small" type="text">管理地址</Button>}>收货地址</SceneLabel>
                <RadioGroup value={addr} onChange={(e) => setAddr(String(e.target.value))} options={ADDRESSES} />
                <div className="mt-3 flex items-center gap-2 rounded-container bg-canvas px-3 py-2 text-xs text-fg-tertiary">
                  <Truck className="size-3.5 flex-none" />
                  预计 {ship === 'next' ? '明天 18:00 前' : '11 月 25 日'} 送达 · 可修改配送时间
                </div>
              </ScenePanel>

              <ScenePanel className="p-4">
                <SceneLabel extra={`${count} 件商品`}>商品清单</SceneLabel>
                <ul className="m-0 flex list-none flex-col p-0">
                  {ITEMS.map((it) => (
                    <li
                      key={it.key}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line-soft py-3 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <span className="grid size-14 flex-none place-items-center rounded-element bg-canvas text-fg-disabled">
                        <Package className="size-5" />
                      </span>
                      <span className="min-w-[140px] flex-1">
                        <span className="block text-sm font-medium text-fg">{it.name}</span>
                        <span className="mt-0.5 block text-xs text-fg-tertiary">{it.spec}</span>
                      </span>
                      {/* 窄屏这一组整体折到第二行，靠右对齐，别把商品名挤成「Clou…」 */}
                      <span className="ms-auto flex flex-none items-center gap-3">
                        <InputNumber
                          size="small"
                          min={1}
                          max={9}
                          value={qty[it.key] ?? 1}
                          onChange={(v) => setQty((q) => ({ ...q, [it.key]: v ?? 1 }))}
                          className="w-[88px]"
                        />
                        <span className="w-16 text-end text-sm text-fg tabular-nums">
                          ¥{(it.price * (qty[it.key] ?? 1)).toFixed(2)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Button size="small" type="dashed" icon={<Plus className="size-3.5" />} className="mt-3">
                  添加备注
                </Button>
              </ScenePanel>

              <ScenePanel className="p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <div className="mb-2 text-sm font-semibold text-fg">配送方式</div>
                    <RadioGroup value={ship} onChange={(e) => setShip(String(e.target.value))} options={SHIPPING} />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 text-sm font-semibold text-fg">支付方式</div>
                    <RadioGroup value={pay} onChange={(e) => setPay(String(e.target.value))} options={PAYMENTS} />
                  </div>
                </div>
              </ScenePanel>
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <ScenePanel className="p-4">
                <SceneLabel>金额明细</SceneLabel>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-2 text-fg-secondary">
                    <span>商品小计</span>
                    <span className="tabular-nums">¥{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-fg-secondary">
                    <span>运费</span>
                    <span className="tabular-nums">{shipFee ? `¥${shipFee.toFixed(2)}` : '免运费'}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-fg-secondary">
                    <span>优惠券</span>
                    <span className="tabular-nums text-success">-¥{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-fg-secondary">
                    <span>积分抵扣</span>
                    <span className="tabular-nums text-success">-¥{pointCut.toFixed(2)}</span>
                  </div>
                </div>

                <div className="my-3 border-t border-line" />

                <div className="mb-3">
                  <Select
                    size="small"
                    options={COUPONS}
                    value={coupon}
                    onChange={(v) => setCoupon(v as string)}
                    className="w-full"
                  />
                </div>
                <Checkbox checked={points} onChange={(e) => setPoints(e.target.checked)}>
                  <span className="text-xs text-fg-secondary">使用 1,200 积分抵 ¥12</span>
                </Checkbox>

                <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-line pt-3">
                  <span className="text-sm text-fg-secondary">应付</span>
                  <Statistic value={total} precision={2} prefix="¥" valueStyle={{ fontSize: 24 }} className="text-end" />
                </div>

                <Button type="primary" block className="mt-3" onClick={() => setConfirm(true)}>
                  提交订单
                </Button>
                <p className="m-0 mt-2 flex items-center justify-center gap-1 text-2xs text-fg-tertiary">
                  <ShieldCheck className="size-3" />
                  支付信息已加密 · 支持 7 天无理由
                </p>
              </ScenePanel>

              <ScenePanel className="flex items-start gap-2 p-3">
                <Tag color="green" icon={<Check className="size-3" />}>
                  已享会员价
                </Tag>
                <span className="text-xs leading-relaxed text-fg-tertiary">
                  本单可返 68 积分，预计 11 月 24 日到账。
                </span>
              </ScenePanel>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={confirm}
        onCancel={() => setConfirm(false)}
        onOk={() => {
          setConfirm(false);
          setStep(1);
        }}
        title="确认提交订单"
        okText="去支付"
        cancelText="再看看"
        width={400}
        okButtonProps={{ type: 'primary' }}
      >
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-fg-tertiary">收货地址</span>
            <span className="text-end text-fg">{ADDRESSES.find((a) => a.value === addr)?.label}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-fg-tertiary">商品件数</span>
            <span className="text-fg tabular-nums">{count} 件</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-fg-tertiary">实付金额</span>
            <span className="font-semibold text-fg tabular-nums">¥{total.toFixed(2)}</span>
          </div>
        </div>
      </Modal>
    </SceneFrame>
  );
}
