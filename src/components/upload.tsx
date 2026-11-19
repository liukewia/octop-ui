import { useRef, useState } from 'react';
import { FileText, ImageIcon, Paperclip, UploadCloud, X } from 'lucide-react';
import { cn } from '../lib/cn';

export type UploadStatus = 'uploading' | 'done' | 'error' | 'removed';

export interface UploadFile {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  status?: UploadStatus;
  percent?: number;
  url?: string;
  thumbUrl?: string;
  originFileObj?: File;
  response?: unknown;
  error?: unknown;
}

export interface UploadChangeInfo {
  file: UploadFile;
  fileList: UploadFile[];
}

export interface UploadProps {
  fileList?: UploadFile[];
  defaultFileList?: UploadFile[];
  onChange?: (info: UploadChangeInfo) => void;
  onRemove?: (file: UploadFile) => boolean | void | Promise<boolean | void>;
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean | File>;
  customRequest?: (options: {
    file: File;
    onSuccess?: (response: unknown) => void;
    onError?: (error: unknown) => void;
    onProgress?: (percent: number) => void;
  }) => void;
  multiple?: boolean;
  accept?: string;
  maxCount?: number;
  disabled?: boolean;
  drag?: boolean;
  listType?: 'text' | 'picture';
  showUploadList?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function toUploadFile(file: File, index: number): UploadFile {
  return {
    uid: `${Date.now()}-${index}`,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'uploading',
    percent: 0,
    url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    originFileObj: file,
  };
}

export function Upload({
  fileList,
  defaultFileList = [],
  onChange,
  onRemove,
  beforeUpload,
  customRequest,
  multiple,
  accept,
  maxCount,
  disabled,
  drag,
  listType = 'text',
  showUploadList = true,
  children,
  className,
  style,
}: UploadProps) {
  const [inner, setInner] = useState<UploadFile[]>(defaultFileList);
  const list = fileList ?? inner;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const update = (next: UploadFile[]) => {
    if (fileList === undefined) setInner(next);
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    const candidates = maxCount ? files.slice(0, Math.max(0, maxCount - list.length)) : files;
    const accepted: File[] = [];
    for (const file of candidates) {
      const result = await beforeUpload?.(file, candidates);
      if (result === false) continue;
      accepted.push(result instanceof File ? result : file);
    }
    if (!accepted.length) return;

    const created = accepted.map(toUploadFile);
    let next = [...list, ...created];
    update(next);
    created.forEach((file) => onChange?.({ file, fileList: next }));

    // 没有真实上传地址时，按「本地就绪」处理：进度走完后置为 done
    created.forEach((uploadFile) => {
      const file = uploadFile.originFileObj as File;
      if (customRequest) {
        customRequest({
          file,
          onSuccess: () => {
            next = next.map((item) => (item.uid === uploadFile.uid ? { ...item, status: 'done', percent: 100 } : item));
            update(next);
            onChange?.({ file: next.find((i) => i.uid === uploadFile.uid) as UploadFile, fileList: next });
          },
          onError: () => {
            next = next.map((item) => (item.uid === uploadFile.uid ? { ...item, status: 'error' } : item));
            update(next);
          },
          onProgress: (percent) => {
            next = next.map((item) => (item.uid === uploadFile.uid ? { ...item, percent } : item));
            update(next);
          },
        });
        return;
      }
      window.setTimeout(() => {
        next = next.map((item) => (item.uid === uploadFile.uid ? { ...item, status: 'done', percent: 100 } : item));
        update(next);
        onChange?.({ file: next.find((i) => i.uid === uploadFile.uid) as UploadFile, fileList: next });
      }, 320);
    });
  };

  const remove = async (file: UploadFile) => {
    const allowed = await onRemove?.(file);
    if (allowed === false) return;
    const next = list.filter((item) => item.uid !== file.uid);
    update(next);
    onChange?.({ file: { ...file, status: 'removed' }, fileList: next });
  };

  const trigger = (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        if (!drag) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (!drag) return;
        e.preventDefault();
        setDragOver(false);
        if (!disabled) void handleFiles(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        drag &&
          cn(
            'ax-press flex cursor-pointer flex-col items-center justify-center gap-2 rounded-container border border-dashed px-6 py-8 text-center transition-colors',
            dragOver ? 'border-accent bg-muted-soft' : 'border-line-strong bg-muted-soft/60 hover:border-fg-tertiary',
            disabled && 'cursor-not-allowed opacity-60',
          ),
        !drag && 'inline-flex cursor-pointer',
        className,
      )}
      style={style}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          void handleFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      {children ??
        (drag ? (
          <>
            <UploadCloud className="size-6 text-fg-tertiary" />
            <div className="text-base text-fg">点击或拖拽文件到此处上传</div>
            <div className="text-xs text-fg-tertiary">支持单个或批量上传</div>
          </>
        ) : (
          <span className="ax-press inline-flex h-[var(--ax-h-md)] items-center gap-2 rounded-element bg-muted px-4 text-base font-medium text-fg">
            <Paperclip className="size-4" />
            选择文件
          </span>
        ))}
    </div>
  );

  return (
    <div className="w-full">
      {trigger}
      {showUploadList && list.length > 0 && (
        <ul className="m-0 mt-2 list-none space-y-1 p-0">
          {list.map((file) => (
            <li
              key={file.uid}
              className="flex items-center gap-2 rounded-element border border-line bg-surface px-2.5 py-1.5 text-sm"
            >
              {listType === 'picture' && file.url ? (
                <img src={file.url} alt={file.name} className="size-8 shrink-0 rounded-inner object-cover" />
              ) : file.type?.startsWith('image/') ? (
                <ImageIcon className="size-4 shrink-0 text-fg-tertiary" />
              ) : (
                <FileText className="size-4 shrink-0 text-fg-tertiary" />
              )}
              <span className="min-w-0 flex-1 truncate text-fg">{file.name}</span>
              {file.status === 'uploading' && (
                <span className="shrink-0 text-xs tabular-nums text-fg-tertiary">{file.percent ?? 0}%</span>
              )}
              {file.status === 'error' && <span className="shrink-0 text-xs text-danger-fg">失败</span>}
              <button
                type="button"
                aria-label="移除文件"
                onClick={() => void remove(file)}
                className="ax-press inline-flex size-5 shrink-0 items-center justify-center rounded-full text-fg-tertiary hover:bg-muted hover:text-fg"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
