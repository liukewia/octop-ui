/* =============================================================================
   Theme tokens
   -----------------------------------------------------------------------------
   把「基础色 / 主色 / 圆角 / 密度 / 字体」五个旋钮，推导成一整套 --ax-*。
   推导只发生在 JS 里，产物是一段 CSS：把 :root 与 .dark 同时写出来，
   所以换主题不需要重新构建，也不需要给组件加任何 props。
   ============================================================================= */

export type ThemeBaseId = 'neutral' | 'stone' | 'cool' | 'sage' | 'mauve';
export type ThemeDensity = 'compact' | 'default' | 'relaxed';
export type ThemeFont = 'figtree' | 'system' | 'serif' | 'mono';

export interface ThemeConfig {
  /** 中性色的色相基底：决定画布、描边、次级文字偏冷还是偏暖 */
  base: ThemeBaseId;
  /** 主色（浅色模式）。十六进制 */
  accent: string;
  /** 深色模式的主色；不传时按 accent 的明度自动推导 */
  accentDark?: string;
  /** 圆角基准：其余三档按比例推出来 */
  radius: number;
  density: ThemeDensity;
  font: ThemeFont;
}

export interface ThemeBase {
  id: ThemeBaseId;
  name: string;
  hint: string;
  hue: number;
  chroma: number;
  /** 选择器上那颗小圆点的颜色（浅色 / 深色各一半，暗示两套模式都会跟着变） */
  swatch: string;
  swatchDark: string;
}

export const THEME_BASES: ThemeBase[] = [
  { id: 'neutral', name: '中性', hint: '纯灰，不带色相', hue: 0, chroma: 0, swatch: '#f1f1f1', swatchDark: '#303030' },
  { id: 'stone', name: '暖石', hint: '略偏暖，纸感', hue: 70, chroma: 0.006, swatch: '#f4f0e9', swatchDark: '#33302b' },
  { id: 'cool', name: '冷灰', hint: '略偏蓝，工具感', hue: 258, chroma: 0.008, swatch: '#edf0f6', swatchDark: '#2a2e37' },
  { id: 'sage', name: '青苔', hint: '略偏绿，自然感', hue: 160, chroma: 0.008, swatch: '#ecf3ee', swatchDark: '#2a312b' },
  { id: 'mauve', name: '藕紫', hint: '略偏紫，柔一点', hue: 310, chroma: 0.008, swatch: '#f2edf5', swatchDark: '#322c36' },
];

