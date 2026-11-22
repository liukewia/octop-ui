import { useState } from 'react';
import {
  ChevronRight,
  Circle,
  CircleCheck,
  CircleX,
  LoaderCircle,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { CodeBlock } from '../advanced/code-block';

/** 与 antd 的 Steps / antd-x 的 ThoughtChain 对齐：老写法也收 */
export type AgentStepStatus = 'pending' | 'running' | 'success' | 'error';

type StatusInput = AgentStepStatus | 'wait' | 'process' | 'finish';

const STATUS_ALIAS: Record<string, AgentStepStatus> = {
  wait: 'pending',
  process: 'running',
  finish: 'success',
};

export function normalizeAgentStatus(status?: StatusInput): AgentStepStatus {
  if (!status) return 'pending';
  return STATUS_ALIAS[status] ?? (status as AgentStepStatus);
}

const TONE: Record<AgentStepStatus, string> = {
  pending: 'text-fg-disabled',
  running: 'text-accent',
  success: 'text-success',
  error: 'text-danger',
};

function StepIcon({ status, icon }: { status: AgentStepStatus; icon?: React.ReactNode }) {
  if (icon) {
    return <span className={cn('inline-flex size-4 items-center justify-center', TONE[status])}>{icon}</span>;
  }
  const Icon =
    status === 'running' ? LoaderCircle : status === 'success' ? CircleCheck : status === 'error' ? CircleX : Circle;
  return (
    <Icon
      className={cn('size-4', TONE[status], status === 'running' && 'animate-spin [animation-duration:525ms]')}
      strokeWidth={2}
      aria-hidden
    />
  );
}

export interface AgentThoughtChainItem {
  key?: React.Key;
  title: React.ReactNode;
  /** 标题后的次级文字：耗时、条数、模型名 */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StatusInput;
  /** 展开后的正文；没有 content 就不出展开键 */
  content?: React.ReactNode;
  defaultOpen?: boolean;
  /** 受控展开；不传时自己管 */
  open?: boolean;
  /** 行尾的额外内容（tag、耗时） */
  extra?: React.ReactNode;
}

export interface AgentThoughtChainProps {
  items: AgentThoughtChainItem[];
  size?: 'small' | 'default';
  /** 是否可展开；auto = 有 content 才可展开（默认） */
  collapsible?: boolean | 'auto';
  /** 行与行之间的竖线，默认开 */
  line?: boolean;
  onExpand?: (key: React.Key | undefined, open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface RowProps {
  item: AgentThoughtChainItem;
  index: number;
  last: boolean;
  size: 'small' | 'default';
  collapsible: boolean | 'auto';
  line: boolean;
  onExpand?: AgentThoughtChainProps['onExpand'];
}

function TraceRow({ item, index, last, size, collapsible, line, onExpand }: RowProps) {
  const status = normalizeAgentStatus(item.status);
  const expandable = collapsible === true || (collapsible === 'auto' && item.content !== undefined);
  const [innerOpen, setInnerOpen] = useState(!!item.defaultOpen);
  const controlled = item.open !== undefined;
  const open = controlled ? item.open : innerOpen;

  const setOpen = (next: boolean) => {
    if (!controlled) setInnerOpen(next);
    onExpand?.(item.key ?? index, next);
  };

  const heading = (
    <span className="flex min-w-0 flex-1 items-baseline gap-2">
      <span
        className={cn(
          // 运行中的标题走 shimmer：一眼能看出这条还在走，而不是「字比较浅」
          'min-w-0 truncate font-medium',
          status === 'running' ? 'shimmer text-fg' : status === 'pending' ? 'text-fg-tertiary' : 'text-fg',
        )}
      >
        {item.title}
      </span>
      {item.description && (
        <span className="flex-none text-xs tabular-nums text-fg-tertiary">{item.description}</span>
      )}
    </span>
  );

  const line1 = (
    <span className={cn('flex min-w-0 flex-1 items-center gap-2', size === 'small' ? 'min-h-6' : 'min-h-7')}>
      {heading}
      {item.extra}
    </span>
  );

  return (
    <li className="relative ps-6" data-status={status}>
      {line && !last && (
        <span aria-hidden className="absolute start-[7px] top-[21px] -bottom-[13px] w-px bg-line" />
      )}
      <span className="absolute start-0 top-[5px]">
        <StepIcon status={status} icon={item.icon} />
      </span>

      {expandable ? (
        <>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="ax-focus flex w-full min-w-0 items-center gap-1.5 rounded-inner text-start text-sm"
          >
            {line1}
            <ChevronRight
              aria-hidden
              className={cn(
                'size-3.5 flex-none text-fg-disabled transition-transform duration-[125ms] ease-standard',
                open && 'rotate-90',
              )}
            />
          </button>
          {open && (
            <div
              className={cn(
                'min-w-0 pb-1.5 pt-1 text-sm leading-relaxed text-fg-secondary',
                size === 'small' && 'text-xs',
              )}
            >
              {item.content}
            </div>
          )}
        </>
      ) : (
        <div className="flex min-w-0 items-center gap-1.5 text-sm">{line1}</div>
      )}
    </li>
  );
}

/**
 * 一步一行。Agent 的「思考 / 工具 / 计划 / 子任务」共用这一副骨架：
 * 左边一根呼吸式的竖线，图标报状态，标题报动作，展开看细节。
 * 不做时间轴式的粗细渐变 —— 轨迹要能一屏读完，不需要装饰。
 */
export function AgentThoughtChain({
  items,
  size = 'default',
  collapsible = 'auto',
  line = true,
  onExpand,
  className,
  style,
}: AgentThoughtChainProps) {
  return (
    <ol className={cn('m-0 flex list-none flex-col gap-2 p-0', className)} style={style}>
      {items.map((item, index) => (
        <TraceRow
          key={item.key ?? index}
          item={item}
          index={index}
          last={index === items.length - 1}
          size={size}
          collapsible={collapsible}
          line={line}
          onExpand={onExpand}
        />
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------
 * Reasoning / Tool：ThoughtChain 的两个定型版本
 * ---------------------------------------------------------------------- */

export interface AgentReasoningProps {
  /** 思考正文，流式写入时逐字变长 */
  content: React.ReactNode;
  /** 是否还在思考 */
  loading?: boolean;
  /** 耗时（秒）；结束后显示「思考了 5 秒」 */
  duration?: number;
  /** 标题文案，默认 思考 / 思考了 N 秒 */
  title?: { thinking?: React.ReactNode; done?: (duration?: number) => React.ReactNode };
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * 思考行：思考中展开且标题扫光，结束后自动收起。
 * 「自动收起」只在用户没动过的时候生效 —— 用户点开了就别替他合上。
 */
export function AgentReasoning({
  content,
  loading,
  duration,
  title,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: AgentReasoningProps) {
  const [userOpen, setUserOpen] = useState<boolean | undefined>(defaultOpen);
  const resolved = open ?? userOpen ?? !!loading;

  return (
    <AgentThoughtChain
      className={className}
      collapsible
      items={[
        {
          key: 'reasoning',
          title: loading
            ? (title?.thinking ?? '思考中')
            : (title?.done?.(duration) ?? (duration ? `思考了 ${duration} 秒` : '思考完成')),
          status: loading ? 'running' : 'success',
          open: resolved,
          content,
        },
      ]}
      onExpand={(_, next) => {
        setUserOpen(next);
        onOpenChange?.(next);
      }}
    />
  );
}

export interface AgentToolProps {
  /** 工具名，比如 read_file */
  name: React.ReactNode;
  status?: StatusInput;
  /** 入参：对象会被序列化成 JSON，也可直接给节点 */
  input?: unknown;
  /** 输出：字符串给代码块，节点原样渲染 */
  output?: React.ReactNode;
  error?: React.ReactNode;
  /** 耗时（毫秒） */
  duration?: number;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  /** 入参 / 输出的标题 */
  labels?: { input?: React.ReactNode; output?: React.ReactNode };
  className?: string;
}

function stringify(value: unknown) {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/** 工具调用：入参和输出都在同一条线上展开，失败时把错误原样摆出来 */
export function AgentTool({
  name,
  status = 'success',
  input,
  output,
  error,
  duration,
  icon,
  defaultOpen,
  labels,
  className,
}: AgentToolProps) {
  const resolved = normalizeAgentStatus(status);
  const inputText = stringify(input);
  const outputText = typeof output === 'string' ? output : undefined;

  return (
    <AgentThoughtChain
      className={className}
      collapsible
      items={[
        {
          key: 'tool',
          title: name,
          status: resolved,
          description: duration === undefined ? undefined : `${(duration / 1000).toFixed(1)}s`,
          icon,
          defaultOpen,
          content: (
            <div className="flex flex-col gap-2.5">
              {inputText && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-fg-tertiary">{labels?.input ?? '入参'}</span>
                  <CodeBlock code={inputText} language="json" maxHeight={180} />
                </div>
              )}
              {error !== undefined && (
                <div className="rounded-element border border-line bg-[var(--ax-danger-bg)] px-2.5 py-2 text-xs leading-relaxed text-[var(--ax-danger-fg)]">
                  {error}
                </div>
              )}
              {output !== undefined && output !== null && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-fg-tertiary">{labels?.output ?? '输出'}</span>
                  {outputText ? (
                    <CodeBlock code={outputText} language="text" maxHeight={220} />
                  ) : (
                    <div className="min-w-0">{output}</div>
                  )}
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
