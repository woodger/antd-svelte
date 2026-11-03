import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type TagPresetColor =
  'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'volcano'
  | 'geekblue'
  | 'lime'
  | 'gold';
export type TagStatusColor = 'success' | 'processing' | 'error' | 'default' | 'warning';
export type TagColor = TagPresetColor | TagStatusColor | `${TagPresetColor}-inverse` | (string & {});
export type TagVariant = 'filled' | 'outlined' | 'solid';

export interface TagSlots {
  root?: string;
  /** Декоративная wrapper-граница icon Snippet. */
  icon?: string;
  /** Применяется при наличии icon, как исходный content slot. */
  content?: string;
  /** Нативная кнопка закрытия с прежней геометрией и focus behavior. */
  close?: string;
}

/** Callback получает props с разрешёнными color, variant и disabled; CSS задаётся строками. */
export type TagSemantic = TagSlots | ((info: { props: TagProps; }) => TagSlots | undefined);

/**
 * Наследуемый record; явный объект, включая {}, заменяет родительский.
 * CheckableTag использует только class/style. Root style: context styles.root,
 * context style, local styles.root, local style; рассчитанный цвет идёт перед ними.
 */
export interface TagConfig {
  class?: string;
  style?: string;
  variant?: TagVariant;
  classNames?: TagSemantic;
  styles?: TagSemantic;
}

/** Метка с цветом, icon и отменяемым закрытием. */
export interface TagProps {
  children: Snippet;
  /** Preset, status или CSS-цвет; отсутствие сохраняет прежний default class. */
  color?: TagColor;
  /** Локальный variant, color-inverse, bordered=false, context variant, затем filled. */
  variant?: TagVariant;
  /** @deprecated Используйте variant="filled"; false имеет приоритет над context variant. */
  bordered?: boolean;
  rootClassName?: string;
  classNames?: TagSemantic;
  styles?: TagSemantic;
  icon?: Snippet;
  /** @defaultValue false */
  closeIcon?: boolean | Snippet;
  closeLabel?: string;
  disabled?: boolean;
  onClose?: (event: MouseEvent) => void;
  /** Click по метке; закрытие не всплывает сюда. Включает source Wave. */
  onClick?: HTMLAttributes<HTMLSpanElement>['onclick'];
  /** Нативный alias; при совместной передаче имеет приоритет над onClick. */
  onclick?: HTMLAttributes<HTMLSpanElement>['onclick'];
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}

/** Управляемая метка-фильтр: новое checked передаётся через onChange. */
export interface CheckableTagProps extends Omit<
  HTMLAttributes<HTMLButtonElement>,
  'children' | 'class' | 'style'
> {
  children: Snippet;
  /** @defaultValue false */
  checked?: boolean;
  disabled?: boolean;
  icon?: Snippet;
  onChange?: (checked: boolean) => void;
  /** После onChange для click; onclick имеет приоритет. Space не вызывает onClick. */
  onClick?: HTMLAttributes<HTMLButtonElement>['onclick'];
  /** До обработки Space; preventDefault отменяет переключение. onkeydown имеет приоритет. */
  onKeyDown?: HTMLAttributes<HTMLButtonElement>['onkeydown'];
  /** Bindable ссылка на нативную кнопку; очищается при unmount. */
  nativeElement?: HTMLButtonElement;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  style?: string;
}
