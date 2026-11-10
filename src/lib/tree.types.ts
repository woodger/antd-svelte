import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { VirtualScrollAlign } from './virtual-list.engine';
import type { VirtualScrollOffset, VirtualScrollOffsetInfo } from './virtual-list.types';
export type TreeKey = string | number | bigint;
export type TreeExpandAction = false | 'click' | 'doubleClick';
export type TreeScrollAlign = VirtualScrollAlign;
export type TreeScrollOffsetInfo = VirtualScrollOffsetInfo<TreeKey>;
/** Функция получает измеренные/оценённые размеры; NaN/Infinity заменяются нулём. */
export type TreeScrollOffset = VirtualScrollOffset<TreeKey>;
/** Позиция либо key/index с выравниванием; autoExpand добавляет только целевой key. */
export type TreeScrollConfig = number | { top?: number; left?: number; autoExpand?: never; }
  | ({ align?: TreeScrollAlign; offset?: TreeScrollOffset; } & (
    { key: TreeKey; autoExpand?: boolean; } | { index: number; autoExpand?: never; }
  ));
/** Методы bind:this; nativeElement предоставляется отдельной bindable prop. */
export interface TreeRef {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  /** Null/undefined показывают scrollbar; отсутствующий key не меняет позицию. */
  scrollTo: (config?: TreeScrollConfig | null) => void;
}
/** Имена полей data; пустая строка использует стандартные key/title/children. */
export interface TreeFieldNames {
  key?: string;
  title?: string;
  children?: string;
}

/** Настройки data-модели createTree; смена fieldNames задаётся новым объектом. */
export interface TreeModelConfig {
  fieldNames?: TreeFieldNames;
}

/** Entity data-модели: исходный node и путь nodes от корня до него включительно. */
export interface TreeDataEntity<Data extends object = TreeDataNode> {
  node: Data;
  nodes: Data[];
  index: number;
  key: TreeKey;
  pos: string;
  level: number;
  parent: TreeDataEntity<Data> | undefined;
  children?: TreeDataEntity<Data>[];
}

/** Data utilities Tree; методы DOM-компонента описаны отдельно в TreeRef. */
export interface TreeInstance<Data extends object = TreeDataNode> {
  /** Стабильная функция читает текущие data/config; неизвестный ключ возвращает пустой путь. */
  getPath: (key: TreeKey) => TreeDataEntity<Data>[];
}

/** Общие атрибуты узла; Data сохраняет тип пользовательского payload в snippets. */
export interface TreeBasicDataNode<Data extends object = TreeDataNode> {
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  icon?: Snippet<[TreeEventNode<Data>]>;
  /** Собственный switcher перекрывает общий renderer и loading; isLeaf вычислен для узла. */
  switcherIcon?: Snippet<[TreeEventNode<Data>]>;
  class?: string;
  style?: string;
}

/** Текст, вложенное содержимое или Svelte snippet с исходным узлом. */
export type TreeTitleContent<Data extends object = TreeDataNode> =
  string | number | boolean | null | undefined | Snippet<[Data]>
  | readonly TreeTitleContent<Data>[];

export interface TreeDataNode extends TreeBasicDataNode<TreeDataNode> {
  key: TreeKey;
  title?: TreeTitleContent<TreeDataNode>;
  children?: readonly TreeDataNode[];
}

/** Recursive data с произвольным payload и именем дочернего поля. */
export type TreeFieldDataNode<Payload extends object, ChildFieldName extends string = 'children'> =
  Payload & TreeBasicDataNode<TreeFieldDataNode<Payload, ChildFieldName>>
  & Partial<Record<ChildFieldName, readonly TreeFieldDataNode<Payload, ChildFieldName>[]>>;

interface TreeNodeState {
  key: TreeKey;
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  halfChecked: boolean;
  loaded: boolean;
  loading: boolean;
  pos: string;
  active: boolean;
  dragOver: false;
  dragOverGapTop: false;
  dragOverGapBottom: false;
}

