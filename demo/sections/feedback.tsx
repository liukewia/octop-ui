import { useRef, useState } from 'react';
import { Check, Info, X } from 'lucide-react';
import {
  Alert,
  Button,
  Drawer,
  DrawerFooter,
  Modal,
  Popconfirm,
  Progress,
  Result,
  Spin,
  Text,
  Tour,
  message,
  notification,
} from '../../src';
import { Demo, Hint, Row, Section, Stack } from '../primitives';

export function Feedback() {
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState<'right' | 'bottom' | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const tourBtn = useRef<HTMLButtonElement>(null);
  const tourText = useRef<HTMLSpanElement>(null);

  return (
    <Section
      id="feedback"
      title="反馈"
      api="Modal / message / notification"
      desc="浮层入场 165ms、弹窗 400ms、遮罩 125ms —— 弹窗比浮层慢，因为它更大、信息更多，快了会看不清主次。"
    >
      <Demo label="警告提示" code="Alert type" span="full" dir="column">
        <Alert type="info" showIcon message="这是一条信息提示" />
        <Alert
          type="success"
          showIcon
          message="保存成功"
          description="改动已在 2 秒前同步到全部节点。"
        />
        <Alert
          type="warning"
          showIcon
          message="套餐即将到期"
          description="3 天后自动降级，届时超出配额的项目会进入只读。"
          action={
            <Button size="small" type="primary">
              续费
            </Button>
          }
        />
        <Alert type="error" showIcon closable message="上传失败：文件超过 20MB" />
        <Alert
          type="success"
          icon={<Check size={16} />}
          closeIcon={<X size={14} />}
          closable
          message="图标和关闭按钮都可以换掉"
        />
        <Alert type="info" banner message="banner 形态：贴着容器边缘，没有圆角" />
      </Demo>

      <Demo label="全局提示" code="message.success()" dir="column">
        <Row>
          <Button size="small" onClick={() => message.success('已保存')}>
            成功
          </Button>
          <Button size="small" onClick={() => message.info('正在同步…')}>
            信息
          </Button>
          <Button size="small" onClick={() => message.warning('配额快用完了')}>
            警告
          </Button>
          <Button size="small" onClick={() => message.error('网络断了')}>
            错误
          </Button>
        </Row>
        <Row>
          <Button
            size="small"
            onClick={() => {
              message.loading('上传中…', 1.6);
            }}
          >
            加载
          </Button>
          <Button
            size="small"
            onClick={() => {
              message.open({ content: '同一个 key 会原地更新', key: 'k', duration: 0 });
              window.setTimeout(
                () => message.open({ content: '两秒后变成成功', key: 'k', type: 'success' }),
                1200,
              );
            }}
          >
            key 更新
          </Button>
          <Button size="small" onClick={() => message.destroy()}>
            全部清空
          </Button>
        </Row>
        <Hint>顶部居中，从上方 8px 淡入；同 key 复用同一个节点，不会叠两条。</Hint>
      </Demo>

      <Demo label="通知提醒" code="notification.open()" span="full" dir="column">
        <Row>
          <Button
            size="small"
            onClick={() =>
              notification.success({
                message: '构建完成',
                description: 'main 分支已部署到预发，耗时 42s。',
                btn: (
                  <Button size="small" type="primary">
                    查看日志
                  </Button>
                ),
              })
            }
          >
            带按钮
          </Button>
          <Button
            size="small"
            onClick={() =>
              notification.open({
                title: '新评论',
                description: 'Ada 在你负责的组件下留了言。',
                icon: <Info size={16} />,
              })
            }
          >
            自定义图标
          </Button>
          <Button
            size="small"
            onClick={() =>
              notification.warning({
                message: '磁盘不足',
                description: '剩余 1.2GB，建议清理构建缓存。',
                placement: 'bottomRight',
              })
            }
          >
            右下角
          </Button>
          <Button size="small" onClick={() => notification.destroy()}>
            清空
          </Button>
        </Row>
        <Hint>通知在右上角堆叠，移动端自动变成全宽卡片。</Hint>
      </Demo>

      <Demo label="对话框" code="Modal open / onOk" dir="column">
        <Row>
          <Button type="primary" onClick={() => setOpen(true)}>
            打开对话框
          </Button>
          <Button
            onClick={() =>
              Modal.confirm({
                title: '确认删除这个项目？',
                content: '删除后 30 天内可以在回收站恢复。',
                okText: '删除',
                okButtonProps: { danger: true },

                onOk: () => {
                  message.success('已删除');
                },
              })
            }
          >
            confirm()
          </Button>
          <Button
            onClick={() =>
              Modal.info({
                title: '关于',
                content: 'Octop UI v0.2.0 · 68 个组件',
              })
            }
          >
            info()
          </Button>
        </Row>
        <Hint>
          <code>Modal.xxx</code> 是命令式调用：不写 state，返回 <code>{'{ destroy, update }'}</code>。
        </Hint>
      </Demo>

      <Demo label="异步确认" code="onOk: () => Promise" dir="column">
        <Button
          className="self-start"
          onClick={() => {
            setConfirming(true);
            window.setTimeout(() => {
              setConfirming(false);
              message.success('已发布');
            }, 1400);
          }}
        >
          发布（1.4s）
        </Button>
        <Hint>
          <code>onOk</code> 返回 Promise 时按钮自动进 loading，resolve 后关闭；reject 则保持打开。
        </Hint>
      </Demo>

      <Demo label="抽屉" code="Drawer placement" dir="column">
        <Row>
          <Button size="small" onClick={() => setDrawer('right')}>
            右侧
          </Button>
          <Button size="small" onClick={() => setDrawer('bottom')}>
            底部
          </Button>
        </Row>
        <Hint>右侧 300ms 滑入；底部形态在手机上就是标准的行动面板。</Hint>
      </Demo>

      <Demo label="气泡确认" code="Popconfirm" dir="column">
        <Popconfirm
          title="确认下线？"
          description="下线后用户会看到 404。"
          okText="确认"
          cancelText="取消"
          onConfirm={() => message.success('已下线')}
        >
          <Button danger size="small">
            下线项目
          </Button>
        </Popconfirm>
        <Popconfirm title="这只是个提示" showCancel={false} onConfirm={() => undefined}>
          <Button size="small">只有确定</Button>
        </Popconfirm>
      </Demo>

      <Demo label="进度" code="Progress" span="full" dir="column">
        <Progress percent={68} />
        <Progress percent={100} status="success" />
        <Progress percent={42} status="exception" />
        <Row className="justify-around">
          <Progress type="circle" percent={72} size={88} />
          <Progress type="dashboard" percent={36} size={88} />
          <Progress type="circle" percent={100} size={88} status="success" />
        </Row>
        <Progress percent={60} steps={5} />
      </Demo>

      <Demo label="加载中" code="Spin / Spin children" dir="column">
        <Row className="justify-center">
          <Spin />
          <Spin size="large" />
          <Spin size="small" tip="加载中" />
        </Row>
        <Spin spinning tip="正在拉取报表">
          <div className="rounded-container bg-surface p-4 shadow-[inset_0_0_0_1px_var(--ax-line)]">
            <Stack>
              <Text strong>报表内容</Text>
              <Text type="secondary">包裹 children 时整体降透明度并盖一层居中面板。</Text>
            </Stack>
          </div>
        </Spin>
      </Demo>

      <Demo label="结果页" code="Result status" span="full" dir="block">
        <div className="grid gap-3 sm:grid-cols-3">
          <Result
            status="success"
            title="支付成功"
            subTitle="订单 OC-1042 · ¥428.00"
            extra={
              <Button type="primary" size="small">
                查看订单
              </Button>
            }
          />
          <Result status="warning" title="需要实名" subTitle="完成认证后才能提现。" />
          <Result status="404" title="页面不存在" subTitle="链接可能已失效。" />
        </div>
      </Demo>

      <Demo label="引导" code="Tour steps" span="full" dir="column">
        <Row>
          <Button ref={tourBtn} type="primary" onClick={() => setTourOpen(true)}>
            开始引导
          </Button>
          <Text ref={tourText} type="secondary">
            这是第二个锚点
          </Text>
        </Row>
        <Hint>遮罩用 clip-path 镂空，目标高亮但依然可以点击外部关闭。</Hint>
      </Demo>

      <Modal
        open={open}
        title="编辑项目"
        onCancel={() => setOpen(false)}
        onOk={() => {
          setOpen(false);
          message.success('已保存');
        }}
      >
        <Stack>
          <Text type="secondary">窄屏（≤640px）时这个对话框会自动变成底部抽屉。</Text>
          <Text type="secondary">Esc 关闭、点遮罩关闭、关闭后焦点回到触发按钮。</Text>
        </Stack>
      </Modal>

      <Modal
        open={confirming}
        title="发布到生产"
        confirmLoading
        onCancel={() => setConfirming(false)}
        onOk={() => undefined}
      >
        <Text type="secondary">正在上传 42 个文件…</Text>
      </Modal>

      <Drawer
        open={drawer !== null}
        placement={drawer ?? 'right'}
        title="筛选"
        onClose={() => setDrawer(null)}
        footer={
          <DrawerFooter
            onOk={() => setDrawer(null)}
            onCancel={() => setDrawer(null)}
            okText="应用"
          />
        }
      >
        <Stack>
          <Text type="secondary">抽屉内容区独立滚动，头部与底部固定。</Text>
          <Stack className="gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Text key={i}>筛选项 {i + 1}</Text>
            ))}
          </Stack>
        </Stack>
      </Drawer>

      <Tour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
          setTourOpen(false);
          message.success('引导结束');
        }}
        steps={[
          {
            title: '第一步',
            description: '点这里开始引导，遮罩只会挖掉目标区域。',
            target: () => tourBtn.current,
            placement: 'bottom',
          },
          {
            title: '第二步',
            description: '第二个锚点，位置自动翻转，不会被视口裁掉。',
            target: () => tourText.current,
            placement: 'top',
          },
        ]}
      />
    </Section>
  );
}
