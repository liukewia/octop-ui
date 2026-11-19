import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ZoomIn } from 'lucide-react';
import { cn } from '../lib/cn';

export interface ImagePreviewConfig {
  visible?: boolean;
  open?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  src?: string;
}

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  width?: number | string;
  height?: number | string;
  preview?: boolean | ImagePreviewConfig;
  fallback?: string;
  placeholder?: React.ReactNode;
  wrapperClassName?: string;
}

export function Image({
  src,
  alt = '',
  width,
  height,
  preview = true,
  fallback,
  placeholder,
  className,
  wrapperClassName,
  style,
  onError,
  ...rest
}: ImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [innerOpen, setInnerOpen] = useState(false);

  const config = typeof preview === 'object' ? preview : undefined;
  const previewable = preview !== false && !!src && !failed;
  const open = config?.open ?? config?.visible ?? innerOpen;
  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    config?.onOpenChange?.(next);
    config?.onVisibleChange?.(next);
  };

  return (
    <>
      <span
        className={cn('group relative inline-block overflow-hidden rounded-element bg-muted-soft', wrapperClassName)}
        style={{ width, height, ...style }}
      >
        {!loaded && placeholder && (
          <span className="absolute inset-0 grid place-items-center text-fg-disabled">{placeholder}</span>
        )}
        {failed && fallback ? (
          <img src={fallback} alt={alt} className={cn('size-full object-cover', className)} />
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              setFailed(true);
              onError?.(e);
            }}
            className={cn('size-full object-cover', previewable && 'cursor-zoom-in', className)}
            {...rest}
          />
        )}
        {previewable && (
          <button
            type="button"
            aria-label="预览大图"
            onClick={() => setOpen(true)}
            className="ax-focus absolute inset-0 grid place-items-center bg-black/0 text-transparent transition-colors duration-[125ms] hover:bg-black/25 hover:text-white"
          >
            <ZoomIn className="size-5" />
          </button>
        )}
      </span>

      {previewable && (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm data-[state=open]:animate-fade-in" />
            <DialogPrimitive.Content
              aria-describedby={undefined}
              aria-label={alt || '图片预览'}
              className="fixed inset-0 z-[1000] grid place-items-center p-6 outline-none data-[state=open]:animate-dialog-in"
              onClick={() => setOpen(false)}
            >
              <img
                src={config?.src ?? src}
                alt={alt}
                className="max-h-full max-w-full rounded-element object-contain shadow-high"
                onClick={(e) => e.stopPropagation()}
              />
              <DialogPrimitive.Close
                aria-label="关闭"
                className="ax-press absolute end-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </>
  );
}
