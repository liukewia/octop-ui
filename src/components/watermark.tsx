import { cn } from '../lib/cn';

export interface WatermarkProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content?: string | string[];
  image?: string;
  width?: number;
  height?: number;
  rotate?: number;
  zIndex?: number;
  gap?: [number, number];
  offset?: [number, number];
  font?: {
    color?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontFamily?: string;
  };
  children?: React.ReactNode;
}

/** 用一张内联 SVG 平铺做水印，不依赖 canvas，SSR 也安全 */
export function Watermark({
  content = 'octop/ui',
  image,
  width = 180,
  height = 120,
  rotate = -22,
  zIndex = 10,
  gap = [0, 0],
  offset = [0, 0],
  font,
  className,
  children,
  style,
  ...rest
}: WatermarkProps) {
  const lines = Array.isArray(content) ? content : [content];
  const fontSize = font?.fontSize ?? 14;
  const color = font?.color ?? 'rgba(0,0,0,0.10)';
  const family = font?.fontFamily ?? 'system-ui, sans-serif';
  const weight = font?.fontWeight ?? 500;

  const svg = image
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><image href="${image}" width="${width}" height="${height}" preserveAspectRatio="none"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <g transform="translate(${offset[0]},${offset[1]}) rotate(${rotate})" fill="${color}" font-family="${family}" font-size="${fontSize}" font-weight="${weight}">
          ${lines
            .map(
              (line, i) =>
                `<text x="0" y="${(i * (fontSize + 4)).toString()}">${line
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')}</text>`,
            )
            .join('')}
        </g>
      </svg>`;

  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  return (
    <div className={cn('relative', className)} style={style} {...rest}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex,
          backgroundImage: url,
          backgroundRepeat: 'repeat',
          backgroundPosition: `${gap[0]}px ${gap[1]}px`,
          backgroundSize: `${width}px ${height}px`,
        }}
      />
    </div>
  );
}
