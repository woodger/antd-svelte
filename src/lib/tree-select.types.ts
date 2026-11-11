import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize, Variant } from './types';
import type { FormValidateStatus } from './form-error-list.types';
import type { TreeEventNode, TreeExpandAction, TreeKey, TreeRef, TreeTitleContent } from './tree.types';
import type { SelectTagInfo } from './select.types';
/** Методы bind:this. DOM-элементы предоставляются через bindable props. */
export type TreeSelectRef = TreeRef;
export type TreeSelectRawValue = string | number;
export type TreeSelectLabel = string | number | boolean | null | undefined | Snippet
  | readonly TreeSelectLabel[];
export interface TreeSelectSuffixInfo {
  searchValue: string;
  open: boolean;
  focused: boolean;
  showSearch: boolean | undefined;
  loading: boolean | undefined;
}
export type TreeSelectSuffix = Exclude<TreeSelectLabel, Snippet> | Snippet<[TreeSelectSuffixInfo]>;
export interface TreeSelectAllowClear {
  clearIcon?: TreeSelectLabel;
  label?: string;
}
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
export type TreeSelectNodeIcon<Data extends object = TreeSelectNode> = TreeTitleContent<TreeEventNode<Data>>;
interface TreeSelectBasicNode<Data extends object = TreeSelectNode> {
  value: TreeSelectRawValue;
  key?: TreeKey;
  title?: TreeSelectLabel;
  label?: TreeSelectLabel;
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  icon?: TreeSelectNodeIcon<Data>;
  switcherIcon?: TreeSelectNodeIcon<Data>;
  class?: string;
  className?: string;
  style?: string;
  [property: string]: unknown;
}
export interface TreeSelectNode extends TreeSelectBasicNode {
  children?: readonly TreeSelectNode[];
}
/** Декларативный узел TreeSelect.TreeNode; children содержит вложенные объявления. */
export interface TreeSelectTreeNodeProps<Data extends object = TreeSelectNode> extends TreeSelectBasicNode<Data> {
  children?: Snippet;
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
type TreeSelectControlSlots<Value> = Partial<Record<
  'root' | 'prefix' | 'input' | 'suffix' | 'clear' | 'content' | 'placeholder'
  | 'item' | 'itemContent' | 'itemRemove', Value
>>;
type TreeSelectPopupSlots<Value> = Partial<Record<'root' | 'item' | 'itemTitle' | 'itemSwitcher', Value>>;
export type TreeSelectClassNames = TreeSelectControlSlots<string> & {
  /** Строка назначается popup.root. */
  popup?: string | TreeSelectPopupSlots<string>;
};
export type TreeSelectStyles = TreeSelectControlSlots<string> & {
  popup?: TreeSelectPopupSlots<string>;
};
export interface TreeSelectSemanticInfo<
  ValueType extends TreeSelectValue = TreeSelectValue,
  Data extends object = TreeSelectNode
> {
  props: Omit<TreeSelectProps<ValueType, Data>, 'disabled' | 'status' | 'variant' | 'onChange'> & {
    onChange?(value: ValueType, labels: TreeSelectLabel[] | null, extra: TreeSelectChangeInfo): void;
    disabled: boolean;
    status?: FormValidateStatus;
    variant: Variant;
  };
}
export type TreeSelectSemanticValue<
  Slots, ValueType extends TreeSelectValue = TreeSelectValue, Data extends object = TreeSelectNode
> = Slots | ((info: TreeSelectSemanticInfo<ValueType, Data>) => Slots | undefined);
export type TreeSelectSwitcherIcon = TreeTitleContent<TreeEventNode>;
/** Настройки ConfigProvider.treeSelect. Для оформления используются classNames и styles. */
export interface TreeSelectConfig {
  class?: string;
  style?: string;
  variant?: Variant;
  classNames?: TreeSelectClassNames | (<ValueType extends TreeSelectValue, Data extends object>(
    info: TreeSelectSemanticInfo<ValueType, Data>
  ) => TreeSelectClassNames | undefined);
  styles?: TreeSelectStyles | (<ValueType extends TreeSelectValue, Data extends object>(
    info: TreeSelectSemanticInfo<ValueType, Data>
  ) => TreeSelectStyles | undefined);
  switcherIcon?: TreeSelectSwitcherIcon;
}
/** Single/multiple выбор узлов дерева с check strategies, поиском и lazy load. */
export interface TreeSelectProps<
  ValueType extends TreeSelectValue = TreeSelectValue,
  Data extends object = TreeSelectNode
> extends Omit<
  HTMLInputAttributes,
  'value' | 'defaultValue' | 'size' | 'type' | 'prefix' | 'placeholder' | 'children' | 'onchange' | 'oninput'
> {
  /** Локальный namespace Select/TreeSelect; пустая строка наследует ConfigProvider. */
  prefixCls?: string;
  treeData?: readonly Data[];
  /** Используется при отсутствии treeData. */
  children?: Snippet;
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
  placeholder?: TreeSelectLabel;
  prefix?: TreeSelectLabel;
  /** Содержимое или snippet с состоянием поля. null/undefined используют suffixIcon. */
  suffix?: TreeSelectSuffix;
  /** null скрывает стандартную стрелку. */
  suffixIcon?: TreeSelectLabel;
  /** @defaultValue false */
  allowClear?: boolean | TreeSelectAllowClear;
  onClear?: () => void;
  /** Иконка удаления обычного тега. Пользовательский tagRender задаёт своё содержимое. */
  removeIcon?: TreeSelectLabel;
  /** Snippet получает исходное содержимое панели. */
  popupRender?: Snippet<[Snippet]>;
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
  treeLine?: boolean | { showLeafIcon: TreeSelectSwitcherIcon; };
  /** @defaultValue false */
  treeIcon?: TreeSelectNodeIcon;
  switcherIcon?: TreeSelectSwitcherIcon;
  /** Для известного узла label в onChange и omitted records — snippet с этим узлом. */
  treeTitleRender?: Snippet<[Data]>;
  /** @defaultValue 256 */
  listHeight?: number;
  /** Оценка высоты строки. По умолчанию controlHeightSM + paddingXXS. */
  listItemHeight?: number;
  /** Дополнительный отступ при прокрутке до активного узла. @defaultValue 0 */
  listItemScrollOffset?: number;
  /** Undefined наследует ConfigProvider.virtual. @defaultValue true */
  virtual?: boolean;
  /** False оставляет ширину по содержимому и отключает виртуализацию. @defaultValue true */
  popupMatchSelectWidth?: boolean | number;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  /** Локальный getter получает корень Select; undefined наследует ConfigProvider. */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
  classNames?: TreeSelectSemanticValue<TreeSelectClassNames, ValueType, Data>;
  styles?: TreeSelectSemanticValue<TreeSelectStyles, ValueType, Data>;
  rootClassName?: string;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  /** @defaultValue 'outlined' */
  /** Приоритет: variant, Form, treeSelect config, global variant, outlined. */
  variant?: Variant;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  /** Нативный ref доступен после mount и очищается при unmount. */
  inputElement?: HTMLInputElement;
}
