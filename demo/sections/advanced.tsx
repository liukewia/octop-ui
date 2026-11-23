import { useState } from 'react';
import {
  ArrowRight,
  Copy,
  FileText,
  Folder,
  Globe,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import {
  BottomSheet,
  Button,
  ChatComposer,
  ChatMessage,
  ChatSystemMessage,
  Checkbox,
  Citation,
  CitationList,
  CodeBlock,
  CommandPalette,
  Drawer,
  HoverCard,
  Kbd,
  OverflowList,
  SelectionToolbar,
  StatusDot,
  Tag,
} from '../../src';
import type { CommandPaletteItem } from '../../src';
import { Demo, Hint, Row, Section, Stack } from '../primitives';

const CODE = `import { CommandPalette } from '@octop/ui';

<CommandPalette
  items={commands}
  hotkey="mod+k"
  onSelect={(item) => run(item.key)}
/>;`;

const COMMANDS: CommandPaletteItem[] = [
  {
    key: 'new',
    label: '新建项目',
    group: '操作',
    icon: <Plus className="size-4" />,
    shortcut: ['⌘', 'N'],
    keywords: ['create', 'project'],
  },
  {
    key: 'import',
    label: '导入文件',
    group: '操作',
    icon: <FileText className="size-4" />,
    description: '支持 md / pdf / docx',
    keywords: ['upload'],
  },
  {
    key: 'settings',
    label: '偏好设置',
    group: '导航',
    icon: <Settings className="size-4" />,
    shortcut: ['⌘', ','],
  },
  {
    key: 'billing',
    label: '账单与用量',
    group: '导航',
    icon: <Folder className="size-4" />,
  },
  {
    key: 'delete',
    label: '删除当前项目',
    group: '危险操作',
    icon: <Trash2 className="size-4" />,
    disabled: true,
    description: '需要管理员权限',
  },
];

const TAGS = [
  '产品设计',
  '前端',
  '内容运营',
  '增长',
  '数据分析',
  '客户成功',
  '安全合规',
  '国际化',
];

export function Advanced() {
  const [palette, setPalette] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [level, setLevel] = useState<0 | 1 | 2 | 3>(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [draft, setDraft] = useState('帮我总结这一版的改动');

  const toggle = (key: string) =>
    setSelected((list) => (list.includes(key) ? list.filter((item) => item !== key) : [...list, key]));

  return (
    <Section
      id="advanced"
      title="高级"
      api="CommandPalette / BottomSheet / Chat / OverflowList"
      desc="命令面板、底部抽屉和对话等组合组件。"
    >
      <Demo label="命令面板" code='<CommandPalette hotkey="mod+k" />' span="full" dir="block">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="primary" onClick={() => setPalette(true)}>
            打开命令面板
          </Button>
          <Button onClick={() => setPalette(true)} icon={<Sparkles className="size-4" />}>
            也可以按 <Kbd keys={['⌘', 'K']} size="small" className="ms-1" />
          </Button>
          <Hint>分组、禁用项、快捷键全部参与键盘走位；输入法组词期间回车不误触发。</Hint>
        </div>
        <CommandPalette
          open={palette}
          onOpenChange={setPalette}
          items={COMMANDS}
          footer="Octop 命令面板"
        />
      </Demo>

      <Demo label="多级抽屉" code="<Drawer push={{ distance: 180 }}>" span="full" dir="block">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setLevel(1)}>打开第一层</Button>
          <Hint>
            父层被推开 180px，子层自带一层更浅的遮罩；关掉子层自动归位，嵌套写法照旧，把 Drawer
            写在父层 children 里即可。
          </Hint>
        </div>

        <Drawer
          open={level >= 1}
          onClose={() => setLevel(0)}
          title="第一层 · 项目详情"
          width={520}
          footer={
            <Button type="primary" onClick={() => setLevel(2)}>
              进入成员列表
            </Button>
          }
        >
          <Stack>
            <p className="m-0">
              这一层是父级。子级打开时它会向左让出 180px，并被压上一层比自己更浅的遮罩。
            </p>
            <p className="m-0 text-fg-tertiary">点击右下角按钮进入第二层。</p>
          </Stack>

          <Drawer
            open={level >= 2}
            onClose={() => setLevel(1)}
            title="第二层 · 成员"
            width={380}
            footer={
              <Button type="primary" onClick={() => setLevel(3)}>
                查看权限
              </Button>
            }
          >
            <Stack>
              {['林一', '周悦', '陈默'].map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-fg-secondary">
                    <User className="size-3.5" />
                  </span>
                  <span className="text-fg">{name}</span>
                </div>
              ))}
            </Stack>

            <Drawer
              open={level >= 3}
              onClose={() => setLevel(2)}
              title="第三层 · 权限"
              width={300}
            >
              <Stack>
                <span>读 · 可查看全部内容</span>
                <span>写 · 可编辑自己创建的内容</span>
                <span>管 · 可邀请与移除成员</span>
              </Stack>
            </Drawer>
          </Drawer>
        </Drawer>
      </Demo>

      <Demo label="底部抽屉" code='<BottomSheet height="half" />' dir="block">
        <Row>
          <Button onClick={() => setSheet(true)}>半屏打开</Button>
        </Row>
        <Hint>抓手可以下拉，超过 96px 松手即关闭，短距离弹回。</Hint>
        <BottomSheet
          open={sheet}
          onClose={() => setSheet(false)}
          title="选择通知方式"
          height="half"
          footer={
            <>
              <Button onClick={() => setSheet(false)}>取消</Button>
              <Button type="primary" onClick={() => setSheet(false)}>
                保存
              </Button>
            </>
          }
        >
          <Stack>
            <span>离拇指最近的浮层：从底部整块升起，不做缩放。</span>
            <span className="text-fg-tertiary">遮罩只淡化透明度，不模糊内容。</span>
          </Stack>
        </BottomSheet>
      </Demo>

      <Demo label="会话消息" code="<ChatMessage /> + <ChatComposer />" span="full" dir="block">
        <div className="mx-auto flex w-full max-w-[620px] flex-col gap-4">
          <ChatSystemMessage>今天 14:02 · 已同步 3 条新消息</ChatSystemMessage>
          <ChatMessage
            role="user"
            name="林一"
            time="14:02"
            status="read"
            actions={
              <Button type="text" size="small" icon={<Copy className="size-3.5" />} aria-label="复制" />
            }
          >
            帮我把这版的改动整理成三条，语气正式一点。
          </ChatMessage>
          <ChatMessage
            role="assistant"
            name="Octop"
            actions={
              <>
                <Button type="text" size="small" icon={<Copy className="size-3.5" />} aria-label="复制回复" />
                <Button type="text" size="small" icon={<ArrowRight className="size-3.5" />} aria-label="继续" />
              </>
            }
          >
            <span className="block">
              1. 浮层动效统一改为进出场两条通道，方向由锚点侧决定。
              <Citation index={1} title="动效规范" url="https://github.com/liukewia/octop-ui/blob/main/README.md#动效" />
            </span>
            <span className="mt-1.5 block">
              2. 打开子抽屉时，父抽屉会沿边缘移开。
              <Citation index={2} title="嵌套抽屉用法" />
            </span>
            <span className="mt-1.5 block">3. 命令面板支持键盘搜索和选择。</span>
          </ChatMessage>
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSend={() => setDraft('')}
            footer="Enter 发送 · Shift + Enter 换行"
            actions={
              <Button type="text" size="small" icon={<Plus className="size-4" />} aria-label="快捷指令" />
            }
          />
        </div>
      </Demo>

      <Demo label="引用" code="<Citation /> / <CitationList />" dir="column">
        <p className="m-0 text-md leading-relaxed text-fg-secondary">
          多级抽屉的让位距离默认 180px，可以按内容密度调整
          <Citation index={1} title="抽屉 · 嵌套" url="https://github.com/liukewia/octop-ui/blob/main/README.md#多级抽屉" />
          ；动效时钟只有两条曲线
          <Citation index={2} title="动效 · 曲线" />
          。
        </p>
        <CitationList
          title="来源"
          items={[
            {
              key: 'a',
              title: '抽屉 · 嵌套与让位',
              url: 'https://github.com/liukewia/octop-ui/blob/main/README.md#多级抽屉',
              domain: 'github.com',
              snippet: '父层沿线平移 180px',
            },
            {
              key: 'b',
              title: '动效 · standard / exit',
              snippet: 'standard 进、exit 退',
            },
          ]}
        />
      </Demo>

      <Demo label="悬浮卡" code="<HoverCard />" dir="block">
        <Row>
          <HoverCard
            title="林一"
            content={
              <span className="block">
                产品设计 · 负责编辑器与组件库。
                <span className="mt-1 block text-fg-tertiary">linyi@octop.dev</span>
              </span>
            }
          >
            <Tag color="blue" bordered>
              悬停这张标签
            </Tag>
          </HoverCard>
          <HoverCard title="链接" content="卡片出现后可以直接把鼠标移进来，不会立刻收起。">
            <Button>带标题的卡片</Button>
          </HoverCard>
        </Row>
        <Hint>打开延迟 120ms、关闭延迟 160ms，够鼠标从触发点走到卡片上。</Hint>
      </Demo>

      <Demo label="状态点" code="<StatusDot status />" dir="column">
        <Row>
          <StatusDot status="success" text="全部正常" />
          <StatusDot status="processing" text="同步中" />
          <StatusDot status="warning" text="配额接近上限" />
          <StatusDot status="error" text="连接失败" />
          <StatusDot status="default" text="未启用" />
        </Row>
        <Row>
          <StatusDot status="processing" size="small" text="小号" />
          <StatusDot status="success" size="large" text="大号" />
          <StatusDot size="middle" color="var(--ax-hue-purple-fg)" text="自定义颜色" />
        </Row>
      </Demo>

      <Demo label="键帽" code="<Kbd keys={['⌘','K']} />" dir="column">
        <Row>
          <Kbd keys={['⌘', 'K']} />
          <Kbd keys={['Ctrl', 'Shift', 'P']} />
          <Kbd keys={['Esc']} size="small" />
          <Kbd keys={['↵']} size="large" />
        </Row>
        <Hint>1px 描边 + 底部 2px 的厚度，白色键帽，等宽字。</Hint>
      </Demo>

      <Demo label="代码块" code="<CodeBlock showLineNumbers />" span="full" dir="block">
        <CodeBlock code={CODE} language="tsx" title="命令面板" showLineNumbers maxHeight={220} />
      </Demo>

      <Demo label="溢出列表" code="<OverflowList items maxCount />" dir="block">
        <div className="w-full max-w-[280px]">
          <OverflowList
            items={TAGS}
            maxCount={6}
            renderItem={(item) => <Tag bordered>{item}</Tag>}
          />
        </div>
        <Hint>宽度是靠量出来的：先在一层不可见的量具里排一遍，再决定收几个。</Hint>
      </Demo>

      <Demo label="批量操作条" code="<SelectionToolbar count />" span="full" dir="block">
        <div className="relative h-[200px] rounded-container border border-line bg-surface p-3">
          <Stack className="gap-1">
            {[
              { key: 'a', label: '季度复盘 · 设计' },
              { key: 'b', label: '季度复盘 · 前端' },
              { key: 'c', label: '季度复盘 · 运营' },
            ].map((row) => (
              <label
                key={row.key}
                className="flex cursor-pointer items-center gap-2.5 rounded-element px-1.5 py-1.5 hover:bg-muted-soft"
              >
                <Checkbox
                  checked={selected.includes(row.key)}
                  onChange={() => toggle(row.key)}
                  aria-label={row.label}
                />
                <span className="text-base text-fg">{row.label}</span>
                <Globe className="ms-auto size-3.5 text-fg-disabled" />
              </label>
            ))}
          </Stack>

          <SelectionToolbar
            count={selected.length}
            fixed={false}
            onClear={() => setSelected([])}
            extra="共 3 条"
          >
            <Button type="text" size="small" icon={<Copy className="size-3.5" />}>
              复制
            </Button>
            <Button type="text" size="small" danger icon={<Trash2 className="size-3.5" />}>
              删除
            </Button>
          </SelectionToolbar>
        </div>
        <Hint>选中才出现，浮在内容之上；数量用反相胶囊，清除紧挨着数量。</Hint>
      </Demo>
    </Section>
  );
}
