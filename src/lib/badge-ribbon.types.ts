import type { Snippet } from 'svelte';

export type BadgeRibbonPlacement = 'start' | 'end';
export type BadgeRibbonContent = string | number | boolean | null | Snippet;

export interface BadgeRibbonSlots {
  root?: string;
  content?: string;
  indicator?: string;
}

/** CSS задаётся строками; callback получает props с разрешённым placement. */
export type BadgeRibbonSemantic = BadgeRibbonSlots
  | ((info: { props: BadgeRibbonProps; }) => BadgeRibbonSlots | undefined);

/** class/style относятся к ленте, semantic root — к обёртке содержимого. */
export interface BadgeRibbonConfig {
  class?: string;
  style?: string;
  classNames?: BadgeRibbonSemantic;
  styles?: BadgeRibbonSemantic;
}

/** Badge.Ribbon 6.6.8; start/end следуют направлению текста. */
export interface BadgeRibbonProps extends BadgeRibbonConfig {
  text?: BadgeRibbonContent;
  children?: BadgeRibbonContent;
  color?: string;
  /** @defaultValue 'end' */
  placement?: BadgeRibbonPlacement;
  rootClassName?: string;
  /** Переопределяет DOM prefix; vendor CSS использует исходный ant-ribbon. */
  prefixCls?: string;
  /** bind:nativeElement заменяет RibbonRef.nativeElement и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
