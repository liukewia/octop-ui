import { useEffect, useRef, useState } from 'react';
import { Plus, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  Button,
  ChatComposer,
  ChatMessage,
  ChatSystemMessage,
  Citation,
  CitationList,
  CodeBlock,
  Select,
  Tag,
} from '../../src';
import { SceneFrame } from './frame';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  loading?: boolean;
};

const MODELS = [
  { label: 'Octop 4.1 · 长文本', value: 'octop-4.1' },
  { label: 'Octop 4.1 mini · 快速', value: 'mini' },
];

const SOURCES = [
  { index: 1, title: 'Astryx · 卡片与容器的圆角规范', url: 'https://astryx.atmeta.com/foundations/radius' },
  { index: 2, title: 'Octop UI · Token 分层说明', url: 'https://github.com/liukewia/octop-ui#readme' },
];

const INITIAL: Msg[] = [
  {
    id: 'm1',
    role: 'user',
    content: '把我们卡片圆角的取值逻辑讲一下，顺手给个能直接用的 CSS 片段。',
  },
  {
    id: 'm2',
    role: 'assistant',
    content: (
      <div className="flex flex-col gap-3">
        <p className="m-0">
          卡片只用一档 12px 圆角，内层元素再收一档到 6px，嵌套两层时不会出现「圆角里套圆角」的锯齿
          <Citation index={1} title={SOURCES[0].title} url={SOURCES[0].url} />
          。整页容器用 28px，只有页面级的面板才需要那么大的弧度
          <Citation index={2} title={SOURCES[1].title} url={SOURCES[1].url} />。
        </p>
        <CodeBlock
          language="css"
          title="tokens/radius.css"
          code={`.radius-card    { border-radius: 12px; }  /* 卡片、弹窗、抽屉 */
.radius-element { border-radius:  6px; }  /* 输入框、按钮、标签 */
.radius-inner   { border-radius:  4px; }  /* 分段控件里的滑块 */
.radius-page    { border-radius: 28px; }  /* 全屏面板、底部抽屉 */`}
        />
        <p className="m-0">
          注意别在卡片上同时写 <code className="rounded bg-canvas px-1 font-mono text-xs">rounded-lg</code>{' '}
          和自定义类 —— Tailwind 的 utilities 层会赢，令牌就失效了。
        </p>
        <CitationList items={SOURCES} title="来源" columns={1} />
      </div>
    ),
  },
];

export function AssistantScene() {
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [draft, setDraft] = useState('');
  const [model, setModel] = useState('octop-4.1');
  const [thinking, setThinking] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const endRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // 新消息落在视口外时把结尾带进来；block: nearest 只滚最小距离，不会把整页甩走。
  // 首次挂载不滚，否则一进场景页就被拉到最底部。
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages]);

  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    setMessages((list) => [
      ...list,
      { id: `u${Date.now()}`, role: 'user', content: text },
      { id: `a${Date.now()}`, role: 'assistant', content: '', loading: true },
    ]);
    setDraft('');
    setThinking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setThinking(false);
      setMessages((list) =>
        list.map((m) =>
          m.role === 'assistant' && m.content === ''
            ? {
                ...m,
                loading: false,
                content: (
                  <div className="flex flex-col gap-2">
                    <p className="m-0">
                      收到。如果你要的是「一张卡里放一组控件」，建议卡片 12px、内部控件 6px、按钮组第一颗和最后一颗各留
                      6px 外圆角，中间保持直角 —— 这样按压时不会出现缝隙。
                    </p>
                    <p className="m-0 text-fg-tertiary">
                      需要我把这段写成 `fieldShell` 的变体吗？可以直接给 Select 和 DatePicker 复用。
                    </p>
                  </div>
                ),
              }
            : m,
        ),
      );
    }, 1100);
  };

  return (
    <SceneFrame url="assistant" title="AI 助手">
      <div className="mx-auto flex max-w-[720px] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm font-semibold text-fg">设计系统助手</span>
            <Tag color="blue">联网</Tag>
            <Tag color="gray">只读知识库</Tag>
          </div>
          <div className="flex items-center gap-2">
            <Select
              size="small"
              options={MODELS}
              value={model}
              onChange={(v) => setModel(v as string)}
              className="w-[190px]"
            />
            <Button
              size="small"
              icon={<Plus className="size-3.5" />}
              onClick={() => {
                setMessages([]);
                setDraft('');
              }}
            >
              新会话
            </Button>
          </div>
        </div>

        <div className="flex min-h-[300px] flex-col gap-3 py-4">
          {messages.length === 0 ? (
            <div className="m-auto max-w-[380px] text-center">
              <p className="m-0 text-sm font-medium text-fg">开始一段新会话</p>
              <p className="m-0 mt-1 text-xs leading-relaxed text-fg-tertiary">
                可以问令牌命名、组件组合方式，或者让助手读一遍你的改动 diff。
              </p>
            </div>
          ) : (
            <>
              <ChatSystemMessage>今天 09:24</ChatSystemMessage>
              {messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  role={m.role}
                  name={m.role === 'assistant' ? 'Octop' : undefined}
                  time={m.role === 'user' ? '09:24' : undefined}
                  status={m.role === 'user' ? 'read' : undefined}
                  loading={m.loading}
                  actions={
                    m.role === 'assistant' ? (
                      <div className="flex items-center gap-0.5">
                        <Button size="small" type="text" icon={<ThumbsUp className="size-3.5" />} aria-label="有帮助" />
                        <Button size="small" type="text" icon={<ThumbsDown className="size-3.5" />} aria-label="没帮助" />
                        <Button size="small" type="text" icon={<RotateCcw className="size-3.5" />} aria-label="重新生成" />
                      </div>
                    ) : undefined
                  }
                >
                  {m.content}
                </ChatMessage>
              ))}
            </>
          )}
          <div ref={endRef} />
        </div>

        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSend={send}
          loading={thinking}
          onStop={() => {
            window.clearTimeout(timer.current);
            setThinking(false);
            setMessages((list) => list.filter((m) => m.content !== ''));
          }}
          placeholder="问点什么，或粘贴一段代码…"
          footer={
            <span className="flex flex-wrap items-center gap-x-2 text-2xs text-fg-disabled">
              <span>Enter 发送 · Shift + Enter 换行</span>
              <span aria-hidden>·</span>
              <span>回答可能不准确，请核对引用来源</span>
            </span>
          }
        />
      </div>
    </SceneFrame>
  );
}
