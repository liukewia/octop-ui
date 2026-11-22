import { useState } from 'react';
import { ArrowRight, Download, Plus, Settings, Trash2 } from 'lucide-react';
import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Link,
  Paragraph,
  Space,
  Text,
  Title,
} from '../../src';
import { Demo, Hint, Row, Section, Stack } from '../primitives';

export function General() {
  const [loading, setLoading] = useState(false);

  return (
    <Section
      id="general"
      title="通用"
      api="Button / Space / Typography"
      desc="按钮、间距和排版示例。"
    >
      <Demo label="按钮类型" code='type="primary" | default | text | link' span="full">
        <Row className="justify-center">
          <Button type="primary">主要</Button>
          <Button>次要</Button>
          <Button type="dashed">次级填充</Button>
          <Button type="text">文本</Button>
          <Button type="link">链接</Button>
          <Button type="primary" danger>
            危险
          </Button>
          <Button type="primary" ghost>
            幽灵
          </Button>
        </Row>
        <Hint>
          <code>dashed</code> 使用次级填充。
        </Hint>
      </Demo>

      <Demo label="尺寸与形状" code='size / shape="circle"'>
        <Row className="justify-center">
          <Button type="primary" size="small">
            小
          </Button>
          <Button type="primary">中</Button>
          <Button type="primary" size="large">
            大
          </Button>
        </Row>
        <Row className="justify-center">
          <Button shape="circle" aria-label="设置">
            <Settings size={16} />
          </Button>
          <Button shape="round">圆角</Button>
          <Button type="primary" shape="circle" aria-label="新增">
            <Plus size={16} />
          </Button>
        </Row>
      </Demo>

      <Demo label="图标位置" code="icon / iconPosition">
        <Row className="justify-center">
          <Button type="primary" icon={<Plus size={16} />}>
            新增
          </Button>
          <Button icon={<Download size={16} />} iconPosition="end">
            导出
          </Button>
          <Button type="text" danger icon={<Trash2 size={16} />}>
            删除
          </Button>
        </Row>
        <Row className="justify-center">
          <Button icon={<ArrowRight size={16} />} iconPosition="end" shape="round">
            下一步
          </Button>
          <Button href="#general" type="link">
            以 a 渲染
          </Button>
        </Row>
      </Demo>

      <Demo label="加载态" code="loading={{ delay }}" span="full">
        <Row className="justify-center">
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 1600);
            }}
          >
            {loading ? '处理中' : '点一下走 1.6s'}
          </Button>
          <Button loading>一直转</Button>
          <Button loading={{ delay: 0 }} type="primary">
            不延迟
          </Button>
          <Button loading icon={<Download size={16} />}>
            导出中
          </Button>
        </Row>
        <Hint>
          加载超过 225ms 时显示进度图标。
        </Hint>
      </Demo>

      <Demo label="按钮组" code="ButtonGroup" span="full">
        <Row className="justify-center">
          <ButtonGroup>
            <Button>左</Button>
            <Button>中</Button>
            <Button>右</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button type="primary">保存</Button>
            <Button>另存为</Button>
          </ButtonGroup>
          <div className="w-full max-w-[260px]">
            <Button block type="primary">
              块级按钮
            </Button>
          </div>
        </Row>
      </Demo>

      <Demo label="间距" code="Space / Flex" span="full" dir="column">
        <Space size="middle" wrap>
          <Button>默认</Button>
          <Button>间距</Button>
          <Button>middle</Button>
        </Space>
        <Divider />
        <Space split={<Divider type="vertical" />} size="large" wrap>
          <Text>拆分线</Text>
          <Text>两侧</Text>
          <Text>各 large</Text>
        </Space>
        <Divider />
        <Flex gap={12} wrap="wrap" align="center" justify="space-between">
          <Text type="secondary">Flex justify=space-between</Text>
          <Space size={8}>
            <Button size="small">取消</Button>
            <Button size="small" type="primary">
              确定
            </Button>
          </Space>
        </Flex>
      </Demo>

      <Demo label="排版" code="Text / Paragraph / Title" dir="column">
        <Title level={3} className="!m-0">
          标题三级
        </Title>
        <Paragraph className="!mb-0">
          段落默认 15px / 1.47。行内可以混 <Text strong>加粗</Text>、
          <Text code>code</Text>、<Text mark>高亮</Text>、
          <Text delete>删除线</Text> 与 <Text keyboard>⌘K</Text>。
        </Paragraph>
        <Paragraph type="secondary" className="!mb-0" ellipsis={{ rows: 2 }}>
          两行截断：ellipsis 收行数配置，用 line-clamp 实现，不测量 DOM，也没有 ResizeObserver 抖动。
          再补一点文字让它真的到第三行，才能看出截断效果。
        </Paragraph>
      </Demo>

      <Demo label="语义色与链接" code="type / Link" dir="column">
        <Stack className="gap-1.5">
          <Text type="secondary">次要文字</Text>
          <Text type="success">成功文字</Text>
          <Text type="warning">警告文字</Text>
          <Text type="danger">危险文字</Text>
          <Text disabled>禁用文字</Text>
        </Stack>
        <Stack className="gap-1.5">
          <Link href="#general">链接用下划线表达，不用品牌蓝</Link>
          <Link href="#general" disabled>
            禁用链接
          </Link>
          <Text type="secondary">
            链接不涂品牌蓝，刻意用「文字 + 下划线」：C 端页面里蓝色太容易被当成主按钮。
          </Text>
        </Stack>
      </Demo>

      <Demo label="分割线" code="Divider titlePlacement" span="full" dir="column">
        <Divider titlePlacement="left">左对齐（titlePlacement）</Divider>
        <Divider orientation="center">居中（orientation 也收）</Divider>
        <Divider dashed>虚线</Divider>
        <Row>
          <Text>文字</Text>
          <Divider type="vertical" />
          <Text>竖直</Text>
          <Divider type="vertical" />
          <Text>分割</Text>
        </Row>
      </Demo>
    </Section>
  );
}
