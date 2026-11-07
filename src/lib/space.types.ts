import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export type SpaceOrientation = 'horizontal' | 'vertical';
export type SpaceSize = ComponentSize | 'medium' | number;
export type SpaceContent = string | number | boolean | null | undefined | Snippet;
export interface SpaceItem {
  key: string | number;
  children?: SpaceContent;
}
export type SpaceSlots = Partial<Record<'root' | 'item' | 'separator', string>>;
/** Size/orientation/align разрешены; nodes и CSS сохраняют native Svelte contracts. */
export interface SpaceSemanticInfo {
  props: SpaceProps;
}
export type SpaceSemantic = SpaceSlots
  | ((info: SpaceSemanticInfo) => SpaceSlots | undefined);
/** Наследуемые настройки Space; явный record целиком заменяет родительский space. */
export interface SpaceConfig {
  /** Используется, когда локальный size отсутствует; componentSize не участвует. */
  size?: SpaceSize | readonly [SpaceSize, SpaceSize];
  class?: string;
  /** Между context styles.root и локальными styles.root/style. */
  style?: string;
  classNames?: SpaceSemantic;
  styles?: SpaceSemantic;
}
/** Интервалы, wrappers и separators между keyed items или одним children snippet. */
export interface SpaceProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  items?: readonly (SpaceContent | SpaceItem)[];
  children?: Snippet;
  /** Локальное значение → ConfigProvider.space.size → small. */
  size?: SpaceSize | readonly [SpaceSize, SpaceSize];
  orientation?: SpaceOrientation;
  vertical?: boolean;
  align?: 'start' | 'end' | 'center' | 'baseline';
  separator?: SpaceContent;
  wrap?: boolean;
  classNames?: SpaceSemantic;
  styles?: SpaceSemantic;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
