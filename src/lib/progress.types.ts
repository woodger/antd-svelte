import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressStatus = 'normal' | 'active' | 'exception' | 'success';
export type ProgressCircleSize = 'small' | 'medium' | number
  | [number | string, number];
export type ProgressLineSize = ProgressCircleSize
  | { width?: number | string; height?: number; };
export type ProgressSize = ProgressLineSize;
export type ProgressContent = string | number | Snippet | null | boolean;
export type ProgressGradient = { direction?: string; }
  & (Record<string, string> | { from: string; to: string; });
export interface ProgressSuccess {
  percent?: number;
  strokeColor?: string;
}
export interface PercentPositionType {
  align?: 'start' | 'center' | 'end';
  type?: 'inner' | 'outer';
}
export type ProgressGapPlacement = 'top' | 'bottom' | 'start' | 'end';
export type ProgressSemanticSlots = Partial<Record<
  'root' | 'body' | 'rail' | 'track' | 'indicator', string
>>;
export interface ProgressSemanticInfo {
  props: ProgressProps & {
    type: ProgressType;
    percent: number;
    size: ProgressSize;
    showInfo: boolean;
  };
}

/** Общие параметры; значения, имена и finite normalization сохраняют native API. */
interface ProgressBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'
> {
  /** Локальный CSS prefix; отсутствие и пустая строка наследуют ConfigProvider. */
  prefixCls?: string;
  percent?: number;
  showInfo?: boolean;
  /** Прежний formatter с одним аргументом вызывается один раз; второй — success percent. */
  format?: (percent: number, successPercent?: number) => ProgressContent;
  railColor?: string;
  gapDegree?: number;
  gapPlacement?: ProgressGapPlacement;
  strokeLinecap?: 'round' | 'butt' | 'square';
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?: ProgressSemanticSlots
    | ((info: ProgressSemanticInfo) => ProgressSemanticSlots | undefined);
  styles?: ProgressSemanticSlots
    | ((info: ProgressSemanticInfo) => ProgressSemanticSlots | undefined);
  /** Нативный root после mount; очищается при unmount. */
  nativeElement?: HTMLDivElement;
  /** Как upstream, Progress рисует свой indicator вместо children. */
  children?: ProgressContent;
}

/** Line/steps и исходные circle/dashboard с сохранённой finite normalization. */
export type ProgressProps = ProgressBaseProps & (
  | {
    type?: 'line';
    status?: ProgressStatus;
    size?: ProgressLineSize;
    strokeWidth?: never;
    strokeColor?: string | string[] | ProgressGradient;
    success?: ProgressSuccess;
    steps?: number | { count: number; gap: number; };
    rounding?: (step: number) => number;
    percentPosition?: PercentPositionType;
  }
  | {
    type: 'circle' | 'dashboard';
    status?: ProgressStatus;
    size?: ProgressCircleSize;
    strokeWidth?: number;
    strokeColor?: string | string[] | ProgressGradient;
    success?: ProgressSuccess;
    steps?: number | { count: number; gap: number; };
    rounding?: (step: number) => number;
    percentPosition?: PercentPositionType;
  }
);

/** Undefined наследует record; явный объект заменяет его целиком. */
export type ProgressConfig = Pick<ProgressBaseProps, 'class' | 'style' | 'classNames' | 'styles'>;
