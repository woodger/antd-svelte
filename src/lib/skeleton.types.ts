import type { Snippet } from 'svelte';

export type SkeletonWidth = number | string;
export type SkeletonElementSize = 'small' | 'medium' | 'large';
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
/** Самостоятельный placeholder аватара и настройки аватара основного Skeleton. */
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
export interface SkeletonPartProps {
  prefixCls?: string;
  class?: string;
  /** Основной Skeleton заменяет вложенный style соответствующим semantic style. */
  style?: string;
}
/** Геометрия строки title в Skeleton. */
export interface SkeletonTitleProps extends SkeletonPartProps {
  width?: SkeletonWidth;
}
/** Число строк и ширины текстового placeholder Skeleton. */
export interface SkeletonParagraphProps extends SkeletonPartProps {
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
  avatar?: boolean | Omit<SkeletonAvatarProps, 'active'>;
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
  /** Существующий native host; новые semantic root и rootClassName относятся к каркасу. */
  class?: string;
  /** Существующий native host; styles.root относится к декоративному каркасу. */
  style?: string;
  prefixCls?: string;
  rootClassName?: string;
  classNames?: SkeletonSemanticSlots
    | ((info: SkeletonSemanticInfo) => SkeletonSemanticSlots | undefined);
  styles?: SkeletonSemanticSlots
    | ((info: SkeletonSemanticInfo) => SkeletonSemanticSlots | undefined);
  /** Placeholder div после mount; undefined, когда loading=false или компонент удалён. */
  nativeElement?: HTMLDivElement;
  ref?: SkeletonRef;
}

export type SkeletonSemanticSlots = Partial<Record<
  'root' | 'header' | 'section' | 'avatar' | 'title' | 'paragraph', string
>>;
export interface SkeletonSemanticInfo {
  props: SkeletonProps & {
    avatar: NonNullable<SkeletonProps['avatar']>;
    title: NonNullable<SkeletonProps['title']>;
    paragraph: NonNullable<SkeletonProps['paragraph']>;
  };
}
export interface SkeletonRef {
  readonly nativeElement: HTMLDivElement | null;
}
export type SkeletonConfig = Pick<SkeletonProps, 'class' | 'style' | 'classNames' | 'styles'>;
