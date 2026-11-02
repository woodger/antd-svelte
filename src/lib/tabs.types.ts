import type { Snippet } from 'svelte';
import type { ComponentSize } from './types';

export type TabsType = 'line' | 'card' | 'editable-card';
export type TabsPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TabsContent = string | number | boolean | null | Snippet;
export type TabsExtraContent = TabsContent | { left?: TabsContent; right?: TabsContent; };

export interface TabsItem {
  key: string;
  label: TabsContent;
  children?: Snippet;
  icon?: Snippet;
  disabled?: boolean;
  /** В editable-card запрещает удаление; disabled также скрывает кнопку. */
  closable?: boolean;
  /** Null/false скрывают кнопку при не заданном closable; closable=true сохраняет её. */
  closeIcon?: TabsContent;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
}

/** Исходные доступные имена управляющих кнопок Tabs. */
export interface TabsLocale {
  addAriaLabel?: string;
  removeAriaLabel?: string;
  /** Имя ещё не перенесённого overflow menu; native scroll его не использует. */
  dropdownAriaLabel?: string;
}

/** Набор keyed панелей с bind:activeKey, ручной клавиатурной активацией и overflow. */
export interface TabsProps {
  items: readonly TabsItem[];
  /** Поддерживает bind:activeKey. */
  activeKey?: string | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  onTabClick?: (key: string, event: MouseEvent) => void;
  type?: TabsType;
  /** Запрашивает изменение items у владельца; add получает событие, remove — key. */
  onEdit?: (target: MouseEvent | KeyboardEvent | string, action: 'add' | 'remove') => void;
  /** Скрывает добавление только в editable-card. @defaultValue false */
  hideAdd?: boolean;
  /** Falsy значение использует исходную иконку PlusOutlined. */
  addIcon?: TabsContent;
  /** Nullish значение использует CloseOutlined; falsy fallback при удалении — «×». */
  removeIcon?: TabsContent;
  /** По умолчанию исходные Add tab/remove; не заменяет доступное имя tablist. */
  locale?: TabsLocale;
  /** @defaultValue 'top' */
  tabPlacement?: TabsPlacement;
  size?: ComponentSize;
  /** @defaultValue false */
  destroyOnHidden?: boolean;
  tabBarExtraContent?: TabsExtraContent;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  class?: string;
  style?: string;
}
