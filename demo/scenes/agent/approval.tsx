import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Clock, Database, RotateCcw, ShieldAlert, Undo2, X } from 'lucide-react';
import {
  Alert,
  Button,
  ChatMessage,
  Checkbox,
  CodeBlock,
  Collapse,
  Descriptions,
  Drawer,
  StatusDot,
  Tag,
  message,
} from '../../../src';
import { SceneFrame, SceneLabel, ScenePanel } from '../frame';

const SQL = `-- 0021_add_tenant_index.sql
CREATE INDEX CONCURRENTLY idx_orders_tenant_created
  ON orders (tenant_id, created_at DESC)
  WHERE deleted_at IS NULL;

ANALYZE orders;`;

const ROLLBACK = `DROP INDEX CONCURRENTLY IF EXISTS idx_orders_tenant_created;
-- 回滚无需锁表，耗时 < 200ms`;

const CHECKLIST = [
  '已在影子库预演，计划耗时 3.1s',
  '锁表窗口 3.2s，仅阻塞写入，不影响读',
  '已有回滚脚本，可 5 分钟内撤销',
];

type Decision = 'pending' | 'running' | 'done' | 'rejected';

export function AgentApprovalScene() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [decision, setDecision] = useState<Decision>('pending');
  const [left, setLeft] = useState(271);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (decision !== 'pending') return;
    const id = window.setInterval(() => setLeft((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [decision]);

  const approve = () => {
    setOpen(false);
    setDecision('running');
    timers.current.push(
      window.setTimeout(() => {
        setDecision('done');
        message.success('迁移已执行，耗时 3.1s');
      }, 1700),
    );
  };

  const reject = () => {
    setDecision('rejected');
    message.warning('已拒绝，Agent 改用只读预演');
  };

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setDecision('pending');
    setChecked(false);
    setLeft(271);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <SceneFrame url="approvals/8f2a" title="工具审批">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-base font-semibold text-fg">写操作需要你点头</h3>
            <Tag color="red">生产环境</Tag>
          </div>
          <p className="m-0 mt-1 max-w-[560px] text-xs leading-relaxed text-fg-tertiary">
            Agent 想做一次数据库迁移。它把「要改什么、影响多大、怎么回滚」摆在一张卡上，你只需要做一次判断。
          </p>
        </div>
        <div className="flex flex-none items-center gap-2">
          {decision === 'pending' ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-canvas px-2.5 font-mono text-xs text-warning-ink tabular-nums">
              <Clock className="size-3.5" />
              {mm}:{ss}
            </span>
          ) : null}
          <StatusDot
            status={
              decision === 'pending' ? 'warning' : decision === 'running' ? 'processing' : decision === 'done' ? 'success' : 'default'
            }
            text={
              decision === 'pending'
                ? '等待审批'
                : decision === 'running'
                  ? '执行中'
                  : decision === 'done'
                    ? '已执行'
                    : '已拒绝'
            }
            pulse={decision === 'running'}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_262px]">
        <ScenePanel className="min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-start gap-2.5 border-b border-line px-3 py-3">
            <span className="grid size-9 flex-none place-items-center rounded-element bg-canvas text-warning-ink">
              <ShieldAlert className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-fg">迁移 · 0021_add_tenant_index</span>
                <code className="rounded-[4px] bg-canvas px-1 py-px font-mono text-[10px] text-fg-tertiary">db.migrate</code>
              </div>
              <p className="m-0 mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-fg-tertiary">
                <span className="inline-flex items-center gap-1">
                  <Database className="size-3" />
                  prod-cn-shanghai
                </span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">影响 1,284,502 行</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">锁表 ≈ 3.2s</span>
              </p>
            </div>
            <Tag color="red" filled className="mt-0.5">
              高风险
            </Tag>
          </div>

          <div className="px-3 py-3">
            <CodeBlock language="sql" title="0021_add_tenant_index.sql" code={SQL} maxHeight={168} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2.5">
            <span className="text-2xs text-fg-tertiary">按策略 write.prod 必须人工确认，自动执行已关闭。</span>
            <div className="flex flex-wrap items-center gap-2">
              {decision === 'pending' ? (
                <>
                  <Button size="small" onClick={reject}>
                    拒绝
                  </Button>
                  <Button size="small" icon={<ArrowRight className="size-3.5" />} onClick={() => setOpen(true)}>
                    查看完整计划
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<Check className="size-3.5" />}
                    className="max-sm:w-full"
                    onClick={() => setOpen(true)}
                  >
                    批准并执行
                  </Button>
                </>
              ) : (
                <Button size="small" icon={<RotateCcw className="size-3.5" />} onClick={reset}>
                  重新演示
                </Button>
              )}
            </div>
          </div>
        </ScenePanel>

        <div className="flex min-w-0 flex-col gap-3">
          <ScenePanel className="p-3">
            <SceneLabel extra="4 项">审批依据</SceneLabel>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {CHECKLIST.map((t) => (
                <li key={t} className="flex gap-2 text-xs leading-relaxed text-fg-secondary">
                  <Check className="mt-0.5 size-3.5 flex-none text-success" />
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
              <li className="flex gap-2 text-xs leading-relaxed text-fg-secondary">
                <Undo2 className="mt-0.5 size-3.5 flex-none text-fg-tertiary" />
                <span className="min-w-0">撤销窗口 5 分钟，超时需走变更单</span>
              </li>
            </ul>
          </ScenePanel>

          <Alert
            type={decision === 'rejected' ? 'info' : decision === 'done' ? 'success' : 'warning'}
            showIcon
            message={
              decision === 'rejected'
                ? '已拒绝'
                : decision === 'done'
                  ? '执行成功'
                  : decision === 'running'
                    ? '正在执行'
                    : '别只看 SQL'
            }
            description={
              decision === 'rejected'
                ? 'Agent 已改为影子库只读预演，不会碰生产数据。'
                : decision === 'done'
                  ? '12 项约束复检通过，索引已生效。'
                  : decision === 'running'
                    ? '正在建索引，写入会短暂阻塞…'
                    : '确认它锁的是哪张表、锁多久，比确认 SQL 本身更重要。'
            }
          />
        </div>
      </div>

      <div className="mt-3">
        <SceneLabel extra="Agent 会接着往下走">协作记录</SceneLabel>
        <ScenePanel className="p-3">
          {decision === 'pending' ? (
            <ChatMessage role="assistant" name="Octop Agent">
              <p className="m-0">
                我准备把 <code className="rounded bg-canvas px-1 font-mono text-xs">idx_orders_tenant_created</code>{' '}
                建到生产库上，只锁写不锁读。你看一眼计划，批准后我就执行；不放心的话我先去影子库跑一遍。
              </p>
            </ChatMessage>
          ) : decision === 'rejected' ? (
            <ChatMessage role="assistant" name="Octop Agent">
              <p className="m-0">
                收到，生产库不动。我在影子库上预演完了：计划耗时 3.4s，锁表 3.1s，索引命中率预计提升 62%。
                需要正式变更的话，把变更单号给我。
              </p>
            </ChatMessage>
          ) : decision === 'running' ? (
            <ChatMessage role="assistant" name="Octop Agent" loading />
          ) : (
            <ChatMessage role="assistant" name="Octop Agent">
              <p className="m-0">
                执行完了：3.1s 建索引，复检 12 项约束全部通过。慢查询 P95 从 412ms 降到 96ms，
                回滚脚本我放在变更记录里，5 分钟内可以撤。
              </p>
            </ChatMessage>
          )}
        </ScenePanel>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="审批 · 0021_add_tenant_index"
        width={560}
        footer={
          <div className="flex items-center justify-between gap-2">
            <span className="text-2xs text-fg-tertiary">批准后 5 分钟内可撤销</span>
            <div className="flex items-center gap-2">
              <Button size="small" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button size="small" type="primary" disabled={!checked} onClick={approve}>
                确认执行
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Alert
            type="warning"
            showIcon
            message="这是生产库的写操作"
            description="执行期间该表的 INSERT / UPDATE 会排队等待，最长 3.2 秒。读请求不受影响。"
          />

          <Descriptions
            size="small"
            column={1}
            items={[
              { label: '发起者', children: 'Octop Agent · 运行 #8f2a' },
              { label: '目标', children: 'prod-cn-shanghai / orders' },
              { label: '策略', children: 'write.prod · 必须人工确认' },
              { label: '预演结果', children: '影子库通过 · 耗时 3.1s' },
              { label: '审批人', children: '你（liukewi）' },
            ]}
          />

          <div>
            <div className="mb-2 text-xs font-medium text-fg-secondary">变更语句</div>
            <CodeBlock language="sql" code={SQL} copyable />
          </div>

          <Collapse
            ghost
            size="small"
            items={[
              {
                key: 'rollback',
                label: '回滚脚本',
                children: <CodeBlock language="sql" code={ROLLBACK} copyable />,
              },
              {
                key: 'plan',
                label: '执行计划（EXPLAIN）',
                children: (
                  <CodeBlock
                    language="text"
                    code={`Index Scan using idx_orders_tenant_created on orders
  Filter: (deleted_at IS NULL)
  Planning Time: 0.412 ms
  Execution Time: 96.128 ms`}
                  />
                ),
              },
            ]}
          />

          <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
            <span className="text-xs leading-relaxed text-fg-secondary">
              我已知晓锁表窗口，并确认当前不在业务高峰（当前 QPS 3.2k，低于阈值 5k）。
            </span>
          </Checkbox>

          <div className="flex items-center gap-1 text-2xs text-fg-disabled">
            <ChevronRight className="size-3" />
            <span>确认后 Agent 会继续执行并回填结果，无需再开一次会话。</span>
          </div>
        </div>
      </Drawer>

      {decision === 'rejected' ? (
        <p className="m-0 mt-2 flex items-center gap-1 text-2xs text-fg-disabled">
          <X className="size-3" />
          拒绝也是一条明确的指令 —— 把「换条路」写清楚，比让它反复重试有用。
        </p>
      ) : null}
    </SceneFrame>
  );
}