/** State и canonical key перекрывают одноимённые поля payload; остальные данные сохранены. */
export type TreeEventNode<Data extends object = TreeDataNode> = {
  [Key in keyof Data as Key extends keyof TreeNodeState ? never : Key]: Data[Key];
} & TreeNodeState & Omit<TreeBasicDataNode<Data>, 'icon' | 'switcherIcon'>;
export interface TreeCheckedKeys {
  checked: readonly TreeKey[];
  halfChecked: readonly TreeKey[];
}
export interface TreeCheckInfo<Data extends object = TreeDataNode> {
  event: 'check';
  node: TreeEventNode<Data>;
  checked: boolean;
  nativeEvent?: MouseEvent | KeyboardEvent;
  checkedNodes: Data[];
  checkedNodesPositions?: { node: Data; pos: string; }[];
  halfCheckedKeys?: TreeKey[];
}

export type TreeSemanticName = 'root' | 'item' | 'itemIcon' | 'itemTitle' | 'itemSwitcher';
export type TreeClassNames = Partial<Record<TreeSemanticName, string>>;
export type TreeStyles = Partial<Record<TreeSemanticName, string>>;
export type TreeSemanticValue<Value, Data extends object = TreeDataNode> = Value
  | ((info: { props: TreeProps<Data>; }) => Value | undefined);

/** Общий provider не ограничивает data конкретной схемой одного дерева. */
export interface TreeConfig {
  class?: string;
  style?: string;
  classNames?: TreeClassNames
    | (<Data extends object>(info: { props: TreeProps<Data>; }) => TreeClassNames | undefined);
  styles?: TreeStyles
    | (<Data extends object>(info: { props: TreeProps<Data>; }) => TreeStyles | undefined);
}

/** Дерево со стабильными keys, раскрытием, выбором, отметками и lazy children. */
export interface TreeProps<Data extends object = TreeDataNode> extends Omit<
  HTMLAttributes<HTMLDivElement>, 'children' | 'onselect'