export const THEME_FONTS: { id: ThemeFont; name: string; stack: string; note: string }[] = [
  {
    id: 'figtree',
    name: 'Figtree',
    note: '几何无衬线',
    stack:
      "Figtree, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  },
  {
    id: 'system',
    name: '系统',
    note: '零加载',
    stack:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Roboto, Helvetica, Arial, sans-serif",
  },
  {
    id: 'serif',
    name: '衬线',
    note: '阅读型',
    stack:
      "'Songti SC', 'Source Han Serif SC', 'Noto Serif SC', Georgia, 'Times New Roman', serif",
  },
  {
    id: 'mono',
    name: '等宽',
    note: '工程感',
    stack:
      "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
];

export const THEME_DENSITIES: { id: ThemeDensity; name: string; heights: [number, number, number] }[] =
  [
    { id: 'compact', name: '紧凑', heights: [28, 36, 44] },
    { id: 'default', name: '标准', heights: [32, 40, 48] },
    { id: 'relaxed', name: '宽松', heights: [36, 44, 52] },
  ];

/** 主色候选：跨色相各取一个「能当实心按钮」的浓度 */
export const THEME_ACCENTS = [
  { name: '墨黑', value: '#1b1b1b' },
  { name: '砖红', value: '#c2410c' },
  { name: '正红', value: '#c02626' },
  { name: '玫红', value: '#be185d' },
  { name: '紫罗兰', value: '#7c3aed' },
  { name: '靛蓝', value: '#1d4ed8' },
  { name: '深青', value: '#0f766e' },
  { name: '森绿', value: '#2f6b4f' },
];

export interface ThemePreset {
  id: string;
  name: string;
  hint: string;
  config: ThemeConfig;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'mono',
    name: '单色',
    hint: '默认灰阶',
    config: {
      base: 'neutral',
      accent: '#1b1b1b',
      accentDark: '#f1f1f1',
      radius: 6,
      density: 'default',
      font: 'figtree',
    },
  },
  {
    id: 'sand',
    name: '暖沙',
    hint: '暖中性 + 陶土',
    config: {
      base: 'stone',
      accent: '#a15c2b',
      accentDark: '#e6bd97',
      radius: 10,
      density: 'default',
      font: 'figtree',
    },
  },
  {
    id: 'forest',
    name: '深林',
    hint: '青苔 + 墨绿',
    config: {
      base: 'sage',
      accent: '#2f6b4f',
      accentDark: '#a9d9bf',
      radius: 4,
      density: 'compact',
      font: 'figtree',
    },
  },
  {
    id: 'ocean',
    name: '海蓝',
    hint: '冷灰 + 靛蓝',
    config: {
      base: 'cool',
      accent: '#1d4ed8',
      accentDark: '#96b3ff',
      radius: 8,
      density: 'default',
      font: 'system',
    },
  },
  {
    id: 'violet',
    name: '紫夜',
    hint: '藕紫 + 紫罗兰',
    config: {
      base: 'mauve',
      accent: '#7c3aed',
      accentDark: '#c7acff',
      radius: 12,
      density: 'default',
      font: 'figtree',
    },
  },
  {
    id: 'press',
    name: '铅印',
    hint: '全直角 + 衬线',
    config: {
      base: 'neutral',
      accent: '#111111',
      accentDark: '#f5f5f5',
      radius: 0,
      density: 'compact',
      font: 'serif',
    },
  },
];

export const DEFAULT_THEME: ThemeConfig = THEME_PRESETS[0].config;

/* ------------------------------------------------------------------ 颜色工具 */

const HEX = /^#([\da-f]{3}|[\da-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX.test(value.trim());
}

/** 把 #rgb / #rrggbb 归一成小写 #rrggbb；解析不了就返回 null */
export function normalizeHex(value: string): string | null {
  const raw = value.trim();
  if (!HEX.test(raw)) return null;
  if (raw.length === 4) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
  }
  return raw.toLowerCase();
}

