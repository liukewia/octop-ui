import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../button';
import { Input } from '../input';
import { Modal } from '../modal';
import { Segmented } from '../segmented';
import { Slider } from '../slider';
import { Switch } from '../switch';
import { CodeBlock } from '../advanced/code-block';
import {
  DEFAULT_THEME,
  THEME_ACCENTS,
  THEME_BASES,
  THEME_DENSITIES,
  THEME_FONTS,
  THEME_PRESETS,
  matchPreset,
  normalizeHex,
  themeToCss,
  type ThemeConfig,
  type ThemePreset,
} from './tokens';

export interface ThemeEditorProps {
  value: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
  /** 恢复库默认主题；不传时退回 DEFAULT_THEME */
  onReset?: () => void;
  mode?: 'light' | 'dark';
  onModeChange?: (mode: 'light' | 'dark') => void;
  presets?: ThemePreset[];
  className?: string;
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('border-t border-line px-4 py-3 first:border-t-0', className)}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-fg">{label}</span>
        {hint ? <span className="text-xs text-fg-tertiary tabular-nums">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** 圆点选择器：描边靠 inset 影，避免选中环在深色下糊进背景 */
function Dot({
  label,
  color,
  active,
  onClick,
  className,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'ax-focus relative size-7 flex-none rounded-full shadow-[inset_0_0_0_1px_var(--ax-line)] transition-shadow duration-[125ms] ease-standard',
        active && 'ring-2 ring-fg ring-offset-2 ring-offset-surface',
        className,
      )}
      style={{ background: color }}
    >
      {active ? (
        <Check
          className="absolute inset-0 m-auto size-3.5"
          style={{ color: 'var(--ax-fg-inverse)' }}
          strokeWidth={3}
        />
      ) : null}
    </button>
  );
}

