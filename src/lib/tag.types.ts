import type { Snippet } from 'svelte';
import type { AriaAttributes, HTMLAttributes } from 'svelte/elements';

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
export type TagCloseIcon = boolean | string | number | null | Snippet;

/** ARIA-настройки close control; disabled/afterClose у Tag не используются, как upstream. */
export interface TagCloseConfig extends AriaAttributes {
  closeIcon?: TagCloseIcon;
  disabled?: boolean;
  afterClose?: () => unknown;
}

export type TagClosable = boolean | TagCloseConfig | null;

export type CheckableTagValue = string | number;

/** Значение сохраняет тип; label может содержать декоративный Snippet. */
export interface CheckableTagOption<Value extends CheckableTagValue = CheckableTagValue> {
  value: Value;
  label: string | number | boolean | Snippet | null | undefined;
  className?: string;
  style?: string;
}

export interface CheckableTagGroupSlots {
  root?: string;
  item?: string;
}

export type CheckableTagGroupSemantic<Value extends CheckableTagValue = CheckableTagValue> =
  CheckableTagGroupSlots
  | ((info: { props: CheckableTagGroupProps<Value>; }) => CheckableTagGroupSlots);

interface CheckableTagGroupBaseProps<Value extends CheckableTagValue> extends AriaAttributes {
  /** Локальный component prefix; не передаётся дочерним CheckableTag, как upstream. */
  prefixCls?: string;
  /** Стабильные уникальные values; строка и число с одинаковым текстом различаются. */
  options?: readonly (Value | CheckableTagOption<Value>)[];
  /** Отсутствие наследует componentDisabled у меток; group class отражает только этот prop. */
  disabled?: boolean;
  id?: string;
  role?: HTMLAttributes<HTMLDivElement>['role'];
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?: CheckableTagGroupSemantic<Value>;
  styles?: CheckableTagGroupSemantic<Value>;
  /** Bindable div; доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  [key: `data-${string}`]: unknown;
}

/** Выбор через CheckableTag: value управляется владельцем, defaultValue — только начальное. */
export type CheckableTagGroupProps<Value extends CheckableTagValue = CheckableTagValue> =
  CheckableTagGroupBaseProps<Value> & ({
    multiple?: false;
    value?: Value | null;
    defaultValue?: Value | null;
    onChange?: (value: Value | null) => void;
  } | {
    multiple: true;
    value?: Value[];
    defaultValue?: Value[];
    onChange?: (value: Value[]) => void;
  });

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
  closable?: TagClosable;
  closeIcon?: TagCloseIcon;
}

/** Метка с цветом, icon и отменяемым закрытием. */
export interface TagProps extends Omit<
  HTMLAttributes<HTMLSpanElement | HTMLAnchorElement>, 'children' | 'class' | 'style' | 'color'
> {
  children: Snippet;
  /** Локальный component prefix; пустая строка использует ant-tag. */
  prefixCls?: string;
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
  /** Отсутствие наследует context; false/null скрывают control, если closable не задан. */
  closeIcon?: TagCloseIcon;
  /** Boolean или исходный close config; локальное false перекрывает context. */
  closable?: TagClosable;
  /** Имеет приоритет над closable['aria-label'] и locale.closeText. */
  closeLabel?: string;
  /** Непустой href выбирает корневой anchor; disabled убирает href и добавляет aria-disabled. */
  href?: string;
  target?: string;
  /** Bindable native span/anchor; меняется вместе с типом корня и очищается при unmount. */
  nativeElement?: HTMLSpanElement | HTMLAnchorElement;
  disabled?: boolean;
  onClose?: (event: MouseEvent) => void;
  /** Click по метке; закрытие не всплывает сюда. Включает source Wave. */
  onClick?: HTMLAttributes<HTMLSpanElement | HTMLAnchorElement>['onclick'];
  /** Нативный alias; при совместной передаче имеет приоритет над onClick. */
  onclick?: HTMLAttributes<HTMLSpanElement | HTMLAnchorElement>['onclick'];
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
  /** Локальный component prefix; пустая строка использует ant-tag. */
  prefixCls?: string;
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
