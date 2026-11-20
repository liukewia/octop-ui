import { useState } from 'react';
import { Heart, MoreHorizontal, Share2, Star } from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Grid,
  Layout,
  Row,
  Skeleton,
  Splitter,
  Text,
} from '../../src';
import { Demo, Hint, Section, Stack } from '../primitives';

const { Header, Sider, Content, Footer } = Layout;

export function LayoutSection() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Section
      id="layout"
      title="布局"
      api="Layout / Row Col / Splitter / Card"
      desc="栅格是 24 栏与响应式断点；布局容器只负责分区，不携带主题，嵌套时不会重复描边。"
    >
      <Demo label="Layout" code="Header / Sider / Content" span="full" dir="block">
        <Layout className="w-full overflow-hidden rounded-container border border-line">
          <Header className="flex items-center justify-between px-4">
            <Text strong>Octop</Text>
            <Button size="small" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '展开' : '收起'}
            </Button>
          </Header>
          <Layout hasSider>
            <Sider
              collapsed={collapsed}
              collapsedWidth={0}
              width={132}
              theme="light"
              className="border-r border-line"
            >
              <div className="p-3">
                <Stack className="gap-2">
                  <Text type="secondary" className="!text-xs">
                    导航
                  </Text>
                  <Text>概览</Text>
                  <Text type="secondary">订单</Text>
                  <Text type="secondary">设置</Text>
                </Stack>
              </div>
            </Sider>
            <Content className="p-4">
              <Text type="secondary">
                内容区。Sider 收起时宽度真正归零，不靠负 margin 藏 —— 所以不会有 1px 描边残留。
              </Text>
            </Content>
          </Layout>
          <Footer className="border-t border-line px-4 py-2">
            <Text type="secondary" className="!text-xs">
              Footer
            </Text>
          </Footer>
        </Layout>
      </Demo>

      <Demo label="24 栏栅格" code="Row gutter / Col span" span="full" dir="block">
        <Stack>
          <Row gutter={12}>
            {[8, 8, 8].map((span, i) => (
              <Col key={i} span={span}>
                <div className="rounded-element bg-surface px-3 py-4 text-center text-xs text-fg-tertiary shadow-[inset_0_0_0_1px_var(--ax-line)]">
                  span {span}
                </div>
              </Col>
            ))}
          </Row>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={8}>
              <div className="h-full rounded-element bg-surface px-3 py-4 text-center text-xs text-fg-tertiary shadow-[inset_0_0_0_1px_var(--ax-line)]">
                xs 24 / sm 12 / md 8
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="h-full rounded-element bg-surface px-3 py-4 text-center text-xs text-fg-tertiary shadow-[inset_0_0_0_1px_var(--ax-line)]">
                xs 24 / sm 12 / md 8
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="h-full rounded-element bg-surface px-3 py-4 text-center text-xs text-fg-tertiary shadow-[inset_0_0_0_1px_var(--ax-line)]">
                xs 24 / md 8
              </div>
            </Col>
          </Row>
          <Grid columns={6} gap={8}>
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="rounded-element bg-muted py-3 text-center font-mono text-[11px] text-fg-tertiary"
              >
                {i + 1}
              </div>
            ))}
          </Grid>
        </Stack>
        <Hint>窗口变窄时 Row/Col 会按 xs→sm→md 逐级覆盖，不用写媒体查询。</Hint>
      </Demo>

      <Demo label="Splitter" code="Splitter.Panel" span="full" dir="block">
        <Splitter className="h-[168px] w-full overflow-hidden rounded-container border border-line">
          <Splitter.Panel defaultSize="32%" min="18%">
            <div className="flex h-full items-center justify-center bg-canvas text-xs text-fg-tertiary">
              左 32%
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div className="flex h-full items-center justify-center text-xs text-fg-tertiary">
              右（拖我）
            </div>
          </Splitter.Panel>
        </Splitter>
        <Hint>指针拖拽之外，聚焦分隔条后可用方向键微调；松手才触发 onResizeEnd。</Hint>
      </Demo>

      <Demo label="Card" code="title / extra / actions" span="full">
        <Card
          className="w-full"
          title="卡片标题"
          extra={
            <Button type="text" size="small" icon={<MoreHorizontal size={16} />} aria-label="更多" />
          }
          actions={[
            <span key="like" className="inline-flex items-center gap-1 text-xs">
              <Heart size={14} /> 收藏
            </span>,
            <span key="star" className="inline-flex items-center gap-1 text-xs">
              <Star size={14} /> 关注
            </span>,
            <span key="share" className="inline-flex items-center gap-1 text-xs">
              <Share2 size={14} /> 分享
            </span>,
          ]}
        >
          <Text type="secondary">
            卡片靠 8% 描边分层，没有投影。hoverable 时只加深描边，不做位移。
          </Text>
        </Card>

        <Card className="w-full" hoverable cover={<div className="h-24 bg-canvas" />}>
          <Card.Meta
            avatar={<Avatar size={32}>O</Avatar>}
            title="带封面"
            description="cover + Meta，标题 14/600，描述走次要色。"
          />
        </Card>
      </Demo>

      <Demo label="Card loading" code="loading" dir="block">
        <Card
          title="加载中"
          extra={<Button size="small" onClick={() => setLoading(!loading)}>切换</Button>}
          loading={loading}
        >
          <Text type="secondary">loading 时用骨架屏占位，高度不塌。</Text>
        </Card>
        <div className="mt-3">
          <Skeleton avatar paragraph={{ rows: 2 }} active />
        </div>
      </Demo>
    </Section>
  );
}
