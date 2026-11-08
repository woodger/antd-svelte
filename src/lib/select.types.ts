import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize, SelectOption } from './types';

/** Разделители multiple/tags либо пользовательский разбор всей строки. */
export type SelectTokenSeparators = readonly string[]
  | ((input: string) => readonly string[]);

/** Настройки ConfigProvider.select; пока перенесён только variant. */
export interface SelectConfig {
  variant?: SelectProps['variant'];
}

/** Настройки controlled search и локальной фильтрации Select без сетевого транспорта. */
export interface SelectSearchConfig<Value extends string | number = string> {
  /** Управляемая строка поиска; undefined оставляет локальное состояние. */
  searchValue?: string;
  /**
   * Уведомляет о пользовательском поиске; запросы и защиту от старых ответов делает потребитель.
   */
  onSearch?: (value: string) => void;
  /** false отключает локальную фильтрацию; predicate получает исходный option. */
  filterOption?: boolean | ((search: string, option: SelectOption<Value>) => boolean);
  /** Явные поля Source search; несколько полей объединяются через OR. */
  optionFilterProp?: string | readonly string[];
  /** Очищает локальный search при выборе multiple/tags; controlled query меняет владелец. */
  autoClearSearchValue?: boolean;
}

/** Single/multiple/tags с нативным FormData; свободные tags добавляют строковые значения. */
export interface SelectProps<
  Value extends string | number = string,
  Mode extends 'multiple' | 'tags' | undefined = undefined
> extends Omit<
  HTMLInputAttributes,
  'value' | 'size' | 'class' | 'onchange' | 'oninput' | 'type' | 'children'
> {
  /** @internal Intrinsic ширина readonly single для составного владельца, без смены public default. */
  _autoWidth?: boolean;
  options: readonly SelectOption<Value>[];
  mode?: Mode;
  /** Разбор строк в multiple/tags; function получает текущий ввод, включая восстановленный paste. */
  tokenSeparators?: SelectTokenSeparators;
  /** Bind:value; multiple сохраняет Value[], tags допускает также новые string values. */
  value?: (Mode extends 'tags' ? (Value | string)[] : Mode extends 'multiple' ? Value[] : Value)
    | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: Mode extends 'tags' ? readonly (Value | string)[]
    : Mode extends 'multiple' ? readonly Value[] : Value;
  size?: ComponentSize;
  /** Приоритет: variant, Form, Select config, global variant, outlined. */
  variant?: 'outlined' | 'filled' | 'borderless' | 'underlined';
  /** Объект задаёт настройки поиска; boolean включает или отключает его. */
  showSearch?: boolean | SelectSearchConfig<Mode extends 'tags' ? Value | string : Value>;
  /** @defaultValue false */
  loading?: boolean;
  notFoundContent?: string | number | Snippet | null;
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  /**
   * Getter получает корень Select; undefined наследует ConfigProvider, без getter список inline.
   */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
  /** @defaultValue false */
  allowClear?: boolean;
  status?: 'error' | 'warning';
  onValueChange?: (value: Mode extends 'tags' ? (Value | string)[]
    : Mode extends 'multiple' ? Value[] : Value | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  class?: string;
}
