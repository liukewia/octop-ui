import { useState } from 'react';
import { ArrowUp, Home, MessageCircle, Plus, Settings, Share2 } from 'lucide-react';
import {
  Anchor,
  Breadcrumb,
  Button,
  Dropdown,
  FloatButton,
  Menu,
  Pagination,
  Steps,
  Tabs,
  Text,
} from '../../src';
import { Demo, Hint, Row, Section } from '../primitives';

const MENU_ITEMS = [
  {
    key: 'design',
    label: '设计',
    children: [
      { key: 'design-token', label: '令牌' },
      { key: 'design-motion', label: '动效' },
    ],
  },
  {
    key: 'dev',
    label: '研发',
    children: [
      { key: 'dev-web', label: 'Web' },
      { key: 'dev-mini', label: '小程序' },
    ],
  },
  { type: 'divider' as const, key: 'd1' },
  { key: 'settings', label: '设置', icon: <Settings size={14} /> },
];

export function Navigation() {
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tabs, setTabs] = useState([
    { key: '1', label: '概览' },
    { key: '2', label: '活动' },
    { key: '3', label: '设置' },
  ]);
  const [activeTab, setActiveTab] = useState('1');

  return (
    <Section
      id="navigation"
      title="导航"
      api="Menu / Tabs / Steps / Pagination"
      desc="Tabs 的墨条 165ms 跟随，不做整条横向滑动；Steps 的连接线用绝对定位，不会被 flex 裁掉。"
    >
      <Demo label="菜单" code="Menu mode=inline" dir="column">
        <Menu mode="inline" defaultOpenKeys={['design']} defaultSelectedKeys={['design-token']} items={MENU_ITEMS} />
      </Demo>

      <Demo label="下拉菜单" code="Dropdown menu.items" span="full">
        <Row className="justify-center">
          <Dropdown
            menu={{
              items: [
                { key: 'edit', label: '编辑' },
                { key: 'copy', label: '复制链接' },
                { type: 'divider', key: 'd' },
                { key: 'del', label: '删除', danger: true },
              ],
            }}
          >
            <Button>点击展开</Button>
          </Dropdown>
          <Dropdown
            trigger={['hover']}
            placement="topLeft"
            menu={{ items: [{ key: 'a', label: '悬停触发' }] }}
          >
            <Button size="small">悬停</Button>
          </Dropdown>
          <Dropdown
            overlay={
              <div className="w-[180px] p-3">
                <Text type="secondary" className="!text-xs">
                  完全自定义的浮层内容
                </Text>
              </div>
            }
          >
            <Button size="small">自定义浮层</Button>
          </Dropdown>
        </Row>
        <Hint>
          <code>onClick({'{ key, keyPath, domEvent }'})</code> 一次给出 key、路径与原始事件。
        </Hint>
      </Demo>

      <Demo label="标签页" code="Tabs items" span="full" dir="column">
        <Tabs
          items={[
            { key: '1', label: '概览', children: <Text type="secondary">概览内容</Text> },
            { key: '2', label: '活动', children: <Text type="secondary">活动内容</Text> },
            { key: '3', label: '设置', disabled: true, children: '禁用' },
          ]}
          defaultActiveKey="1"
        />
        <Tabs
          type="card"
          items={[
            { key: 'a', label: '第一页', children: <Text type="secondary">card 形态</Text> },
            { key: 'b', label: '第二页', children: <Text type="secondary">第二页内容</Text> },
          ]}
        />
        <Tabs
          type="editable-card"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabs.map((t) => ({ ...t, closable: tabs.length > 1, children: <Text type="secondary">{t.label} 的内容</Text> }))}
          onEdit={(key, action) => {
            if (action === 'add') {
              const next = String(Date.now()).slice(-4);
              setTabs([...tabs, { key: next, label: `新页 ${next}` }]);
              setActiveTab(next);
            } else if (typeof key === 'string') {
              const next = tabs.filter((t) => t.key !== key);
              setTabs(next);
              if (activeTab === key) setActiveTab(next[0]?.key ?? '');
            }
          }}
        />
      </Demo>

      <Demo label="垂直标签页" code="tabPosition=left" dir="column">
        <Tabs
          tabPosition="left"
          items={[
            { key: '1', label: '基础', children: <Text type="secondary">左侧竖排</Text> },
            { key: '2', label: '高级', children: <Text type="secondary">第二项</Text> },
          ]}
        />
      </Demo>

      <Demo label="面包屑" code="Breadcrumb items" dir="column">
        <Breadcrumb
          items={[
            { title: '首页', href: '#navigation' },
            { title: '组件', href: '#navigation' },
            { title: '导航' },
          ]}
        />
        <Breadcrumb
          separator=">"
          items={[
            { title: <Home size={12} />, href: '#navigation' },
            { title: '列表', href: '#navigation' },
            { title: '详情' },
          ]}
        />
      </Demo>

      <Demo label="步骤条" code="Steps current / onChange" span="full" dir="column">
        <Steps
          current={step}
          onChange={setStep}
          items={[
            { title: '填写信息', description: '基础资料' },
            { title: '验证身份', description: '上传证件' },
            { title: '完成', description: '等待审核' },
          ]}
        />
        <Row className="justify-center">
          <Button size="small" onClick={() => setStep(Math.max(0, step - 1))}>
            上一步
          </Button>
          <Button size="small" type="primary" onClick={() => setStep(Math.min(2, step + 1))}>
            下一步
          </Button>
        </Row>
        <Steps
          size="small"
          current={1}
          items={[{ title: '下单' }, { title: '支付' }, { title: '发货' }, { title: '收货' }]}
        />
        <Steps
          progressDot
          current={1}
          items={[{ title: '已提交' }, { title: '处理中' }, { title: '已完成' }]}
        />
      </Demo>

      <Demo label="分页" code="Pagination" span="full" dir="column">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={238}
          showSizeChanger
          showQuickJumper
          showTotal={(total, [from, to]) => `${from}-${to} / 共 ${total} 条`}
          onChange={(p, size) => {
            setPage(p);
            setPageSize(size);
          }}
        />
        <Row>
          <Pagination simple current={page} total={238} onChange={setPage} />
          <Pagination size="small" current={1} total={42} />
        </Row>
        <Hint>
          窄屏自动收成「上一页 / 1 / 10 / 下一页」，不靠 CSS 隐藏页码。
        </Hint>
      </Demo>

      <Demo label="锚点" code="Anchor items" dir="column">
        <Anchor
          affix={false}
          items={[
            { key: 'general', href: '#general', title: '通用' },
            { key: 'layout', href: '#layout', title: '布局' },
            { key: 'data-entry', href: '#data-entry', title: '数据录入' },
            { key: 'feedback', href: '#feedback', title: '反馈' },
          ]}
        />
        <Hint>点击平滑滚动；滚动时按位置自动高亮，不做 scrollspy 定时器轮询。</Hint>
      </Demo>

      <Demo label="悬浮按钮" code="FloatButton" span="full">
        <div className="relative flex h-32 w-full items-center justify-center rounded-container bg-muted-soft">
          <Row className="justify-center">
            <FloatButton icon={<MessageCircle size={18} />} badge={{ count: 3 }} tooltip="联系客服" />
            <FloatButton icon={<Share2 size={18} />} type="primary" tooltip="分享" />
            <FloatButton shape="square" description="写反馈" icon={<Plus size={14} />} />
          </Row>
          <div className="absolute end-4 bottom-4">
            <FloatButton icon={<ArrowUp size={16} />} tooltip="回到顶部" />
          </div>
        </div>
      </Demo>

    </Section>
  );
}
