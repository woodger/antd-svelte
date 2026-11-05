import type { Snippet } from 'svelte';

export type EmptyContent = string | number | boolean | null | Snippet;
/** default/simple — прежние aliases встроенных изображений; прочие строки — URL. */
export type EmptyImage = EmptyContent;
export type EmptyDescription = EmptyContent;
export interface EmptySemanticSlots {
  root?: string;
  image?: string;
  description?: string;
  footer?: string;
}
export interface EmptySemanticInfo {
  props: EmptyProps;
}
export type EmptySemantic = EmptySemanticSlots
  | ((info: EmptySemanticInfo) => EmptySemanticSlots | undefined);
export interface EmptyRef {
  readonly nativeElement: HTMLDivElement;
}
export type EmptyConfig = Pick<EmptyProps, 'image' | 'class' | 'style' | 'classNames' | 'styles'>;

/** Пустое состояние с иллюстрацией, описанием и дополнительным действием. */
export interface EmptyProps {
  /** @defaultValue 'default' */
  image?: EmptyImage;
  description?: EmptyDescription;
  children?: EmptyContent;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
  prefixCls?: string;
  rootClassName?: string;
  /** @deprecated Используйте styles.image. */
  imageStyle?: string;
  classNames?: EmptySemantic;
  styles?: EmptySemantic;
  /** Присваивается после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  ref?: EmptyRef;
}
