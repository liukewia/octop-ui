import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface CodeBlockProps {
  /** 代码正文；也可直接写 children */
  code?: string;
  children?: string;
  /** 右上角展示的语言标识，同时写进 data-language 供外部高亮器识别 */
  language?: string;
  /** 顶部标题；不传时显示 language */
  title?: React.ReactNode;
  copyable?: boolean;
  showLineNumbers?: boolean;
  /** 折叠高度，超出后内部滚动 */
  maxHeight?: number | string;
  /** 软换行，默认关（横向滚动更符合代码阅读习惯） */
  wrap?: boolean;
  onCopy?: (code: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  }
}

/**
 * 代码块：等宽、无高亮器也能读。行号是独立的列，复制的是纯代码。
 * 顶部条只在有标题 / 语言 / 复制按钮时才出现，避免短代码多出一条横线。
 */
export function CodeBlock({
  code,
  children,
  language,
  title,
  copyable = true,
  showLineNumbers = false,
  maxHeight,
  wrap = false,
  onCopy,
  className,
  style,
}: CodeBlockProps) {
  const source = code ?? children ?? '';
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(source);
    if (!ok) return;
    setCopied(true);
    onCopy?.(source);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  const header = title || language || copyable;
  const lines = source.replace(/\n$/, '').split('\n');

  return (
    <div
      className={cn(
        'overflow-hidden rounded-container border border-line bg-canvas text-fg',
        className,
      )}
      style={style}
    >
      {header && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-1.5">
          <span className="min-w-0 truncate text-xs font-medium text-fg-tertiary">
            {title ?? language}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {language && title && (
              <span className="font-mono text-[11px] text-fg-disabled">{language}</span>
            )}
            {copyable && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? '已复制' : '复制代码'}
                className="ax-press ax-focus inline-flex size-6 items-center justify-center rounded-inner text-fg-tertiary transition-colors duration-[125ms] ease-standard hover:bg-muted hover:text-fg"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
            )}
          </span>
        </div>
      )}

      <div
        className="overflow-auto"
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      >
        <pre
          data-language={language}
          className={cn(
            'm-0 flex gap-4 px-3 py-3 font-mono text-xs leading-[1.7]',
            wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
          )}
        >
          {showLineNumbers && (
            <code
              aria-hidden
              className="flex-none select-none text-end text-fg-disabled tabular-nums"
            >
              {lines.map((_, index) => (
                <span key={index} className="block">
                  {index + 1}
                </span>
              ))}
            </code>
          )}
          <code className="min-w-0 flex-1 text-fg">{source.replace(/\n$/, '')}</code>
        </pre>
      </div>
    </div>
  );
}
