/**
 * 动效：改用 shadcn 的那套写法 —— `animate-in` / `animate-out` 两条 keyframe，
 * 方向、缩放、透明度各自是独立的开关类，组合出来才是最终动作。
 *
 * 时钟仍然走 Astryx 的令牌，所以到手的观感和以前一样：
 * 浮层 165ms 入场 / 125ms 退场，弹窗 400ms，抽屉 300/225ms。
 * 两种曲线也只有 standard（进）与 exit（退）。
 */

/** 浮层（Select / Popover / Dropdown / DatePicker）：淡入 + 0.95 缩放 + 贴着锚点那一侧推 8px */
export const POPUP_MOTION = [
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
  'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
  'data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2',
  'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
  'data-[state=open]:duration-[var(--ax-dur-fast-max)] data-[state=closed]:duration-[var(--ax-dur-fast)]',
  'data-[state=open]:ease-standard data-[state=closed]:ease-exit',
].join(' ');

/** Tooltip 的状态名是 delayed-open / instant-open，不是 open，得单独写一套 */
export const TOOLTIP_MOTION = [
  'data-[state=delayed-open]:animate-in data-[state=instant-open]:animate-in data-[state=closed]:animate-out',
  'data-[state=delayed-open]:fade-in-0 data-[state=instant-open]:fade-in-0 data-[state=closed]:fade-out-0',
  'data-[state=delayed-open]:zoom-in-95 data-[state=instant-open]:zoom-in-95 data-[state=closed]:zoom-out-95',
  'data-[side=top]:slide-in-from-bottom-1 data-[side=bottom]:slide-in-from-top-1',
  'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
  'duration-[var(--ax-dur-fast)] ease-standard',
].join(' ');

/** 对话框：Astryx 是「落位」——16px 上浮 + 0.95，不是 0.2 的弹出 */
export const DIALOG_MOTION = [
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
  'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-98',
  'data-[state=open]:slide-in-from-bottom-4',
  'data-[state=open]:duration-[var(--ax-dur-medium-max)] data-[state=closed]:duration-[var(--ax-dur-fast)]',
  'data-[state=open]:ease-standard data-[state=closed]:ease-exit',
].join(' ');

/** 底部抽屉：只做位移，不缩放 —— 大面积浮层一缩放就会「糊」 */
export const SHEET_MOTION = [
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  'data-[state=open]:duration-[var(--ax-dur-medium)] data-[state=closed]:duration-[var(--ax-dur-medium-min)]',
  'data-[state=open]:ease-standard data-[state=closed]:ease-exit',
].join(' ');

/** 纯遮罩：只动透明度 */
export const FADE_MOTION = [
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
  'duration-[var(--ax-dur-fast)] ease-standard',
].join(' ');

/** 抽屉的进出场：方向由 placement 决定 */
export const DRAWER_MOTION: Record<'top' | 'right' | 'bottom' | 'left', string> = {
  right: 'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
  left: 'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  top: 'data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
  bottom: 'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
};

export const DRAWER_CLOCK = [
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=open]:duration-[var(--ax-dur-medium)] data-[state=closed]:duration-[var(--ax-dur-medium-min)]',
  'data-[state=open]:ease-standard data-[state=closed]:ease-exit',
].join(' ');

/** 只播一次的入场（面板切换、Toast、加载指示） */
export const ENTER_ONCE = 'animate-in fade-in-0 duration-[var(--ax-dur-fast)] ease-standard';

/** 从下方 8px 处上浮的入场（悬浮工具条、Toast） */
export const FLOAT_IN =
  'animate-in fade-in-0 slide-in-from-bottom-2 duration-[var(--ax-dur-fast-max)] ease-standard';

/** Toast 从上方 8px 落下来，比浮层再快一档 */
export const TOAST_IN =
  'animate-in fade-in-0 slide-in-from-top-2 duration-[var(--ax-dur-fast)] ease-standard';
