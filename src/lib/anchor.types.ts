import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { AffixProps } from './affix.types';
export type AnchorContainer = HTMLElement | Window;
export type AnchorContent = string | number | boolean | null | undefined | Snippet;
export type AnchorDirection = 'vertical' | 'horizontal';
export type AnchorSlots = Partial<Record<'root' | 'item' | 'itemTitle' | 'indicator', string>>;
/** Semantic callbacks получают текущие Props с resolved direction. */
export type AnchorSemantic = AnchorSlots | ((info: { props: AnchorProps; }) => AnchorSlots);
/** Общие стили Anchor; явно заданный вложенный record заменяет родительский целиком. */
export interface AnchorConfig {
  class?: string;
  style?: string;
  classNames?: AnchorSemantic;
  styles?: AnchorSemantic;
}
export interface AnchorItem {
  key: string | number;
  href: string;
  title?: AnchorContent;
  target?: string;
  class?: string;
  replace?: boolean;
  targetOffset?: number;
  children?: readonly AnchorItem[];
}
/** Навигация по разделам с отслеживанием прокрутки, вложенными items и Affix. */
export interface AnchorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style' | 'onchange' | 'onclick'
> {
  items?: readonly AnchorItem[];
  offsetTop?: number;
  bounds?: number;
  /** @defaultValue true */
  affix?: boolean | Omit<AffixProps, 'offsetTop' | 'target' | 'children'>;
  /** @defaultValue false */
  showInkInFixed?: boolean;
  getContainer?: () => AnchorContainer;
  getCurrentAnchor?: (activeLink: string) => string;
  onClick?: (event: MouseEvent, link: { title?: AnchorContent; href: string; }) => void;
  onChange?: (activeLink: string) => void;
  targetOffset?: number;
  /** @defaultValue 'vertical' */
  direction?: AnchorDirection;
  replace?: boolean;
  classNames?: AnchorSemantic;
  /** Root: context semantic → context style → local semantic → local style. */
  styles?: AnchorSemantic;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
