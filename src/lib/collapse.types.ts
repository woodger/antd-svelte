import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { CollapseItemEvents } from './collapse-events.engine';
export type { CollapseItemEvents } from './collapse-events.engine';
import type { ComponentSize } from './types';

export type CollapseTrigger = 'header' | 'icon' | 'disabled';
export type CollapseActiveKey = string | number | readonly (string | number)[];
export type CollapseContent = string | number | boolean | null | Snippet
  | readonly (CollapseContent | undefined)[];
export interface CollapseItemSemanticSlots {
  header?: string;
  title?: string;
  body?: string;
  icon?: string;
}
export interface CollapseSemanticSlots extends CollapseItemSemanticSlots {
  root?: string;
}
export interface CollapseSemanticInfo {
  props: CollapseProps & {
    size: ComponentSize;
    bordered: boolean;
    expandIconPlacement: 'start' | 'end';
  };
}
export type CollapseSemantic = CollapseSemanticSlots
  | ((info: CollapseSemanticInfo) => CollapseSemanticSlots | undefined);

/** Readonly item; ключ по умолчанию — строковый индекс, onChange всегда получает строки. */
export interface CollapseItem extends Omit<
  HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'
>, CollapseItemEvents {
  key?: string | number;
  /** Пассивное содержимое нативной кнопки; controls размещайте в extra или children. */
  label?: CollapseContent;
  children?: CollapseContent;
  extra?: CollapseContent;
  collapsible?: CollapseTrigger;
  showArrow?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  id?: string;
  /** Дополнительный класс внешней обёртки заголовка, как в Rc Collapse. */
  headerClass?: string;
  /** Callback ref получает node после mount, null при замене ref или unmount; SSR не вызывает. */
  ref?: (node: HTMLDivElement | null) => void;
  class?: string;
  style?: string;
  /** Item slots дополняют общие classes и перекрывают общие styles. */
  classNames?: CollapseItemSemanticSlots;
  styles?: CollapseItemSemanticSlots;
  /** Вызывается после обновления binding и общего onChange; disabled его не вызывает. */
  onItemClick?: (key: string) => void;
  [attribute: `aria-${string}`]: unknown;
  [attribute: `data-${string}`]: unknown;
}
/** Данные панели для expandIcon; custom Snippet не получает автоматический rotate. */
export interface CollapseExpandIconInfo extends Omit<CollapseItem, 'key' | 'label' | 'ref'> {
  panelKey: string;
  header?: CollapseContent;
  isActive: boolean;
  accordion?: boolean;
  collapsible?: CollapseTrigger;
  showArrow?: boolean;
  prefixCls: string;
  /** Переключает доступную панель, затем вызывает onChange и item.onItemClick. */
  onItemClick: (key: string) => void;
}
/** Наследуемое оформление и стрелка; явный record заменяет родительский. */
export interface CollapseConfig extends Pick<
  CollapseProps, 'class' | 'style' | 'expandIcon' | 'classNames' | 'styles'
> {}

/** Независимые раскрываемые панели или accordion с управлением activeKey. */
export interface CollapseProps {
  items?: readonly CollapseItem[];
  /** Поддерживает bind:activeKey; числа сравниваются по строковому представлению. */
  activeKey?: CollapseActiveKey | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultActiveKey?: CollapseActiveKey;
  onChange?: (activeKey: string[]) => void;
  /** @defaultValue false */
  accordion?: boolean;
  /** @defaultValue 'header' */
  collapsible?: CollapseTrigger;
  /** @defaultValue 'start' */
  expandIconPlacement?: 'start' | 'end';
  /** Локальный Snippet приоритетнее ConfigProvider.collapse.expandIcon. */
  expandIcon?: Snippet<[CollapseExpandIconInfo]>;
  size?: ComponentSize;
  /** @defaultValue true */
  bordered?: boolean;
  /** @defaultValue false */
  ghost?: boolean;
  /** Удаляет скрытое содержимое; forceRender item сохраняет его. */
  destroyOnHidden?: boolean;
  /** @defaultValue 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  class?: string;
  style?: string;
  /** Локальный CSS prefix; отсутствие и пустая строка наследуют ConfigProvider. */
  prefixCls?: string;
  rootClassName?: string;
  /** Header slot относится к нативной кнопке, body — к внутреннему содержимому. */
  classNames?: CollapseSemantic;
  styles?: CollapseSemantic;
  /** Bind:nativeElement и bind:ref получают HTMLDivElement после mount, undefined при unmount. */
  nativeElement?: HTMLDivElement;
  ref?: HTMLDivElement;
  [attribute: `aria-${string}`]: unknown;
  [attribute: `data-${string}`]: unknown;
}
