import type { Snippet } from 'svelte';
import type { PaginationProps } from './Pagination.svelte';
import type { ComponentSize } from './types';

export type TableKey = string | number;
export type TableRowKey<Row extends object> = keyof Row | ((record: Row) => TableKey);
export type TableSortOrder = 'ascend' | 'descend';
export type TableMode = 'client' | 'server';
export type TableFixed = boolean | 'start' | 'end';
export type TableFilterValue = TableKey | boolean;
export type TableFilters = Record<string, TableFilterValue[]>;

export interface TableFilterOption {
  text: string;
  value: TableFilterValue;
}

export interface TableSorter {
  columnKey: string;
  order: TableSortOrder;
}

export interface TableColumn<Row extends object> {
  key: string;
  title: string;
  dataIndex?: keyof Row;
  render?: Snippet<[record: Row, index: number]>;
  sorter?: true | ((left: Row, right: Row) => number);
  filters?: readonly TableFilterOption[];
  onFilter?: (value: TableFilterValue, record: Row) => boolean;
  filterMultiple?: boolean;
  align?: 'left' | 'center' | 'right';
  /** Дополняет классы заголовка и каждой ячейки данных этой колонки. */
  className?: string;
  /** Ячейки данных этой колонки становятся th с указанным scope. */
  rowScope?: 'row' | 'rowgroup';
  /** Убирает колонку из DOM, сохраняя её сортировку и фильтры данных. @defaultValue false */
  hidden?: boolean;
  width?: number | string;
  fixed?: TableFixed;
}

export interface TableRowSelection<Row extends object> {
  fixed?: boolean;
  getCheckboxProps?: (record: Row) => { disabled?: boolean; 'aria-label'?: string; };
}

export interface TableExpandable<Row extends object> {
  expandedRowRender: Snippet<[record: Row, index: number]>;
  /** Управляемые ключи; новое значение принимает владелец через onExpandedRowsChange. */
  expandedRowKeys?: TableKey[];
  /** Начальные ключи; последующие изменения не переинициализируют состояние. */
  defaultExpandedRowKeys?: readonly TableKey[];
  onExpand?: (expanded: boolean, record: Row) => void;
  onExpandedRowsChange?: (keys: TableKey[]) => void;
  rowExpandable?: (record: Row) => boolean;
  columnTitle?: string;
  columnWidth?: number | string;
  fixed?: boolean;
}

/** Настройки Pagination, которыми управляет Table; total вычисляется по данным. */
export type TablePaginationConfig = Pick<
  PaginationProps,
  'showSizeChanger' | 'pageSizeOptions' | 'hideOnSinglePage' | 'showTotal' | 'aria-label'
>;

export interface TableChange<Row extends object> {
  action: 'sort' | 'paginate' | 'filter';
  pagination: { current: number; pageSize: number; total: number; };
  sorter: TableSorter | null;
  filters?: TableFilters;
  currentDataSource: Row[];
}

/** Типизированная таблица с columns, row identity, фильтрами, сортировкой и пагинацией. */
export interface TableProps<Row extends object> {
  /** @defaultValue 'client' */
  mode?: TableMode;
  total?: number;
  dataSource: readonly Row[];
  columns: readonly TableColumn<Row>[];
  rowKey?: TableRowKey<Row>;
  /** Дополняет классы строки; index относится к текущей странице, indent у плоских данных равен 0. */
  rowClassName?: string | ((record: Row, index: number, indent: number) => string);
  /** Подсветка строк при наведении; изменение сразу обновляет оформление. @defaultValue true */
  rowHoverable?: boolean;
  /** Отображает заголовок колонок, сохраняя данные, caption и панели. @defaultValue true */
  showHeader?: boolean;
  /** Поддерживает bind:sorter. */
  sorter?: TableSorter | null;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultSorter?: TableSorter | null;
  /** Поддерживает bind:filters. */
  filters?: TableFilters;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultFilters?: Readonly<Record<string, readonly TableFilterValue[]>>;
  /** Поддерживает bind:current. */
  current?: number;
  /** @defaultValue 1 */
  defaultCurrent?: number;
  /** Поддерживает bind:pageSize. */
  pageSize?: number;
  /** @defaultValue 10 */
  defaultPageSize?: number;
  pagination?: false | TablePaginationConfig;
  /** @defaultValue false */
  rowSelection?: boolean | TableRowSelection<Row>;
  /** Поддерживает bind:selectedRowKeys. */
  selectedRowKeys?: TableKey[];
  defaultSelectedRowKeys?: readonly TableKey[];
  onChange?: (change: TableChange<Row>) => void;
  onSelectionChange?: (keys: TableKey[], rows: Row[], info: { type: 'single' | 'all'; }) => void;
  expandable?: TableExpandable<Row>;
  /** @defaultValue false */
  loading?: boolean;
  disabled?: boolean;
  /** @defaultValue false */
  bordered?: boolean;
  size?: ComponentSize;
  /** Панель перед таблицей; получает отсортированные/отфильтрованные записи текущей страницы. */
  title?: Snippet<[data: readonly Row[]]>;
  /** Панель после таблицы; получает те же записи страницы, включая пустой массив. */
  footer?: Snippet<[data: readonly Row[]]>;
  caption?: string;
  empty?: Snippet;
  scroll?: { x?: number | string; y?: number | string; };
  'aria-label'?: string;
  class?: string;
  style?: string;
}
