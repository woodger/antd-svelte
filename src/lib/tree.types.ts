import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type TreeKey = string | number | bigint;
export type TreeExpandAction = false | 'click' | 'doubleClick';
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

/** Data utilities Tree; DOM ref компонента по-прежнему предоставляет focus/blur. */
export interface TreeInstance<Data extends object = TreeDataNode> {
  /** Стабильная функция читает текущие data/config; неизвестный ключ возвращает пустой путь. */
  getPath: (key: TreeKey) => TreeDataEntity<Data>[];
}

export interface TreeDataNode {
  key: TreeKey;
  title?: string | number | Snippet<[TreeDataNode]>;
  children?: readonly TreeDataNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  icon?: Snippet<[TreeEventNode]>;
  /** Собственный switcher перекрывает общий renderer и loading; isLeaf вычислен для узла. */
  switcherIcon?: Snippet<[TreeEventNode]>;
  class?: string;
  style?: string;
}
export interface TreeEventNode extends TreeDataNode {
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
export interface TreeCheckedKeys {
  checked: readonly TreeKey[];
  halfChecked: readonly TreeKey[];
}
export interface TreeCheckInfo {
  event: 'check';
  node: TreeEventNode;
  checked: boolean;
  nativeEvent?: MouseEvent | KeyboardEvent;
  checkedNodes: TreeDataNode[];
  checkedNodesPositions?: { node: TreeDataNode; pos: string; }[];
  halfCheckedKeys?: TreeKey[];
}
/** Дерево со стабильными keys, раскрытием, выбором, отметками и lazy children. */
export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onselect'> {
  /** Локальный namespace дерева и nodes; пустая строка наследует ConfigProvider. */
  prefixCls?: string;
  /** @internal Тема составного владельца вместо Tree defaults, до пользовательского style. */
  _themeStyle?: string;
  /** CSS внешнего корня; прежний native contract сохранён, React style относится к inner list. */
  style?: HTMLAttributes<HTMLDivElement>['style'];
  treeData?: readonly TreeDataNode[];
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
  loadData?: (node: TreeEventNode) => PromiseLike<unknown>;
  onExpand?: (
    keys: TreeKey[],
    info: { expanded: boolean; node: TreeEventNode; nativeEvent?: MouseEvent | KeyboardEvent; }
  ) => void;
  onSelect?: (
    keys: TreeKey[],
    info: {
      event: 'select';
      selected: boolean;
      node: TreeEventNode;
      selectedNodes: TreeDataNode[];
      nativeEvent?: MouseEvent | KeyboardEvent;
    }
  ) => void;
  onCheck?: (keys: TreeKey[] | TreeCheckedKeys, info: TreeCheckInfo) => void;
  onLoad?: (keys: TreeKey[], info: { event: 'load'; node: TreeEventNode; }) => void;
  onClick?: (event: MouseEvent, node: TreeEventNode) => void;
  onDoubleClick?: (event: MouseEvent, node: TreeEventNode) => void;
  onRightClick?: (info: { event: MouseEvent; node: TreeEventNode; }) => void;
  /** Наведение на содержимое строки; disabled не блокирует уведомление. */
  onMouseEnter?: (info: { event: MouseEvent; node: TreeEventNode; }) => void;
  /** Уход с содержимого строки; node отражает актуальное состояние. */
  onMouseLeave?: (info: { event: MouseEvent; node: TreeEventNode; }) => void;
  onActiveChange?: (key: TreeKey | null) => void;
  activeKey?: TreeKey | null;
  /** @defaultValue false */
  showIcon?: boolean;
  /** @defaultValue false */
  showLine?: boolean | { showLeafIcon: boolean | Snippet<[TreeEventNode]>; };
  /** @defaultValue false */
  blockNode?: boolean;
  icon?: Snippet<[TreeEventNode]>;
  /** Renderer ветки; loading имеет приоритет. Аргумент содержит вычисленный isLeaf. */
  switcherIcon?: Snippet<[TreeEventNode]>;
  switcherLoadingIcon?: Snippet<[TreeEventNode]>;
  titleRender?: Snippet<[TreeDataNode]>;
  filterTreeNode?: (node: TreeEventNode) => boolean;
  /** @defaultValue true */
  focusable?: boolean;
  height?: number;
  rootClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}

/**
 * Дерево папок: повторный клик сохраняет выбор, Ctrl/Meta переключает ключи,
 * Shift выбирает видимый диапазон. OnSelect всегда сообщает selected=true;
 * снятие controlled-режима сохраняет последние принятые ключи.
 */
export interface DirectoryTreeProps extends TreeProps {
  /** Раскрытие заголовком. @defaultValue 'click' */
  expandAction?: TreeExpandAction;
  /** @defaultValue true */
  showIcon?: boolean;
  /** @defaultValue true */
  blockNode?: boolean;
}
