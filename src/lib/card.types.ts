import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TabsContent, TabsExtraContent, TabsItem, TabsProps } from './tabs.types';

export type CardContent = TabsContent;
/** Настройки Card; явно заданный вложенный record заменяет родительский целиком. */
export interface CardConfig {
  variant?: CardProps['variant'];
  class?: string;
  style?: string;
  classNames?: CardSemantic;
  styles?: CardSemantic;
}
/** Независимые от Card настройки ConfigProvider.cardMeta с тем же record replacement. */
export interface CardMetaConfig {
  class?: string;
  style?: string;
  classNames?: CardMetaSemantic;
  styles?: CardMetaSemantic;
}
export type CardSlots = Partial<
  Record<'root' | 'header' | 'body' | 'extra' | 'title' | 'actions' | 'cover', string>
>;
export type CardMetaSlots = Partial<
  Record<'root' | 'section' | 'avatar' | 'title' | 'description', string>
>;
/** Card callback получает разрешённые size/variant и прежние native defaults остальных Props. */
export type CardSemantic = CardSlots | ((info: { props: CardProps; }) => CardSlots);
/** Meta callback получает текущие Props; root — внешний div CardMeta. */
export type CardMetaSemantic = CardMetaSlots | ((info: { props: CardMetaProps; }) => CardMetaSlots);
export interface CardTabItem extends Omit<TabsItem, 'label'> {
  label?: TabsContent;
}
/** Карточка с title/extra/actions, tabs и сохранением содержимого при loading. */
export interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'title' | 'class' | 'style'
> {
  children?: Snippet;
  /** Непустой локальный prefix имеет приоритет; иначе используется ConfigProvider.prefixCls. */
  prefixCls?: string;
  title?: CardContent;
  extra?: CardContent;
  cover?: CardContent;
  actions?: readonly CardContent[];
  /** @defaultValue false */
  loading?: boolean;
  /** @defaultValue false */
  hoverable?: boolean;
  size?: ComponentSize;
  type?: 'inner';
  /** Локальный вариант перекрывает Form и ConfigProvider. */
  variant?: 'outlined' | 'borderless';
  containGrid?: boolean;
  tabList?: readonly CardTabItem[];
  /** Поддерживает bind:activeTabKey. */
  activeTabKey?: string;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultActiveTabKey?: string;
  tabBarExtraContent?: TabsExtraContent;
  tabProps?: Partial<Omit<TabsProps, 'items'>>;
  onTabChange?: (key: string) => void;
  classNames?: CardSemantic;
  /** Root: context semantic → context style → local semantic → local style. */
  styles?: CardSemantic;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
/** Ячейка сетки Card с настраиваемым hover и нативными HTML-атрибутами. */
export interface CardGridProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  children?: Snippet;
  /** Базовый Card prefix; undefined наследует owner Card, пустая строка — ConfigProvider. */
  prefixCls?: string;
  /** @defaultValue true */
  hoverable?: boolean;
  class?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
/** Блок avatar/title/description внутри Card. */
export interface CardMetaProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'title' | 'class' | 'style'
> {
  avatar?: CardContent;
  /** Базовый Card prefix; undefined наследует owner Card, пустая строка — ConfigProvider. */
  prefixCls?: string;
  title?: CardContent;
  description?: CardContent;
  classNames?: CardMetaSemantic;
  /** Root: context semantic → context style → local semantic → local style. */
  styles?: CardMetaSemantic;
  class?: string;
  style?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
