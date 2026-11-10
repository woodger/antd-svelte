import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TreeEventNode, TreeExpandAction, TreeKey } from './tree.types';
import type { SelectTagInfo } from './select.types';
export type TreeSelectRawValue = string | number;
export type TreeSelectLabel = string | number | boolean | null | undefined | Snippet
  | readonly TreeSelectLabel[];
/** Пустые имена используют стандартные поля; key всегда берётся из value field. */
export interface TreeSelectFieldNames {
  value?: string;
  label?: string;
  children?: string;
}
/** Связи плоского списка: имена id/pId полей и значение родителя корней. */
export interface TreeSelectSimpleModeConfig {
  id?: string | number;
  pId?: string | number;
  /** По умолчанию null: все узлы без найденного родителя становятся корнями. */
  rootPId?: TreeSelectRawValue | null;
}
export type TreeSelectSimpleMode = boolean | TreeSelectSimpleModeConfig;
export interface TreeSelectLabeledValue {
  value: TreeSelectRawValue;
  label?: TreeSelectLabel;
  halfChecked?: boolean;
  disabled?: boolean;
}
export type TreeSelectTagInfo = SelectTagInfo<TreeSelectRawValue>;
/** Snippet получает полные omitted records без synthetic key; null/undefined выбирают + N ... . */
export type TreeSelectTagPlaceholder = string | number | boolean | null
  | readonly TreeSelectLabel[] | Snippet<[TreeSelectLabeledValue[]]>;
export type TreeSelectValue =
  TreeSelectRawValue
  | TreeSelectLabeledValue
  | readonly (TreeSelectRawValue | TreeSelectLabeledValue)[]
  | null
  | undefined;
export interface TreeSelectNode {
  value: TreeSelectRawValue;
  key?: TreeKey;
  title?: TreeSelectLabel;
  label?: TreeSelectLabel;
  children?: readonly TreeSelectNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  [property: string]: unknown;
}
export type TreeSelectStrategy = 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';
/** Поиск и фильтрация дерева TreeSelect, включая controlled searchValue. */
export interface TreeSelectSearchConfig<Data extends object = TreeSelectNode> {
  searchValue?: string;
  onSearch?: (value: string) => void;
  autoClearSearchValue?: boolean;
  filterTreeNode?: boolean | ((search: string, node: Data) => boolean);
  treeNodeFilterProp?: string;
}
export interface TreeSelectChangeInfo {
  triggerValue?: TreeSelectRawValue;
}
/** Настройки ConfigProvider.treeSelect; пока перенесён только variant. */
export interface TreeSelectConfig {
  variant?: TreeSelectProps['variant'];
}
/** Single/multiple выбор узлов дерева с check strategies, поиском и lazy load. */
export interface TreeSelectProps<
  ValueType extends TreeSelectValue = TreeSelectValue,
  Data extends object = TreeSelectNode
> extends Omit<
  HTMLInputAttributes,
  'value' | 'defaultValue' | 'size' | 'type' | 'children' | 'onchange' | 'oninput'
> {
  /** Локальный namespace Select/TreeSelect; пустая строка наследует ConfigProvider. */
  prefixCls?: string;
  treeData?: readonly Data[];
  fieldNames?: TreeSelectFieldNames;
  /** Плоский список; false/undefined сохраняют вложенную структуру. */
  treeDataSimpleMode?: TreeSelectSimpleMode;
  /** Управляемое значение; владелец принимает результат через onChange. */
  value?: ValueType;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: ValueType;
  /** @defaultValue false */
  multiple?: boolean;
  /** @defaultValue false */
  treeCheckable?: boolean;
  /** Независимые checkbox; также включает labelInValue. */
  treeCheckStrictly?: boolean;
  /** @defaultValue false */
  labelInValue?: boolean;
  /** Лимит multiple; SHOW_PARENT и nonstrict SHOW_ALL отключают ненулевой limit. */
  maxCount?: number;
  /** Усечение только string/number labels тегов; callbacks и title сохраняют полное значение. */
  maxTagTextLength?: number;
  /** Видимые теги; остальные значения сохраняются в callbacks и native FormData. */
  maxTagCount?: number | 'responsive';
  maxTagPlaceholder?: TreeSelectTagPlaceholder;
  /** Custom tag получает bound label snippet и Source close/summary metadata. */
  tagRender?: Snippet<[TreeSelectTagInfo]>;
  showCheckedStrategy?: TreeSelectStrategy;
  onChange?: (
    value: ValueType,
    labels: TreeSelectLabel[] | null,
    extra: TreeSelectChangeInfo
  ) => void;
  onSelect?: (value: TreeSelectRawValue, node: Data | undefined) => void;
  onDeselect?: (value: TreeSelectRawValue, node: Data | undefined) => void;
  showSearch?: boolean | TreeSelectSearchConfig<Data>;
  treeNodeLabelProp?: string;
  open?: boolean;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @defaultValue false */
  allowClear?: boolean;
  onClear?: () => void;
  notFoundContent?: TreeSelectLabel | null;
  /** @defaultValue false */
  loading?: boolean;
  treeExpandedKeys?: readonly TreeKey[];
  treeDefaultExpandedKeys?: readonly TreeKey[];
  /** @defaultValue false */
  treeDefaultExpandAll?: boolean;
  /** Раскрытие заголовком; Ctrl/Meta/Shift сохраняют только выбор. @defaultValue false */
  treeExpandAction?: TreeExpandAction;
  onTreeExpand?: (keys: TreeKey[]) => void;
  treeLoadedKeys?: readonly TreeKey[];
  onTreeLoad?: (keys: TreeKey[]) => void;
  /** Асинхронная загрузка children; во время поиска не запускается. */
  loadData?: (node: TreeEventNode<Data>) => PromiseLike<unknown>;
  /** @defaultValue false */
  treeLine?: boolean | { showLeafIcon: boolean; };
  /** @defaultValue false */
  treeIcon?: boolean;
  switcherIcon?: Snippet<[TreeEventNode]>;
  treeTitleRender?: Snippet<[Data]>;
  /** @defaultValue 256 */
  listHeight?: number;
  /** @defaultValue true */
  popupMatchSelectWidth?: boolean | number;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  /** Локальный getter получает корень Select; undefined наследует ConfigProvider. */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
  /** Класс popup; остальные semantic slots пока не перенесены. */
  classNames?: { popup?: { root?: string; }; };
  rootClassName?: string;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  /** @defaultValue 'outlined' */
  /** Приоритет: variant, Form, treeSelect config, global variant, outlined. */
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  /** Нативный ref доступен после mount и очищается при unmount. */
  inputElement?: HTMLInputElement;
}
