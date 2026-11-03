import type { Snippet } from 'svelte';
import type { GridResponsive } from './grid.types';

export type AvatarShape = 'circle' | 'square';
/** Карта использует наибольший совпавший breakpoint; отсутствие совпадений оставляет CSS defaults. */
export type AvatarSize = 'small' | 'medium' | 'large' | number | GridResponsive<number>;

/** Аватар с приоритетом изображения, icon и текста и fallback при ошибке загрузки. */
export interface AvatarProps {
  src?: string;
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
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** @defaultValue false */
  'aria-hidden'?: boolean;
  class?: string;
  style?: string;
}
