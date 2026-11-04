import type { Snippet } from 'svelte';

export type SkeletonWidth = number | string;
export type SkeletonElementSize = 'small' | 'medium' | 'middle' | 'large' | 'default';
export type SkeletonAvatarSize = SkeletonElementSize | number;
export interface SkeletonElementSlots {
  root?: string;
  content?: string;
}
export interface SkeletonElementProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  /** Как upstream, style относится к content; styles.root — к внешнему div. */
  style?: string;
  active?: boolean;
  classNames?: SkeletonElementSlots;
  styles?: SkeletonElementSlots;
}
/** Самостоятельный placeholder аватара; основной Skeleton использует только size/shape. */
export interface SkeletonAvatarProps extends SkeletonElementProps {
  size?: SkeletonAvatarSize;
  shape?: 'circle' | 'square';
}
export interface SkeletonButtonProps extends SkeletonElementProps {
  size?: SkeletonElementSize;
  shape?: 'circle' | 'square' | 'round' | 'default';
  block?: boolean;
}
export interface SkeletonInputProps extends SkeletonElementProps {
  size?: SkeletonElementSize;
  block?: boolean;
}
export interface SkeletonNodeProps extends SkeletonElementProps {
  children?: Snippet;
  /** @internal Заменяет стандартный content class, как исходный Node. */
  internalClassName?: string;
}
export type SkeletonImageProps = SkeletonElementProps;
/** Геометрия строки title в Skeleton. */
export interface SkeletonTitleProps {
  width?: SkeletonWidth;
}
/** Число строк и ширины текстового placeholder Skeleton. */
export interface SkeletonParagraphProps {
  rows?: number;
  width?: SkeletonWidth | SkeletonWidth[];
}

/** Каркас загрузки, который заменяет children и сохраняет доступный статус. */
export interface SkeletonProps {
  /** @defaultValue true */
  loading?: boolean;
  /** @defaultValue false */
  active?: boolean;
  /** @defaultValue false */
  round?: boolean;
  /** @defaultValue false */
  avatar?: boolean | Pick<SkeletonAvatarProps, 'size' | 'shape'>;
  /** @defaultValue true */
  title?: boolean | SkeletonTitleProps;
  /** @defaultValue true */
  paragraph?: boolean | SkeletonParagraphProps;
  children?: Snippet;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  class?: string;
  style?: string;
}
