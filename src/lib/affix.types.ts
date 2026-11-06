import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type AffixTarget = Window | HTMLElement;
export type AffixUpdatePosition = (() => void) & { cancel: () => void; };
/** Общие стили внешнего узла; вложенный record заменяется целиком. */
export interface AffixConfig {
  class?: string;
  style?: string;
}
/** Закрепляет содержимое у края выбранного окна или прокручиваемого контейнера. */
export interface AffixProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  /** Локальный CSS prefix fixed-узла; пустое значение использует ant-affix. */
  prefixCls?: string;
  children?: Snippet;
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => AffixTarget | null;
  onChange?: (affixed?: boolean) => void;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
export interface AffixPosition {
  edge: 'top' | 'bottom';
  offset: number;
  width: number;
  height: number;
}
