import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { TagPresetColor } from './tag.types';

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';
export type BadgeColor = TagPresetColor | (string & {});
/** Deprecated default имеет геометрию medium; semantic callbacks получают исходное значение. */
export type BadgeSize = 'medium' | 'small' | 'default';
export type BadgeText = string | number | boolean | null | Snippet;
export type BadgeOffset = readonly [number | string, number | string];
/** Атрибуты исходного custom count; Snippet применяет их к собственному корню. */
export interface BadgeCountContext {
  class: string;
  style: string | undefined;
}

export type BadgeCount = number | string | boolean | null | Snippet<[BadgeCountContext]>;

export interface BadgeContext {
  /** Существующий числовой контракт: строка/Snippet не преобразуются в число. */
  count: number | undefined;
  descriptionId: string | undefined;
}

export interface BadgeSlots {
  root?: string;
  indicator?: string;
}

/** CSS задаётся строками; callback получает props с разрешёнными defaults. */
export type BadgeSemantic = BadgeSlots
  | ((info: { props: BadgeProps; }) => BadgeSlots | undefined);

export interface BadgeConfig {
  class?: string;
  style?: string;
  classNames?: BadgeSemantic;
  styles?: BadgeSemantic;
}

/** Счётчик или статус у дочернего содержимого; число и отображаемый текст различаются. */
export interface BadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>, 'children' | 'class' | 'style' | 'title' | 'color'
>, BadgeConfig {
  /** Snippet получает class/style вместо React.cloneElement; собственные attrs имеют приоритет. */
  count?: BadgeCount;
  /** @defaultValue 99 */
  overflowCount?: number;
  /** @defaultValue false */
  showZero?: boolean;
  /** @defaultValue false */
  dot?: boolean;
  status?: BadgeStatus;
  color?: BadgeColor;
  text?: BadgeText;
  /** @defaultValue 'medium' */
  size?: BadgeSize;
  /** X разбирается через parseFloat; строковый Y сохраняет CSS units. */
  offset?: BadgeOffset;
  title?: string | false | null;
  children?: Snippet<[BadgeContext]>;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
  rootClassName?: string;
  /** Нативный onclick имеет приоритет над React-compatible alias. */
  onClick?: HTMLAttributes<HTMLSpanElement>['onclick'];
  /** bind:nativeElement заменяет React ref и очищается при unmount. */
  nativeElement?: HTMLSpanElement;
}
