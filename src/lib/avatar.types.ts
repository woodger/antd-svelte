import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { GridResponsive } from './grid.types';

export type AvatarShape = 'circle' | 'square';
/** Карта использует наибольший совпавший breakpoint; отсутствие совпадений оставляет CSS defaults. */
export type AvatarSize = 'small' | 'medium' | 'large' | number | GridResponsive<number>;

/** Общие class/style Avatar; явный record заменяет родительский целиком. */
export interface AvatarConfig {
  class?: string;
  style?: string;
}

/** Аватар с приоритетом изображения, icon и текста и fallback при ошибке загрузки. */
export interface AvatarProps extends Omit<
  HTMLAttributes<HTMLSpanElement>, 'children' | 'class' | 'style'
> {
  /** Строкой управляет Avatar; готовый Snippet сохраняет собственные attrs/events и интерактивность. */
  src?: string | Snippet;
  srcSet?: string;
  alt?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  draggable?: boolean | 'true' | 'false';
  /** @defaultValue 'circle' */
  shape?: AvatarShape;
  /** Локальный размер имеет приоритет над контекстом; responsive map применяется после mount. */
  size?: AvatarSize;
  /** @defaultValue 4 */
  gap?: number;
  icon?: Snippet;
  children?: Snippet;
  onError?: () => boolean | void;
  /**
   * Click корневого span; keyboard behavior принадлежит владельцу.
   * Явный onclick имеет приоритет.
   */
  onClick?: HTMLAttributes<HTMLSpanElement>['onclick'];
  /** Bindable span; сохраняется при обновлениях содержимого и очищается при unmount. */
  nativeElement?: HTMLSpanElement;
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** @defaultValue false */
  'aria-hidden'?: boolean;
  class?: string;
  rootClassName?: string;
  style?: string;
  [key: `data-${string}`]: unknown;
}
