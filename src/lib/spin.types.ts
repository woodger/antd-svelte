import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type SpinSize = 'small' | 'medium' | 'large';
export type SpinContent = string | number | Snippet | null | boolean;
export type SpinSemanticSlots = Partial<Record<
  'root' | 'section' | 'indicator' | 'description' | 'container', string
>>;
export interface SpinSemanticInfo {
  props: SpinProps & { spinning: boolean; fullscreen: boolean; percent?: number; };
}
export interface SpinIndicatorInfo {
  percent?: number;
  prefixCls: string;
  class: string;
  style?: string;
}
/** Пассивный snippet; прежние snippets без аргументов также поддерживаются. */
export type SpinIndicator = Snippet<[SpinIndicatorInfo]>;
export interface SpinRef {
  nativeElement: HTMLDivElement;
}

/** Отдельный, вложенный или полноэкранный индикатор с сохранением busy children. */
export interface SpinProps extends Omit<
  HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style' | 'aria-hidden'
> {
  /** Локальный CSS prefix; отсутствие и пустая строка наследуют ConfigProvider. */
  prefixCls?: string;
  /** @defaultValue true */
  spinning?: boolean;
  /** @defaultValue 0 */
  delay?: number;
  /** Medium сохраняет обычный размер. */
  size?: SpinSize;
  description?: SpinContent;
  indicator?: SpinIndicator | null;
  children?: SpinContent;
  /** Фиксированный слой в текущей DOM-ветке, без portal или focus trap. */
  fullscreen?: boolean;
  percent?: number | 'auto';
  'aria-hidden'?: boolean;
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?: SpinSemanticSlots
    | ((info: SpinSemanticInfo) => SpinSemanticSlots | undefined);
  styles?: SpinSemanticSlots
    | ((info: SpinSemanticInfo) => SpinSemanticSlots | undefined);
  nativeElement?: HTMLDivElement;
  ref?: SpinRef;
}

/** Явный record заменяет родительский; undefined наследует его целиком. */
export type SpinConfig = Pick<SpinProps, 'class' | 'style' | 'indicator' | 'classNames' | 'styles'>;
