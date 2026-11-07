import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export type CascaderRawValue = string | number;
export type CascaderPath = readonly CascaderRawValue[];
export type CascaderValue<Multiple extends boolean = false> = Multiple extends true
  ? readonly CascaderPath[]
  : CascaderPath;
export type CascaderContent = string | number | boolean | null | Snippet;
export type CascaderStrategy = 'SHOW_PARENT' | 'SHOW_CHILD';

export interface CascaderOption {
  label?: CascaderContent;
  value?: CascaderRawValue;
  children?: readonly CascaderOption[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  /** false сохраняет раскрытие и loadData до появления children. */
  isLeaf?: boolean;
  title?: string;
  [property: string]: unknown;
}

export interface CascaderFieldNames {
  label?: string;
  value?: string;
  children?: string;
}

export interface CascaderRenderInfo<OptionType extends CascaderOption = CascaderOption> {
  path: readonly OptionType[];
  searchValue: string;
  /** Исходное содержимое строки, включая подсветку результатов поиска. */
  originNode: Snippet;
}

/** Поиск полных путей; поля объекта перекрывают одноимённые top-level props. */
export interface CascaderSearchConfig<OptionType extends CascaderOption = CascaderOption> {
  filter?: (search: string, path: OptionType[], fields: CascaderFieldNames) => boolean;
  render?: Snippet<[string, OptionType[], string, Required<CascaderFieldNames>]>;
  sort?: (
    first: OptionType[],
    second: OptionType[],
    search: string,
    fields: Required<CascaderFieldNames>
  ) => number;
  /** @defaultValue true */
  matchInputWidth?: boolean;
  /** false и неположительное число снимают ограничение. @defaultValue 50 */
  limit?: number | false;
  searchValue?: string;
  onSearch?: (search: string) => void;
  /** @defaultValue true */
  autoClearSearchValue?: boolean;
  searchIcon?: CascaderContent;
}

export type CascaderSlots<Value> = Partial<Record<
  'root' | 'prefix' | 'suffix' | 'input' | 'placeholder' | 'content'
  | 'item' | 'itemContent' | 'itemRemove',
  Value
>> & {
  popup?: Value | Partial<Record<'root' | 'list' | 'listItem', Value>>;
};

export interface CascaderSemantic {
  props: {
    multiple?: boolean;
    options?: readonly CascaderOption[];
    value?: CascaderValue<boolean>;
    open?: boolean;
    disabled: boolean;
    size: ComponentSize;
    variant: 'outlined' | 'borderless' | 'filled' | 'underlined';
    status?: 'error' | 'warning';
    /** Остальные исходные props передаются как есть; перед использованием уточните их тип. */
    [property: string]: unknown;
  };
}

export type CascaderSemanticValue<Value> = CascaderSlots<Value>
  | ((info: CascaderSemantic) => CascaderSlots<Value> | undefined);

/** Наследуемое оформление Cascader; Panel наследует только expandIcon/loadingIcon. */
export interface CascaderConfig {
  class?: string;
  style?: string;
  variant?: CascaderSemantic['props']['variant'];
  classNames?: CascaderSemanticValue<string>;
  styles?: CascaderSemanticValue<string>;
  expandIcon?: CascaderContent;
  loadingIcon?: CascaderContent;
  clearIcon?: CascaderContent;
  removeIcon?: CascaderContent;
  suffixIcon?: CascaderContent;
  searchIcon?: CascaderContent;
}

export interface CascaderTagInfo {
  label: Snippet;
  /** Ключ пути rc-cascader, соединённый через __RC_CASCADER_SPLIT__. */
  value?: string;
  disabled: boolean;
  closable: boolean;
  index?: number;
  onClose?: (event?: Event) => void;
  /** true для сводного тега maxTagCount; у него нет value/index/onClose. */
  isMaxTag: boolean;
}

export interface CascaderOmittedTag<OptionType extends CascaderOption = CascaderOption> {
  /** Default label; для собственного displayRender доступны labels/options. */
  label: CascaderContent | undefined;
  labels: CascaderContent[];
  options: (OptionType | undefined)[];
  value: string;
  disabled: boolean;
}

export interface CascaderTriggerInfo {
  open: boolean;
  disabled: boolean;
  /** Svelte-замена клонирования React children: привяжите к native control. */
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onKeyUp: (event: KeyboardEvent) => void;
  'aria-expanded': boolean;
  'aria-controls': string;
}

/** Общий контракт выбора путей для popup и отдельной Panel. */
export interface CascaderPanelProps<
  OptionType extends CascaderOption = CascaderOption,
  Multiple extends boolean = false
> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onchange' | 'onfocus' | 'onblur' | 'onkeydown' | 'onkeyup'
    | 'prefix' | 'placeholder'
> {
  options?: readonly OptionType[];
  /** Управляемые пути; undefined после controlled value освобождает локальное состояние. */
  value?: CascaderValue<Multiple>;
  /** Читается один раз при создании экземпляра. */
  defaultValue?: CascaderValue<Multiple>;
  /** @defaultValue false */
  multiple?: Multiple;
  /** single: undefined при очистке; multiple: пустой массив. Missing options сохраняются. */
  onChange?: (
    value: CascaderValue<Multiple> | (Multiple extends true ? never : undefined),
    options: Multiple extends true
      ? (OptionType | undefined)[][]
      : (OptionType | undefined)[] | undefined
  ) => void;
  fieldNames?: CascaderFieldNames;
  /** Позволяет single выбирать промежуточные узлы. @defaultValue false */
  changeOnSelect?: boolean;
  /** @defaultValue 'SHOW_PARENT' */
  showCheckedStrategy?: CascaderStrategy;
  /** @defaultValue 'click' */
  expandTrigger?: 'click' | 'hover';
  /** Promise не ожидается: обновите options.children либо isLeaf для снятия индикатора. */
  loadData?: (selectedOptions: OptionType[]) => void;
  expandIcon?: CascaderContent;
  loadingIcon?: CascaderContent;
  /** Snippet получает исходный option; originNode сохраняет поисковую подсветку. */
  optionRender?: Snippet<[OptionType, CascaderRenderInfo<OptionType>]>;
  notFoundContent?: CascaderContent;
  disabled?: boolean;
  direction?: 'ltr' | 'rtl';
  rootClassName?: string;
  /** Ref появляется после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}

/** Каскадный single/multiple выбор; value и open используют controlled/default контракт. */
export interface CascaderProps<
  OptionType extends CascaderOption = CascaderOption,
  Multiple extends boolean = false
> extends Omit<
  CascaderPanelProps<OptionType, Multiple>,
  'onkeydown' | 'onkeyup' | 'onfocus' | 'onblur'
> {
  /** @defaultValue false */
  showSearch?: boolean | CascaderSearchConfig<OptionType>;
  /** @deprecated Используйте showSearch.searchValue. */
  searchValue?: string;
  /** @deprecated Используйте showSearch.onSearch. */
  onSearch?: (search: string) => void;
  /** @deprecated Используйте showSearch.autoClearSearchValue. */
  autoClearSearchValue?: boolean;
  displayRender?: Snippet<[CascaderContent[], (OptionType | undefined)[]]>;
  open?: boolean;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @deprecated Используйте onOpenChange. */
  onPopupVisibleChange?: (open: boolean) => void;
  /** @deprecated Используйте onOpenChange. */
  onDropdownVisibleChange?: (open: boolean) => void;
  /** Объект не наследует clearIcon; пустой/falsy icon даёт rc-select fallback ×. @defaultValue true */
  allowClear?: boolean | { clearIcon?: CascaderContent; };
  onClear?: () => void;
  placeholder?: CascaderContent;
  prefix?: CascaderContent;
  suffixIcon?: CascaderContent;
  /** @deprecated Используйте allowClear.clearIcon. */
  clearIcon?: CascaderContent;
  /** @deprecated Используйте suffixIcon={null}. */
  showArrow?: boolean;
  removeIcon?: CascaderContent;
  loading?: boolean;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  variant?: CascaderSemantic['props']['variant'];
  classNames?: CascaderSemanticValue<string>;
  styles?: CascaderSemanticValue<string>;
  /** @defaultValue false */
  popupMatchSelectWidth?: boolean | number;
  /**
   * Локальный getter перекрывает ConfigProvider; custom children передаёт свой DOM trigger.
   * CascaderPanel не использует контейнер popup.
   */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  popupClassName?: string;
  /** @deprecated Используйте popupClassName. */
  dropdownClassName?: string;
  popupMenuColumnStyle?: string;
  /** @deprecated Используйте popupMenuColumnStyle. */
  dropdownMenuColumnStyle?: string;
  /** @deprecated Используйте styles.popup.root. */
  dropdownStyle?: string;
  popupRender?: Snippet<[Snippet]>;
  /** @deprecated Используйте popupRender. */
  dropdownRender?: Snippet<[Snippet]>;
  tagRender?: Snippet<[CascaderTagInfo]>;
  maxTagCount?: number | 'responsive';
  maxTagTextLength?: number;
  maxTagPlaceholder?: CascaderContent | Snippet<[CascaderOmittedTag<OptionType>[]]>;
  /** Svelte-замена React children; native trigger получает handlers и ARIA через snippet. */
  children?: Snippet<[CascaderTriggerInfo]>;
  autoFocus?: boolean;
  showAction?: ('focus' | 'click')[];
  onInputKeyDown?: (event: KeyboardEvent) => void;
  tabIndex?: number;
  onkeydown?: (event: KeyboardEvent) => void;
  onkeyup?: (event: KeyboardEvent) => void;
  onfocus?: HTMLInputAttributes['onfocus'];
  onblur?: HTMLInputAttributes['onblur'];
  onPopupScroll?: HTMLAttributes<HTMLUListElement>['onscroll'];
  /** Ref input недоступен при custom children. */
  inputElement?: HTMLInputElement;
}
