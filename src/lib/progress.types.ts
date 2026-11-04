import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type ProgressType = 'line' | 'circle';
export type ProgressStatus = 'normal' | 'active' | 'exception' | 'success';
export type ProgressCircleSize = 'small' | 'medium' | 'middle' | 'default' | number;
export type ProgressLineSize = ProgressCircleSize
  | [number | string, number]
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
  prefixCls?: string;
  percent?: number;
  showInfo?: boolean;
  /** Прежний formatter с одним аргументом вызывается один раз; второй — success percent. */
  format?: (percent: number, successPercent?: number) => ProgressContent;
  railColor?: string;
  /** @deprecated Используйте railColor. */
  trailColor?: string;
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

/** Line/steps и сохранённый native circle; dashboard/circular steps переносятся отдельно. */
export type ProgressProps = ProgressBaseProps & (
  | {
    type?: 'line';
    status?: ProgressStatus;
    size?: ProgressLineSize;
    strokeWidth?: number;
    strokeColor?: string | string[] | ProgressGradient;
    success?: ProgressSuccess;
    steps?: number | { count: number; gap: number; };
    rounding?: (step: number) => number;
    percentPosition?: PercentPositionType;
  }
  | {
    type: 'circle';
    status?: Exclude<ProgressStatus, 'active'>;
    size?: ProgressCircleSize;
    strokeWidth?: number;
    strokeColor?: string;
    success?: never;
    steps?: never;
    rounding?: never;
    percentPosition?: never;
  }
);

/** Undefined наследует record; явный объект заменяет его целиком. */
export type ProgressConfig = Pick<ProgressBaseProps, 'class' | 'style' | 'classNames' | 'styles'>;
