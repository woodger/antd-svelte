import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLCanvasAttributes, SVGAttributes } from 'svelte/elements';

export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H';
export type QRStatus = 'active' | 'expired' | 'loading' | 'scanned';

/** Исходные три подписи QRCode; ConfigProvider.locale.qrcode объединяется по полям. */
export interface QRCodeLocale {
  expired: string;
  refresh: string;
  scanned: string;
}

/** Низкоуровневые настройки изображения rc-qrcode; QRCode использует icon/iconSize. */
export interface ImageSettings {
  src: string;
  height: number;
  width: number;
  excavate: boolean;
  x?: number;
  y?: number;
  opacity?: number;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

/** Тип rc-qrcode для совместимости; низкоуровневые React renderers не экспортируются. */
export interface QRProps {
  value: string | string[];
  boostLevel?: boolean;
  size?: number;
  level?: QRCodeErrorLevel;
  bgColor?: string;
  fgColor?: string;
  style?: string;
  includeMargin?: boolean;
  marginSize?: number;
  imageSettings?: ImageSettings;
  title?: string;
  minVersion?: number;
}

export type QRPropsCanvas = QRProps & Omit<HTMLCanvasAttributes, keyof QRProps>;
export type QRPropsSvg = QRProps & Omit<SVGAttributes<SVGSVGElement>, keyof QRProps>;

/** Status snippet вызывается только для неактивного статуса и получает refresh callback. */
export interface StatusRenderInfo {
  status: Exclude<QRStatus, 'active'>;
  locale: QRCodeLocale;
  onRefresh?: () => void;
}

export interface QRCodeSlots {
  root?: string;
  cover?: string;
}

/** Callback получает разрешённые type/size/status/bordered/errorLevel/bgColor. */
export type QRCodeSemantic = QRCodeSlots
  | ((info: { props: QRCodeProps; }) => QRCodeSlots | undefined);

/** Root/cover оформление; вложенный ConfigProvider.qrcode заменяет объект целиком. */
export interface QRCodeConfig {
  class?: string;
  style?: string;
  classNames?: QRCodeSemantic;
  styles?: QRCodeSemantic;
}

/** QRCode Ant Design 6.6.8 с canvas/SVG; children и title не передаются в рисунок. */
export interface QRCodeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'class'> {
  /** Пустая строка не создаёт DOM; массив задаёт отдельные сегменты, включая пустой массив. */
  value: string | string[];
  /** По умолчанию canvas; SVG полностью формируется при SSR, canvas рисуется после mount. */
  type?: 'canvas' | 'svg';
  /** Размер bitmap и fallback root width/height, по умолчанию 160. */
  size?: number;
  /** По умолчанию цвет текста текущей темы; style.color не меняет модули. */
  color?: string;
  bgColor?: string;
  /** По умолчанию M. */
  errorLevel?: QRCodeErrorLevel;
  /** По умолчанию true: повышает коррекцию, если версия остаётся прежней. */
  boostLevel?: boolean;
  /** Quiet zone в модулях: floor и clamp снизу до 0; по умолчанию 0. */
  marginSize?: number;
  /** Изображение загружается с crossOrigin=anonymous; в SVG вырезается место до загрузки. */
  icon?: string;
  /** По умолчанию 40×40 px; 0 сохраняет fallback rc-qrcode к 10% от size. */
  iconSize?: number | { width: number; height: number; };
  /** По умолчанию true; false сохраняет прозрачную границу без padding/radius. */
  bordered?: boolean;
  status?: QRStatus;
  onRefresh?: () => void;
  /** Заменяет default cover content; пустой snippet не включает fallback. */
  statusRender?: Snippet<[StatusRenderInfo]>;
  class?: string;
  rootClassName?: string;
  /** После semantic root; только width/height plain style передаются также canvas/SVG. */
  style?: string;
  classNames?: QRCodeSemantic;
  styles?: QRCodeSemantic;
  /** Совместимый alias; нативный onclick имеет приоритет. */
  onClick?: HTMLAttributes<HTMLDivElement>['onclick'];
  /** Нативный root ref вместо React QRCodeRef; очищается при пустом value и unmount. */
  nativeElement?: HTMLDivElement;
}
