import { QrCode } from './qrcode-code.engine';
import { QrSegment } from './qrcode-segment.engine';
import { Ecc } from './qrcode-ecc.engine';
import type { ImageSettings, QRCodeErrorLevel } from './qrcode.types';

const errorLevels = { L: Ecc.LOW, M: Ecc.MEDIUM, Q: Ecc.QUARTILE, H: Ecc.HIGH };

/** Сегментация и автоматический выбор версии/маски из useQRCode 2.0.0. */
export function encodeQRCode(
  value: string | string[],
  level: QRCodeErrorLevel = 'M',
  boostLevel = true
) {
  const values = Array.isArray(value) ? value : [value];
  const segments = values.flatMap(text => QrSegment.makeSegments(text));

  return QrCode.encodeSegments(segments, errorLevels[level], 1, undefined, undefined, boostLevel);
}

/** Алгоритмы путей/изображений rc-qrcode 2.0.0 и qrcode.react (ISC). */
export function qrCodePath(modules: boolean[][], margin = 0) {
  const operations: string[] = [];

  modules.forEach((row, y) => {
    let start: number | null = null;

    row.forEach((cell, x) => {
      if (!cell && start !== null) {
        operations.push(`M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`);
        start = null;

        return;
      }

      if (x === row.length - 1) {
        if (!cell) return;

        if (start === null)
          operations.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`);
        else
          operations.push(`M${start + margin},${y + margin} h${x + 1 - start}v1H${start + margin}z`);

        return;
      }

      if (cell && start === null)
        start = x;
    });
  });

  return operations.join('');
}

export interface QRCodeExcavation { x: number; y: number; w: number; h: number; }

export function excavateQRCode(modules: boolean[][], excavation: QRCodeExcavation) {
  return modules.slice().map((row, y) => {
    if (y < excavation.y || y >= excavation.y + excavation.h) return row;

    return row.map((cell, x) =>
      x < excavation.x || x >= excavation.x + excavation.w ? cell : false
    );
  });
}

export function qrCodeImage(
  modules: boolean[][],
  size: number,
  margin: number,
  image?: ImageSettings
) {
  if (image == null) return null;

  const numCells = modules.length + margin * 2;
  const defaultSize = Math.floor(size * 0.1);
  const scale = numCells / size;
  const w = (image.width || defaultSize) * scale;
  const h = (image.height || defaultSize) * scale;
  const x = image.x == null ? modules.length / 2 - w / 2 : image.x * scale;
  const y = image.y == null ? modules.length / 2 - h / 2 : image.y * scale;
  const opacity = image.opacity == null ? 1 : image.opacity;
  let excavation: QRCodeExcavation | null = null;

  if (image.excavate) {
    const floorX = Math.floor(x);
    const floorY = Math.floor(y);
    excavation = {
      x: floorX,
      y: floorY,
      w: Math.ceil(w + x - floorX),
      h: Math.ceil(h + y - floorY)
    };
  }

  return { x, y, h, w, excavation, opacity, crossOrigin: image.crossOrigin };
}

export function qrCodeMargin(marginSize?: number) {
  return marginSize != null ? Math.max(Math.floor(marginSize), 0) : 0;
}

/** pickAttrs(rest, true) выбирает role/aria; data-* остаётся на root. */
export function qrCodeAttributes(attributes: Record<string, unknown>) {
  const drawing: Record<string, unknown> = {};
  const root: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(attributes))
    (key === 'role' || key.startsWith('aria-') ? drawing : root)[key] = value;

  return { drawing, root };
}

/** Читает только width/height plain CSS, сохраняя строки calc/var и delimiters внутри quotes. */
export function qrCodeDimensions(style?: string) {
  const dimensions: { width?: string; height?: string; } = {};
  let quote = '';
  let depth = 0;
  let declaration = '';
  const source = style ?? '';

  function publish() {
    const colon = declaration.indexOf(':');
    const name = declaration.slice(0, colon).trim().toLowerCase();

    if (colon >= 0 && (name === 'width' || name === 'height')) {
      const value = declaration.slice(colon + 1).trim();
      const previous = dimensions[name];
      const important = /!\s*important\s*$/i;

      if (value && (!previous || !important.test(previous) || important.test(value)))
        dimensions[name] = value;
    }

    declaration = '';
  }

  for (let index = 0; index <= source.length; index++) {
    const char = source[index];

    if (quote) {
      declaration += char;

      if (char === '\\') declaration += source[++index] ?? '';
      else if (char === quote) quote = '';
    } else if (char === '/' && source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2);
      index = end === -1 ? source.length : end + 1;
      declaration += ' ';
    } else if (char === '"' || char === "'") {
      quote = char;
      declaration += char;
    } else if (char === '(') {
      depth++;
      declaration += char;
    } else if (char === ')') {
      depth--;
      declaration += char;
    } else if ((char === ';' && depth === 0) || index === source.length) {
      publish();
    } else {
      declaration += char;
    }
  }

  return dimensions;
}
