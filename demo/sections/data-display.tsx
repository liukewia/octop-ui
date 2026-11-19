import { useState } from 'react';
import dayjs from 'dayjs';
import { Bell, ChevronRight, Star } from 'lucide-react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Calendar,
  Card,
  Carousel,
  Collapse,
  Descriptions,
  Empty,
  Image,
  List,
  Popover,
  Skeleton,
  Statistic,
  Table,
  Tag,
  Text,
  Timeline,
  Tooltip,
  Tree,
  Watermark,
  type ColumnType,
  type Key,
} from '../../src';
import { Demo, Hint, Row, Section, Stack } from '../primitives';

interface Order {
  key: string;
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

const ORDERS: Order[] = [
  { key: '1', id: 'OC-1042', customer: '林小满', amount: 428, status: 'paid', createdAt: '2026-11-18' },
  { key: '2', id: 'OC-1041', customer: '周野', amount: 1299, status: 'pending', createdAt: '2026-11-18' },
  { key: '3', id: 'OC-1040', customer: '陈拾', amount: 86, status: 'failed', createdAt: '2026-11-17' },
  { key: '4', id: 'OC-1039', customer: '苏木', amount: 3180, status: 'paid', createdAt: '2026-11-16' },
];

const STATUS_TAG: Record<Order['status'], { color: string; label: string }> = {
  paid: { color: 'green', label: '已支付' },
  pending: { color: 'yellow', label: '待支付' },
  failed: { color: 'red', label: '失败' },
};

const TREE_DATA = [
  {
    key: '0',
    title: '设计系统',
    children: [
      { key: '0-0', title: '令牌' },
      { key: '0-1', title: '动效' },
      {
        key: '0-2',
        title: '组件',
        children: [
          { key: '0-2-0', title: 'Button' },
          { key: '0-2-1', title: 'Select' },
        ],
      },
    ],
  },
  {
    key: '1',
    title: '业务页面',
    children: [
      { key: '1-0', title: '首页' },
      { key: '1-1', title: '订单' },
    ],
  },
];

const DEADLINE = Date.now() + 1000 * 60 * 60 * 3 - 1000 * 60 * 42;

const GALLERY = [
  'linear-gradient(135deg,#dbeafe,#bfdbfe)',
  'linear-gradient(135deg,#fce7f3,#fbcfe8)',
  'linear-gradient(135deg,#dcfce7,#bbf7d0)',
];

function gradientSrc(background: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><foreignObject width="480" height="320"><div xmlns="http://www.w3.org/1999/xhtml" style="width:480px;height:320px;display:flex;align-items:center;justify-content:center;background:${background};font:600 20px system-ui;color:#1b1b1b">${label}</div></foreignObject></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function DataDisplay() {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const columns: ColumnType<Order>[] = [
    { title: '订单号', dataIndex: 'id', sorter: (a, b) => a.id.localeCompare(b.id) },
    { title: '客户', dataIndex: 'customer' },
    {
      title: '金额',
      dataIndex: 'amount',
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => <Text className="tabular-nums">¥{Number(v).toLocaleString()}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        { text: '已支付', value: 'paid' },
        { text: '待支付', value: 'pending' },
        { text: '失败', value: 'failed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (v) => {
        const s = STATUS_TAG[v as Order['status']];
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    { title: '创建时间', dataIndex: 'createdAt' },
  ];

  return (
    <Section
      id="data-display"
      title="数据展示"
      api="Table / Tag / List / Descriptions"
      desc="表格、列表这类高密度信息用 14px；正文用 15px。表头不加底色块，只靠字重和一条 8% 描边。"
    >
      <Demo label="表格" code="columns / sorter / filters" span="full" dir="block">
        <Table
          columns={columns}
          dataSource={ORDERS}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
          pagination={{ current: 1, pageSize: 4, total: ORDERS.length }}
          expandable={{
            expandedRowRender: (record) => (
              <Text type="secondary" className="!text-xs">
                {record.customer} 的订单 {record.id} 展开后的明细区。
              </Text>
            ),
          }}
        />
        <Hint>
          排序三态、筛选弹层、行选择与展开都是自研的；<code>onChange(pagination, filters, sorter)</code>
          与 antd 同签名。
        </Hint>
      </Demo>

      <Demo label="标签与徽标" code="Tag / Badge" dir="column">
        <Row>
          <Tag>默认</Tag>
          <Tag color="blue">blue</Tag>
          <Tag color="green">green</Tag>
          <Tag color="red">red</Tag>
          <Tag color="purple">purple</Tag>
        </Row>
        <Row>
          <Tag closable onClose={() => undefined}>
            可关闭
          </Tag>
          <Tag color="green" filled>
            实心
          </Tag>
          <Tag color="processing">processing → green</Tag>
        </Row>
        <Row>
          <Badge count={5}>
            <Button size="small">消息</Button>
          </Badge>
          <Badge dot>
            <Bell size={18} />
          </Badge>
          <Badge count={120} overflowCount={99}>
            <div className="grid h-8 w-24 place-items-center rounded-element bg-muted text-xs text-fg-secondary">
              收件箱
            </div>
          </Badge>
          <Badge status="processing" text="进行中" />
          <Badge status="error" text="失败" />
        </Row>
      </Demo>

      <Demo label="头像" code="Avatar / AvatarGroup" dir="column">
        <Row>
          <Avatar size={32}>林</Avatar>
          <Avatar size="large" shape="square">
            周
          </Avatar>
          <Avatar size="small" icon={<Star size={12} />} />
          <Avatar src={gradientSrc(GALLERY[0], '林')} alt="头像" />
        </Row>
        <AvatarGroup maxCount={3}>
          <Avatar>林</Avatar>
          <Avatar>周</Avatar>
          <Avatar>陈</Avatar>
          <Avatar>苏</Avatar>
          <Avatar>吴</Avatar>
        </AvatarGroup>
      </Demo>

      <Demo label="列表" code="List / List.Item.Meta" span="full" dir="block">
        <List
          bordered
          dataSource={[
            { title: '把 antd 迁到 Octop', desc: '换 import + 引一次 CSS', avatar: '林' },
            { title: '补齐 55 个组件', desc: '表单、表格、日期都自研', avatar: '周' },
            { title: '按 C 端调控件高度', desc: '粗指针设备自动到 44', avatar: '陈' },
          ]}
          renderItem={(item: { title: string; desc: string; avatar: string }) => (
            <List.Item
              actions={[
                <Button key="e" type="link" size="small">
                  编辑
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar size={32}>{item.avatar}</Avatar>}
                title={item.title}
                description={item.desc}
              />
            </List.Item>
          )}
        />
      </Demo>

      <Demo label="描述列表" code="Descriptions bordered" span="full" dir="block">
        <Descriptions
          title="订单信息"
          bordered
          column={2}
          items={[
            { key: '1', label: '订单号', children: 'OC-1042' },
            { key: '2', label: '客户', children: '林小满' },
            { key: '3', label: '金额', children: '¥428.00' },
            { key: '4', label: '支付方式', children: '微信支付' },
            { key: '5', label: '收货地址', children: '杭州市西湖区文三路 100 号', span: 2 },
          ]}
        />
      </Demo>

      <Demo label="折叠面板" code="Collapse items" dir="column">
        <Collapse
          defaultActiveKey={['1']}
          items={[
            {
              key: '1',
              label: '为什么表格不用虚拟滚动',
              children: (
                <Text type="secondary">
                  业务里一页最多 50 行，虚拟滚动的测量成本比它省下的 DOM 更贵。数据量大时用分页。
                </Text>
              ),
            },
            {
              key: '2',
              label: '浮层为什么不用 Portal 套 Portal',
              children: <Text type="secondary">定位根节点不挂 transform，避免 scale 被放大成位移。</Text>,
            },
            {
              key: '3',
              label: '禁用的面板',
              disabled: true,
              children: '打不开',
            },
          ]}
        />
      </Demo>

      <Demo label="时间轴" code="Timeline mode" dir="column">
        <Timeline
          items={[
            { children: '提交需求', label: '09:12' },
            { children: '评审通过', color: 'green', label: '10:30' },
            { children: <Text type="secondary">等待开发排期</Text>, dot: <ChevronRight size={12} /> },
            { children: '已上线', color: 'green' },
          ]}
        />
      </Demo>

      <Demo label="树" code="Tree checkable" dir="column">
        <Tree treeData={TREE_DATA} defaultExpandAll defaultSelectedKeys={['0-1']} blockNode />
        <Tree treeData={TREE_DATA} checkable defaultExpandAll defaultCheckedKeys={['0-1']} />
      </Demo>

      <Demo label="统计数值" code="Statistic / Countdown" dir="column">
        <Row className="justify-between">
          <Statistic title="今日 GMV" value={128430.5} precision={2} prefix="¥" />
          <Statistic title="转化率" value={4.28} precision={2} suffix="%" />
        </Row>
        <Row className="justify-between">
          <Statistic title="待处理" value={128} loading={false} />
          <Statistic.Countdown title="活动倒计时" value={DEADLINE} />
        </Row>
      </Demo>

      <Demo label="提示与浮层" code="Tooltip / Popover" dir="column">
        <Row className="justify-center">
          <Tooltip title="上方的解释" placement="top">
            <Button size="small">hover 我</Button>
          </Tooltip>
          <Tooltip title="右侧" placement="right">
            <Button size="small">右侧</Button>
          </Tooltip>
          <Popover title="浮层标题" content="浮层内容可以放任意节点，没有箭头。">
            <Button size="small">点开浮层</Button>
          </Popover>
        </Row>
        <Hint>Tooltip 用反相墨色底，所以在深色模式下自动变浅底深字。</Hint>
      </Demo>

      <Demo label="空态与骨架" code="Empty / Skeleton" dir="column">
        <Empty />
        <Empty variant="simple" description="没有更多了" />
        <Skeleton avatar title paragraph={{ rows: 2 }} active />
      </Demo>

      <Demo label="图片" code="Image preview" dir="column">
        <Row className="justify-center">
          {GALLERY.map((g, i) => (
            <Image
              key={g}
              src={gradientSrc(g, `图 ${i + 1}`)}
              width={112}
              height={76}
              className="rounded-element object-cover"
              preview
            />
          ))}
        </Row>
        <Hint>点击放大走 Dialog 全屏预览，Esc / 点背景关闭。</Hint>
      </Demo>

      <Demo label="走马灯" code="Carousel autoplay" span="full" dir="block">
        <Carousel autoplay autoplaySpeed={3200} className="overflow-hidden rounded-container">
          {GALLERY.map((g, i) => (
            <div
              key={g}
              className="flex h-[168px] items-center justify-center text-xl font-semibold text-fg"
              style={{ background: g }}
            >
              第 {i + 1} 屏
            </div>
          ))}
        </Carousel>
      </Demo>

      <Demo label="日历" code="Calendar dateCellRender" span="full" dir="block">
        <Card variant="borderless" className="!bg-canvas">
          <Calendar
            defaultValue={dayjs('2026-11-18')}
            fullscreen={false}
            dateCellRender={(date) =>
              date.date() % 7 === 0 ? <Tag color="blue">有排期</Tag> : null
            }
          />
        </Card>
      </Demo>

      <Demo label="水印" code="Watermark" span="full" dir="block">
        <Watermark content="Octop UI · 内部预览" gap={[48, 48]} font={{ fontSize: 12, color: '#9a9a9a' }}>
          <div className="rounded-container bg-surface p-6 shadow-[inset_0_0_0_1px_var(--ax-line)]">
            <Stack>
              <Text strong>受保护的内容</Text>
              <Text type="secondary">
                水印用内联 SVG data-URI 平铺，不依赖 canvas —— 所以截图工具、SSR 与打印都稳定。
              </Text>
            </Stack>
          </div>
        </Watermark>
      </Demo>
    </Section>
  );
}
