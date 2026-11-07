import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';

export type SwitchSize = 'small' | 'medium';
export type SwitchContent = string | number | null | undefined | Snippet;
export type SwitchEvent = (MouseEvent | KeyboardEvent) & {
  currentTarget: EventTarget & HTMLButtonElement;
};
export type SwitchChangeEventHandler = (checked: boolean, event: SwitchEvent) => void;
export type SwitchClickEventHandler = SwitchChangeEventHandler;

export interface SwitchSemanticSlots {
  root?: string;
  content?: string;
  indicator?: string;
}

export type SwitchSemantic = SwitchSemanticSlots | ((info: {
  props: Omit<SwitchProps, 'size'> & { size?: SwitchSize | 'large'; };
}) => SwitchSemanticSlots);

/** Нативная кнопка Switch с Svelte bindings, source callbacks и прежними form/reset контрактами. */
export interface SwitchProps extends Omit<
  HTMLButtonAttributes,
  'type' | 'value' | 'children' | 'class' | 'onchange'
> {
  /** Bindable; определённый checked имеет приоритет над value. */
  checked?: boolean | undefined;
  /** Bindable alias checked; при совместной передаче используется checked. */
  value?: boolean | undefined;
  /** Фиксируется при создании; имеет приоритет над defaultValue. По умолчанию false. */
  defaultChecked?: boolean;
  defaultValue?: boolean;
  /** Блокирует кнопку и native FormData даже с disabled=false. */
  loading?: boolean;
  /** Medium — обычный размер; без prop наследуется componentSize. */
  size?: SwitchSize;
  checkedChildren?: SwitchContent;
  unCheckedChildren?: SwitchContent;
  onCheckedChange?: (checked: boolean) => void;
  /** Click и ArrowLeft/Right; повторная стрелка также вызывает callback, как rc-switch. */
  onChange?: SwitchChangeEventHandler;
  /** Получает следующее значение после onChange; стрелки его не вызывают. */
  onClick?: SwitchClickEventHandler;
  onKeyDown?: HTMLButtonAttributes['onkeydown'];
  onFocus?: HTMLButtonAttributes['onfocus'];
  onBlur?: HTMLButtonAttributes['onblur'];
  /** Один раз вызывает native focus при mount; lowercase autofocus сохраняется. */
  autoFocus?: boolean;
  tabIndex?: number;
  /** Меняет классы; CSS произвольного префикса предоставляет потребитель. */
  prefixCls?: string;
  rootClassName?: string;
  classNames?: SwitchSemantic;
  styles?: SwitchSemantic;
  /** Bindable native button; focus/blur доступны также через bind:this. */
  nativeElement?: HTMLButtonElement;
  ref?: HTMLButtonElement;
  class?: string;
}

/**
 * Наследуемое оформление Switch. Root style: config.styles.root, config.style,
 * local styles.root, local style; content применяется к обеим подписям состояния.
 */
export interface SwitchConfig {
  class?: string;
  style?: string;
  classNames?: SwitchSemantic;
  styles?: SwitchSemantic;
}
