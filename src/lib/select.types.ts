import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize, RenderEmptyContent, SelectOption } from './types';

/** Разделители multiple/tags либо пользовательский разбор всей строки. */
export type SelectTokenSeparators = readonly string[]
  | ((input: string) => readonly string[]);

/** Metadata плоского пункта; data сохраняет ссылку на исходный option владельца. */
export interface SelectFlattenOption<Value extends string | number = string> {
  key: string | number;
  value: Value;
  label: string;
  data: SelectOption<Value> & Readonly<Record<string, unknown>>;
  groupOption?: boolean;
  group?: boolean;
}

/** Скрытый tag в maxTagPlaceholder; label не усечён, key совпадает с typed value. */
export interface SelectOmittedTag<Value extends string | number = string> extends SelectOption<Value> {
  key: Value;
}

/** Snippet получает скрытые selected values; null/undefined выбирают исходное + N ... . */
export type SelectTagPlaceholder<Value extends string | number = string> = string | number
  | boolean | null | Snippet<[SelectOmittedTag<Value>[]]>;

/** Label — Snippet с итоговым текстом; summary не имеет value/index/onClose. */
export type SelectTagInfo<Value extends string | number = string> = { label: Snippet } & ({
  isMaxTag: false;
  value: Value;
  index: number;
  disabled?: boolean;
  closable: boolean;
  onClose: (event?: Event) => void;
} | {
  isMaxTag: true;
  value?: undefined;
  index?: undefined;
  disabled: false;
  closable: false;
  onClose?: undefined;
});

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
  /** Сортирует отфильтрованные options и synthetic tags; получает текущий searchValue. */
  filterSort?: (
    optionA: SelectOption<Value>,
    optionB: SelectOption<Value>,
    info: { searchValue: string }
  ) => number;
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
  /** Пустой список по умолчанию; tags может создавать значения без options. */
  options?: readonly SelectOption<Value>[];
  /** Пассивное содержимое пункта; выбранный label и native option button сохраняются. */
  optionRender?: Snippet<[
    SelectFlattenOption<Mode extends 'tags' ? Value | string : Value>,
    { index: number }
  ]>;
  mode?: Mode;
  /** Управляемая видимость; onOpenChange сообщает запрос. Поддерживает bind:open. */
  open?: boolean;
  /** Начальная uncontrolled видимость; SSR остаётся закрытым. @defaultValue false */
  defaultOpen?: boolean;
  /** Разбор строк в multiple/tags; function получает текущий ввод, включая восстановленный paste. */
  tokenSeparators?: SelectTokenSeparators;
  /** Максимум выбранных значений в multiple/tags; existing/default values не обрезаются. */
  maxCount?: number;
  /** Ограничивает отображаемый текст multiple/tags; title и полный label сохраняются. */
  maxTagTextLength?: number;
  /** Числовой предел либо responsive измерение видимых tags; hidden values сохраняются. */
  maxTagCount?: number | 'responsive';
  /** Содержимое сводного тега без remove button; omitted labels остаются полными. */
  maxTagPlaceholder?: SelectTagPlaceholder<Mode extends 'tags' ? Value | string : Value>;
  /** Рендер обычных и сводного tags в multiple/tags; single игнорирует Snippet. */
  tagRender?: Snippet<[SelectTagInfo<Mode extends 'tags' ? Value | string : Value>]>;
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
  notFoundContent?: RenderEmptyContent;
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