/** WCAG 相对亮度，只用来决定 on-accent 该黑还是该白 */
export function luminance(hex: string): number {
  const value = normalizeHex(hex);
  if (!value) return 0;
  const channel = (i: number) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/* --------------------------------------------------------------------- 推导 */

/** 去掉多余的小数位：100% 不写成 100.0%，色度 0 不写成 0.0000 */
const trim = (value: number, digits: number) =>
  String(Number(value.toFixed(digits)));

const oklch = (l: number, chroma: number, hue: number, alpha?: number) =>
  `oklch(${trim(l * 100, 1)}% ${trim(chroma, 4)} ${hue}${
    alpha === undefined ? '' : ` / ${alpha}`
  })`;

export interface ThemeTokens {
  light: Record<string, string>;
  dark: Record<string, string>;
}

function baseOf(id: ThemeBaseId): ThemeBase {
  return THEME_BASES.find((b) => b.id === id) ?? THEME_BASES[0];
}

function radiusScale(radius: number) {
  const r = clamp(Math.round(radius), 0, 16);
  return {
    inner: r,
    element: Math.round(r * 1.6667),
    container: Math.round(r * 2),
    page: Math.round(r * 4.6667),
  };
}

function heightsOf(density: ThemeDensity): [number, number, number] {
  return (THEME_DENSITIES.find((d) => d.id === density) ?? THEME_DENSITIES[1]).heights;
}

function fontOf(font: ThemeFont): string {
  return (THEME_FONTS.find((f) => f.id === font) ?? THEME_FONTS[0]).stack;
}

/** 主色在深色下是否「够亮」：太暗的话实心按钮会陷进页面里 */
function deriveAccentDark(config: ThemeConfig): string {
  if (config.accentDark && isHexColor(config.accentDark)) return normalizeHex(config.accentDark)!;
  const lum = luminance(config.accent);
  // 近黑的主色（默认的单色主题）在暗底上就是一块黑，得翻成浅色；
  // 有彩色的主色本身就能立住，保持原样更有辨识度。
  if (lum < 0.05) return `color-mix(in oklab, var(--ax-accent) 12%, white)`;
  return config.accent;
}

/**
 * 从五个旋钮推出浅色与深色两套令牌。
 * 数值不是随手写的：中性色阶按 oklch 明度排，浅色 100 / 96.6 / 38 / 50，
 * 深色 22 / 26 / 17 / 65 —— 和库里原来那套十六进制是同一档位。
 */
export function deriveTheme(config: ThemeConfig): ThemeTokens {
  const base = baseOf(config.base);
  const tint = base.chroma;
  const darkTint = base.chroma * 1.7;
  const hue = base.hue;
  const darkHue = base.hue;
  const light = (l: number, chroma = tint, alpha?: number) => oklch(l, chroma, hue, alpha);
  const dark = (l: number, chroma = darkTint, alpha?: number) =>
    oklch(l, chroma, darkHue, alpha);

  const accentDark = deriveAccentDark(config);
  const lum = luminance(config.accent);
  const darkLum = isHexColor(accentDark) ? luminance(accentDark) : 0.82;
  const onAccentLight = lum > 0.55 ? '#111111' : '#ffffff';
  const onAccentDark = darkLum > 0.55 ? '#111111' : '#ffffff';
  const radius = radiusScale(config.radius);
  const [hSm, hMd, hLg] = heightsOf(config.density);
  const font = fontOf(config.font);

  // 浅色下主色偏暗就靠提亮做 hover，偏亮就压深；深色下一律提亮
  const hoverLight =
    lum > 0.55
      ? 'color-mix(in oklab, var(--ax-accent) 86%, #000)'
      : 'color-mix(in oklab, var(--ax-accent) 86%, #fff)';

  return {
    light: {
      bg: base.chroma === 0 ? oklch(1, 0, 0) : light(0.99),
      surface: base.chroma === 0 ? oklch(1, 0, 0) : light(1),
      raised: base.chroma === 0 ? oklch(1, 0, 0) : light(1),
      canvas: light(0.966),
      muted: light(base.chroma === 0 ? 0 : 0.12, tint, 0.06),
      'muted-soft': light(base.chroma === 0 ? 0 : 0.12, tint, 0.035),
      'muted-strong': light(base.chroma === 0 ? 0 : 0.12, tint, 0.09),

      fg: light(base.chroma === 0 ? 0 : 0.12),
      'fg-secondary': light(0.38),
      'fg-tertiary': light(0.5),
      'fg-disabled': light(0.645),
      'fg-inverse': light(1),

      line: light(base.chroma === 0 ? 0 : 0.12, tint, 0.08),
      'line-soft': light(base.chroma === 0 ? 0 : 0.12, tint, 0.05),
      'line-strong': light(0.868),
      track: oklch(0.84, 0.01, 250),
      'switch-off': light(0.8),
      'switch-thumb': light(1),

      accent: config.accent,
      'accent-hover': hoverLight,
      'accent-soft': 'color-mix(in oklab, var(--ax-accent) 12%, var(--ax-surface))',
      'on-accent': onAccentLight,

      selection: 'color-mix(in oklab, var(--ax-accent) 18%, transparent)',
      skeleton: light(0.929),
      press: light(base.chroma === 0 ? 0 : 0.12, tint, 0.1),
      'press-soft': light(base.chroma === 0 ? 0 : 0.12, tint, 0.06),

      'radius-inner': `${radius.inner}px`,
      'radius-element': `${radius.element}px`,
      'radius-container': `${radius.container}px`,
      'radius-page': `${radius.page}px`,

      'h-sm': `${hSm}px`,
      'h-md': `${hMd}px`,
      'h-lg': `${hLg}px`,

      font,
    },
    dark: {
      bg: dark(0.22),
      surface: dark(0.26),
      raised: dark(0.29),
      canvas: dark(0.17),
      muted: dark(0.98, darkTint, 0.1),
      'muted-soft': dark(0.98, darkTint, 0.055),
      'muted-strong': dark(0.98, darkTint, 0.14),

      fg: dark(0.985),
      'fg-secondary': dark(0.65),
      'fg-tertiary': dark(0.8),
      'fg-disabled': dark(0.38),
      'fg-inverse': dark(0.18),

      line: dark(0.98, darkTint, 0.1),
      'line-soft': dark(0.98, darkTint, 0.06),
      'line-strong': dark(0.4),
      track: oklch(0.47, 0.01, 250),
      'switch-off': dark(0.43),
      'switch-thumb': dark(0.26),

      accent: accentDark,
      'accent-hover': 'color-mix(in oklab, var(--ax-accent) 86%, #fff)',
      'accent-soft': 'color-mix(in oklab, var(--ax-accent) 26%, var(--ax-surface))',
      'on-accent': onAccentDark,

      selection: 'color-mix(in oklab, var(--ax-accent) 26%, transparent)',
      skeleton: dark(0.3),
      press: dark(0.98, darkTint, 0.1),
      'press-soft': dark(0.98, darkTint, 0.06),

      'radius-inner': `${radius.inner}px`,
      'radius-element': `${radius.element}px`,
      'radius-container': `${radius.container}px`,
      'radius-page': `${radius.page}px`,

      'h-sm': `${hSm}px`,
      'h-md': `${hMd}px`,
      'h-lg': `${hLg}px`,

      font,
    },
  };
}

/* ------------------------------------------------------------- CSS 生成 */

/** 分组只为了导出的 CSS 好读，顺序也照抄库里的令牌表 */
export const TOKEN_GROUPS: { label: string; tokens: [string, string][] }[] = [
  {
    label: '面',
    tokens: [
      ['bg', '--ax-bg'],
      ['surface', '--ax-surface'],
      ['raised', '--ax-raised'],
      ['canvas', '--ax-canvas'],
      ['muted', '--ax-muted'],
      ['muted-soft', '--ax-muted-soft'],
      ['muted-strong', '--ax-muted-strong'],
    ],
  },
  {
    label: '字',
    tokens: [
      ['fg', '--ax-fg'],
      ['fg-secondary', '--ax-fg-secondary'],
      ['fg-tertiary', '--ax-fg-tertiary'],
      ['fg-disabled', '--ax-fg-disabled'],
      ['fg-inverse', '--ax-fg-inverse'],
    ],
  },
  {
    label: '线',
    tokens: [
      ['line', '--ax-line'],
      ['line-soft', '--ax-line-soft'],
      ['line-strong', '--ax-line-strong'],
      ['track', '--ax-track'],
      ['switch-off', '--ax-switch-off'],
      ['switch-thumb', '--ax-switch-thumb'],
    ],
  },
  {
    label: '主色',
    tokens: [
      ['accent', '--ax-accent'],
      ['accent-hover', '--ax-accent-hover'],
      ['accent-soft', '--ax-accent-soft'],
      ['on-accent', '--ax-on-accent'],
    ],
  },
  {
    label: '状态与选区',
    tokens: [
      ['selection', '--ax-selection'],
      ['skeleton', '--ax-skeleton'],
      ['press', '--ax-press'],
      ['press-soft', '--ax-press-soft'],
    ],
  },
  {
    label: '圆角',
    tokens: [
      ['radius-inner', '--ax-radius-inner'],
      ['radius-element', '--ax-radius-element'],
      ['radius-container', '--ax-radius-container'],
      ['radius-page', '--ax-radius-page'],
    ],
  },
  {
    label: '控件高度',
    tokens: [
      ['h-sm', '--ax-h-sm'],
      ['h-md', '--ax-h-md'],
      ['h-lg', '--ax-h-lg'],
    ],
  },
  { label: '字体', tokens: [['font', '--ax-font']] },
];

function block(selector: string, tokens: Record<string, string>): string {
  const lines = TOKEN_GROUPS.map((group) => {
    const body = group.tokens.map(([key, name]) => `  ${name}: ${tokens[key]};`).join('\n');
    return `  /* ${group.label} */\n${body}`;
  }).join('\n\n');
  return `${selector} {\n${lines}\n}`;
}

/**
 * 生成可直接粘贴的 CSS。
 * 选择器用 `html:root` / `html.dark`：比库里的 `:root` / `.dark` 多一层，
 * 无论这段样式插在哪里都能盖住默认值，又不至于把深色一起盖掉。
 */
export function themeToCss(config: ThemeConfig): string {
  const { light, dark } = deriveTheme(config);
  const base = baseOf(config.base);
  return `/* Octop UI theme · ${base.name} / ${config.accent} / r${config.radius} */
${block('html:root', light)}

${block('html.dark', dark)}

/* 令牌只管颜色、圆角、高度与字体；语义色（danger / success / info）与十色板
   保持库内取值，避免自定义主题把状态色的可读性一起带走。 */`;
}

/** 把主题写进 <style>，运行时热更；传 null 恢复库默认 */
export function applyTheme(config: ThemeConfig | null): void {
  if (typeof document === 'undefined') return;
  const ID = 'octop-theme-tokens';
  let tag = document.getElementById(ID) as HTMLStyleElement | null;
  if (!config) {
    tag?.remove();
    window.dispatchEvent(new Event('octop:theme'));
    return;
  }
  if (!tag) {
    tag = document.createElement('style');
    tag.id = ID;
    tag.dataset.octopTheme = 'true';
    document.head.appendChild(tag);
  }
  tag.textContent = themeToCss(config);
  // 文档里有几处写着具体数值（圆角、控件高度），让它们跟着令牌一起变
  window.dispatchEvent(new Event('octop:theme'));
}

const STORAGE_KEY = 'octop:theme';

export function readStoredTheme(): ThemeConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeTheme(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function storeTheme(config: ThemeConfig | null): void {
  try {
    if (!config) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* 隐私模式下 localStorage 会抛，忽略即可 */
  }
}

/** 外部来源（localStorage、URL）都要过一遍，坏数据不能把整页样式搞乱 */
export function sanitizeTheme(input: unknown): ThemeConfig | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Partial<ThemeConfig>;
  const base = THEME_BASES.some((b) => b.id === raw.base) ? (raw.base as ThemeBaseId) : 'neutral';
  const accent = normalizeHex(String(raw.accent ?? '')) ?? DEFAULT_THEME.accent;
  const accentDark = raw.accentDark ? normalizeHex(String(raw.accentDark)) : undefined;
  const radius = Number.isFinite(raw.radius) ? clamp(Number(raw.radius), 0, 16) : DEFAULT_THEME.radius;
  const density = THEME_DENSITIES.some((d) => d.id === raw.density)
    ? (raw.density as ThemeDensity)
    : 'default';
  const font = THEME_FONTS.some((f) => f.id === raw.font)
    ? (raw.font as ThemeFont)
    : 'figtree';
  return { base, accent, accentDark: accentDark ?? undefined, radius, density, font };
}

/** 预设命中判断：改完某个旋钮后，预设 chip 就不该再高亮 */
export function matchPreset(config: ThemeConfig): string | null {
  const hit = THEME_PRESETS.find(
    (preset) =>
      preset.config.base === config.base &&
      normalizeHex(preset.config.accent) === normalizeHex(config.accent) &&
      preset.config.radius === clamp(Math.round(config.radius), 0, 16) &&
      preset.config.density === config.density &&
      preset.config.font === config.font,
  );
  return hit?.id ?? null;
}
