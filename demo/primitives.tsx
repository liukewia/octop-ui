import { cn } from '../src/lib/cn';

export function Section({
  id,
  title,
  api,
  desc,
  children,
}: {
  id: string;
  title: string;
  api?: string;
  desc?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 pb-16">
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <h2 className="m-0 text-2xl font-semibold text-fg sm:text-3xl">{title}</h2>
        {api && <code className="font-mono text-xs text-fg-disabled">{api}</code>}
      </div>
      {desc && <p className="mb-6 max-w-[720px] text-md leading-relaxed text-fg-secondary">{desc}</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Demo({
  label,
  code,
  span,
  dir = 'row',
  className,
  children,
}: {
  label: string;
  code?: string;
  span?: 'full';
  dir?: 'row' | 'column' | 'block';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', span === 'full' && 'sm:col-span-2', className)}>
      <div className="flex items-baseline justify-between gap-3 px-0.5 text-xs font-medium text-fg-secondary">
        <span>{label}</span>
        {code && <code className="truncate font-mono text-[11px] text-fg-disabled">{code}</code>}
      </div>
      <div
        className={cn(
          // 灰画布：真站是「标签在上、画布在下」，画布无描边无阴影
          'flex min-h-[132px] w-full min-w-0 gap-3 rounded-container bg-canvas p-6',
          dir === 'row' && 'flex-wrap items-center justify-center',
          dir === 'column' && 'flex-col items-stretch justify-center',
          dir === 'block' && 'block',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Row({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex w-full flex-wrap items-center gap-3', className)}>{children}</div>;
}

export function Stack({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex w-full flex-col gap-3', className)}>{children}</div>;
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-xs leading-relaxed text-fg-tertiary">{children}</p>;
}