> {
  /** Локальный namespace дерева и nodes; пустая строка наследует ConfigProvider. */
  prefixCls?: string;
  /** @internal Тема составного владельца вместо Tree defaults, до пользовательского style. */
  _themeStyle?: string;
  /** @internal Составной владелец TreeSelect использует собственный component config. */
  _componentConfig?: boolean;
  /** CSS внешнего корня; прежний native contract сохранён, React style относится к inner list. */
  style?: HTMLAttributes<HTMLDivElement>['style'];
  classNames?: TreeSemanticValue<TreeClassNames, Data>;
  styles?: TreeSemanticValue<TreeStyles, Data>;
  /** Canonical поля допустимы также при стирании generic в Svelte render/component tooling. */
  treeData?: readonly (Data & TreeBasicDataNode<Data> & {
    key?: unknown;
    title?: unknown;
    children?: unknown;
  })[];
  /** Имена key/title/children; смена схемы сохраняет raw data в callbacks. */
  fieldNames?: TreeFieldNames;
  /** Управляемые ключи раскрытия; изменения запрашиваются через onExpand. */
  expandedKeys?: readonly TreeKey[];
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultExpandedKeys?: readonly TreeKey[];
  /** @defaultValue false */
  defaultExpandAll?: boolean;
  /** @defaultValue true */
  defaultExpandParent?: boolean;
  /** @defaultValue false */
  autoExpandParent?: boolean;
  /** Раскрытие через заголовок; Ctrl/Meta/Shift сохраняют только действие выбора. @defaultValue false */
  expandAction?: TreeExpandAction;
  /** Управляемые ключи выбора; стабильные keys обязательны. */
  selectedKeys?: readonly TreeKey[];
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultSelectedKeys?: readonly TreeKey[];
  /** @defaultValue true */
  selectable?: boolean;
  /** @defaultValue false */
  multiple?: boolean;
  /** @defaultValue false */
  checkable?: boolean;
  /** @defaultValue false */
  checkStrictly?: boolean;
  checkedKeys?: readonly TreeKey[] | TreeCheckedKeys;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultCheckedKeys?: readonly TreeKey[];
  disabled?: boolean;
  loadedKeys?: readonly TreeKey[];
  /** Promise загрузки детей; обновление treeData остаётся у потребителя. */
  loadData?: (node: TreeEventNode<Data>) => PromiseLike<unknown>;
  onExpand?: (
    keys: TreeKey[],
    info: { expanded: boolean; node: TreeEventNode<Data>; nativeEvent?: MouseEvent | KeyboardEvent; }
  ) => void;
  onSelect?: (
    keys: TreeKey[],
    info: {
      event: 'select';
      selected: boolean;
      node: TreeEventNode<Data>;
      selectedNodes: Data[];
      nativeEvent?: MouseEvent | KeyboardEvent;
    }
  ) => void;
  onCheck?: (keys: TreeKey[] | TreeCheckedKeys, info: TreeCheckInfo<Data>) => void;
  onLoad?: (keys: TreeKey[], info: { event: 'load'; node: TreeEventNode<Data>; }) => void;
  onClick?: (event: MouseEvent, node: TreeEventNode<Data>) => void;
  onDoubleClick?: (event: MouseEvent, node: TreeEventNode<Data>) => void;
  onRightClick?: (info: { event: MouseEvent; node: TreeEventNode<Data>; }) => void;
  /** Наведение на содержимое строки; disabled не блокирует уведомление. */
  onMouseEnter?: (info: { event: MouseEvent; node: TreeEventNode<Data>; }) => void;
  /** Уход с содержимого строки; node отражает актуальное состояние. */
  onMouseLeave?: (info: { event: MouseEvent; node: TreeEventNode<Data>; }) => void;
  onActiveChange?: (key: TreeKey | null) => void;
  activeKey?: TreeKey | null;
  /** @defaultValue false */
  showIcon?: boolean;
  /** @defaultValue false */
  showLine?: boolean | { showLeafIcon: boolean | Snippet<[TreeEventNode<Data>]>; };
  /** @defaultValue false */
  blockNode?: boolean;
  icon?: Snippet<[TreeEventNode<Data>]>;
  /** Renderer ветки; loading имеет приоритет. Аргумент содержит вычисленный isLeaf. */
  switcherIcon?: Snippet<[TreeEventNode<Data>]>;
  switcherLoadingIcon?: Snippet<[TreeEventNode<Data>]>;
  titleRender?: Snippet<[Data]>;
  filterTreeNode?: (node: TreeEventNode<Data>) => boolean;
  /** @defaultValue true */
  focusable?: boolean;
  /** Ограничение viewport; undefined/0 рендерят все раскрытые строки без ограничения высоты. */
  height?: number;
  /** Новое значение переопределяет оценку Tree tokens; фактические строки измеряются отдельно. */
  itemHeight?: number;
  /** Undefined наследует ConfigProvider.virtual; по умолчанию виртуализация включена. */
  virtual?: boolean;
  /** Ширина содержимого для горизонтальной прокрутки. */
  scrollWidth?: number;
  /** Отступ автоматической прокрутки активного узла. @defaultValue 0 */
  itemScrollOffset?: number;
  onScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  rootClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}

/**
 * Дерево папок: повторный клик сохраняет выбор, Ctrl/Meta переключает ключи,
 * Shift выбирает видимый диапазон. OnSelect всегда сообщает selected=true;
 * снятие controlled-режима сохраняет последние принятые ключи.
 */
export interface DirectoryTreeProps<Data extends object = TreeDataNode> extends TreeProps<Data> {
  /** Раскрытие заголовком. @defaultValue 'click' */
  expandAction?: TreeExpandAction;
  /** @defaultValue true */
  showIcon?: boolean;
  /** @defaultValue true */
  blockNode?: boolean;
}
