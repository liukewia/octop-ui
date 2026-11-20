import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 合并类名：clsx 处理条件，twMerge 让调用方传入的 className 能覆盖内置类 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 排除掉值为 undefined 的对象键，避免把 undefined 写进 DOM 属性 */
export function omitUndefined<T extends Record<string, unknown>>(obj: T): T {
  const next = {} as T;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) next[key] = obj[key];
  }
  return next;
}

/** validateStatus → data-invalid */
export function statusToInvalid(status?: 'error' | 'warning' | 'success' | '') {
  return status === 'error';
}