export function ThemeEditor({
  value,
  onChange,
  onReset,
  mode = 'light',
  onModeChange,
  presets = THEME_PRESETS,
  className,
}: ThemeEditorProps) {
  const [hex, setHex] = useState(value.accent);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => setHex(value.accent), [value.accent]);

  const activePreset = matchPreset(value);
  const presetName = presets.find((p) => p.id === activePreset)?.name;
  const css = useMemo(() => themeToCss(value), [value]);
  const radius = Math.round(value.radius);

  const patch = (next: Partial<ThemeConfig>) => onChange({ ...value, ...next });

  return (
    <div
      data-slot="theme-editor"
      className={cn(
        'flex flex-col overflow-hidden rounded-container border border-line bg-surface',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <div className="text-base font-medium text-fg">主题编辑器</div>
          <div className="text-xs text-fg-tertiary">改完立刻生效，刷新也不丢</div>
        </div>
        <span className="mt-0.5 flex h-6 flex-none items-center rounded-full bg-muted px-2 text-xs text-fg-secondary">
          {presetName ?? '自定义'}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Field label="预设" hint={`${presets.length} 套`}>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((preset) => {
              const active = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange({ ...preset.config })}
                  aria-pressed={active}
                  title={preset.hint}
                  className={cn(
                    'ax-focus flex h-9 items-center gap-2 rounded-inner border px-1.5 pr-2 text-left transition-colors duration-[125ms] ease-standard',
                    active ? 'border-fg bg-muted-soft' : 'border-line hover:bg-muted-soft',
                  )}
                >
                  <span
                    className="flex h-6 w-7 flex-none items-end gap-0.5 overflow-hidden bg-canvas p-1"
                    style={{ borderRadius: Math.max(2, preset.config.radius * 0.7) }}
                  >
                    <span
                      className="h-full w-1.5 flex-none"
                      style={{
                        background: preset.config.accent,
                        borderRadius: preset.config.radius * 0.5,
                      }}
                    />
                    <span className="h-2/3 w-1.5 flex-none rounded-[1px] bg-surface" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{preset.name}</span>
                  {active ? <Check className="size-3 flex-none text-fg" strokeWidth={3} /> : null}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="基础色" hint={THEME_BASES.find((b) => b.id === value.base)?.hint}>
          <div className="flex items-start justify-between gap-1">
            {THEME_BASES.map((base) => {
              const active = value.base === base.id;
              return (
                <button
                  key={base.id}
                  type="button"
                  onClick={() => patch({ base: base.id })}
                  aria-pressed={active}
                  className="ax-focus group flex min-w-0 flex-1 flex-col items-center gap-1.5"
                >
                  <span
                    className={cn(
                      'size-7 rounded-full shadow-[inset_0_0_0_1px_var(--ax-line)] transition-shadow duration-[125ms] ease-standard',
                      active && 'ring-2 ring-fg ring-offset-2 ring-offset-surface',
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${base.swatch} 0 50%, ${base.swatchDark} 50% 100%)`,
                    }}
                  />
                  <span
                    className={cn(
                      'truncate text-xs',
                      active ? 'font-medium text-fg' : 'text-fg-tertiary',
                    )}
                  >
                    {base.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="主色" hint={value.accent}>
          <div className="flex flex-wrap items-center gap-2">
            {THEME_ACCENTS.map((accent) => (
              <Dot
                key={accent.value}
                label={accent.name}
                color={accent.value}
                active={normalizeHex(value.accent) === accent.value}
                onClick={() => patch({ accent: accent.value, accentDark: undefined })}
              />
            ))}
            <label
              className="ax-focus relative size-7 flex-none cursor-pointer overflow-hidden rounded-full shadow-[inset_0_0_0_1px_var(--ax-line)]"
              title="自定义颜色"
              style={{
                background:
                  'conic-gradient(from 180deg, #f87171, #fbbf24, #4ade80, #38bdf8, #818cf8, #f472b6, #f87171)',
              }}
            >
              <span className="absolute inset-[3px] rounded-full bg-surface" />
              <input
                type="color"
                aria-label="自定义主色"
                value={value.accent}
                onChange={(event) =>
                  patch({ accent: event.target.value, accentDark: undefined })
                }
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input
              size="small"
              value={hex}
              aria-label="主色色值"
              onChange={(event) => {
                const next = event.target.value;
                setHex(next);
                const parsed = normalizeHex(next);
                if (parsed) patch({ accent: parsed, accentDark: undefined });
              }}
              onBlur={() => setHex(value.accent)}
              className="w-[104px] font-mono"
            />
            <span className="text-xs text-fg-tertiary">深浅两套会一起推导</span>
          </div>
        </Field>

        <Field label="圆角" hint={`${radius}px`}>
          <Slider
            value={radius}
            min={0}
            max={16}
            step={1}
            aria-label="圆角基准"
            onChange={(next) => patch({ radius: Array.isArray(next) ? next[0] : next })}
          />
          <div className="mt-3 flex items-end gap-3">
            {[
              { name: '内', size: Math.max(4, radius * 1.6667) },
              { name: '元', size: Math.max(6, radius * 2) },
              { name: '容', size: Math.max(8, radius * 4.6667) },
            ].map((item) => (
              <div key={item.name} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className="h-9 w-full border border-line-strong bg-canvas"
                  style={{ borderRadius: item.size }}
                />
                <span className="text-2xs text-fg-tertiary tabular-nums">
                  {item.name} {Math.round(item.size)}px
                </span>
              </div>
            ))}
          </div>
        </Field>

        <Field label="字体" hint={THEME_FONTS.find((f) => f.id === value.font)?.note}>
          <div className="grid grid-cols-4 gap-1.5">
            {THEME_FONTS.map((font) => {
              const active = value.font === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => patch({ font: font.id })}
                  aria-pressed={active}
                  className={cn(
                    'ax-focus relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-inner border px-1 text-center transition-colors duration-[125ms] ease-standard',
                    active ? 'border-fg bg-muted-soft' : 'border-line hover:bg-muted-soft',
                  )}
                >
                  <span
                    className="w-full truncate text-base leading-5 text-fg"
                    style={{ fontFamily: font.stack }}
                  >
                    Aa
                  </span>
                  <span
                    className={cn(
                      'w-full truncate text-2xs',
                      active ? 'text-fg' : 'text-fg-tertiary',
                    )}
                  >
                    {font.name}
                  </span>
                  {active ? (
                    <Check className="absolute end-1 top-1 size-2.5 text-fg" strokeWidth={3.5} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="密度" hint="控件高度">
          <Segmented
            block
            shape="round"
            value={value.density}
            options={THEME_DENSITIES.map((d) => ({ label: d.name, value: d.id }))}
            onChange={(next) => patch({ density: next as ThemeConfig['density'] })}
          />
        </Field>
      </div>

      <div className="border-t border-line px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-fg">深色模式</span>
          <Switch
            checked={mode === 'dark'}
            aria-label="切换深色模式"
            onChange={(checked) => onModeChange?.(checked ? 'dark' : 'light')}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button type="primary" block onClick={() => setExportOpen(true)}>
            导出 CSS
          </Button>
          <Button
            icon={<RotateCcw className="size-4" />}
            aria-label="恢复默认主题"
            onClick={() => {
              if (onReset) onReset();
              else onChange({ ...DEFAULT_THEME });
            }}
          >
            重置
          </Button>
        </div>
      </div>

      <Modal
        open={exportOpen}
        onCancel={() => setExportOpen(false)}
        title="把主题带走"
        width={720}
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-fg-tertiary">
              粘在 <code className="font-mono">@octop/ui/style.css</code> 之后即可
            </span>
            <Button onClick={() => setExportOpen(false)}>关闭</Button>
          </div>
        }
      >
        <p className="mb-3 text-sm text-fg-secondary">
          只覆盖颜色、圆角、控件高度与字体；语义色与十色板仍用库内取值。
        </p>
        <CodeBlock code={css} language="css" maxHeight={420} />
      </Modal>
    </div>
  );
}
