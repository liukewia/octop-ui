const PRESENCE = 'data-[state=open]:animate-in data-[state=closed]:animate-out';
const FADE = 'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0';
const EASING = 'data-[state=open]:ease-standard data-[state=closed]:ease-exit';

export const POPUP_MOTION = [
  PRESENCE,
  FADE,
  EASING,
  'ax-popup-origin data-[state=open]:zoom-in-[0.98]',
  'data-[side=top]:slide-in-from-bottom-1 data-[side=bottom]:slide-in-from-top-1',
  'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
  'data-[state=open]:duration-[180ms] data-[state=closed]:duration-[110ms]',
].join(' ');

export const TOOLTIP_MOTION = [
  'data-[state=delayed-open]:animate-in data-[state=instant-open]:animate-in data-[state=closed]:animate-out',
  'data-[state=delayed-open]:fade-in-0 data-[state=instant-open]:fade-in-0 data-[state=closed]:fade-out-0',
  'data-[side=top]:slide-in-from-bottom-0.5 data-[side=bottom]:slide-in-from-top-0.5',
  'data-[side=left]:slide-in-from-right-0.5 data-[side=right]:slide-in-from-left-0.5',
  'duration-[120ms] ease-standard data-[state=closed]:duration-[90ms] data-[state=closed]:ease-exit',
  'data-[state=instant-open]:duration-0',
].join(' ');

export const DIALOG_MOTION = [
  PRESENCE,
  FADE,
  EASING,
  'data-[state=open]:zoom-in-[0.98] data-[state=open]:slide-in-from-bottom-1.5',
  'data-[state=open]:duration-[240ms] data-[state=closed]:duration-[130ms]',
].join(' ');

export const DRAWER_CLOCK = [
  PRESENCE,
  EASING,
  'data-[state=open]:duration-[280ms] data-[state=closed]:duration-[200ms]',
].join(' ');

export const DRAWER_MOTION: Record<'top' | 'right' | 'bottom' | 'left', string> = {
  right: 'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
  left: 'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  top: 'data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
  bottom: 'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
};

export const SHEET_MOTION = `${DRAWER_CLOCK} ${DRAWER_MOTION.bottom}`;

export const FADE_MOTION = [
  PRESENCE,
  FADE,
  EASING,
  'duration-[var(--ax-dur-fast)]',
].join(' ');

export const ENTER_ONCE = 'animate-in fade-in-0 duration-[var(--ax-dur-fast)] ease-standard';

export const FLOAT_IN =
  'animate-in fade-in-0 slide-in-from-bottom-1 duration-[180ms] ease-standard';

export const TOAST_IN =
  'animate-in fade-in-0 slide-in-from-top-1 duration-[180ms] ease-standard';
