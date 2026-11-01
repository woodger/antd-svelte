import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { RowProps, GridBreakpoint } from './grid.types';
import type { PaginationConfig } from './pagination.types';
import type { RenderEmptyContent } from './types';
import type { SpinProps } from './spin.types';

export type ListKey = string | number | bigint;
export type ListContent = RenderEmptyContent;
export type ListSize = 'small' | 'default' | 'large';
export type ListItemLayout = 'horizontal' | 'vertical';
export type ColumnCount = number;
export type ColumnType = 'gutter' | 'column' | GridBreakpoint;

export interface ListGridType {
  gutter?: RowProps['gutter'];
  column?: ColumnCount;
  xs?: ColumnCount;
  sm?: ColumnCount;
  md?: ColumnCount;
  lg?: ColumnCount;
  xl?: ColumnCount;
  xxl?: ColumnCount;
  xxxl?: ColumnCount;
}

export interface ListLocale {
  emptyText?: ListContent;
}

export type ListItemSemanticName = 'actions' | 'extra';
export type ListItemSemanticClassNames = Partial<Record<ListItemSemanticName, string>>;
export type ListItemSemanticStyles = Partial<Record<ListItemSemanticName, string>>;

/** Общие настройки List и semantic slots ListItem; локальные значения имеют приоритет. */
export interface ListConfig {
  class?: string;
  style?: string;
  item?: {
    classNames?: ListItemSemanticClassNames;
    styles?: ListItemSemanticStyles;
  };
}

/**
 * Список Ant Design с исходной пагинацией и grid.
 * @deprecated В Ant Design 6.6.8 заменён на отдельный Listy; поведение List сохранено.
 */
export interface ListProps<T = unknown> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  /** @defaultValue false */
  bordered?: boolean;
  /** @defaultValue true */
  split?: boolean;
  dataSource?: readonly T[];
  /** Прямой Svelte snippet заменяет callback, возвращающий ReactNode. Index — внутри страницы. */
  renderItem?: Snippet<[item: T, index: number]>;
  /** Нулевой и пустой ключи сохраняются; без ключа используется индекс внутри страницы. */
  rowKey?: keyof T | ((item: T) => ListKey);
  children?: ListContent;
  header?: ListContent;
  footer?: ListContent;
  /** Truthy content заменяет нижнюю пагинацию, сохраняя верхнюю. */
  loadMore?: ListContent;
  /** Присутствует в типах upstream, но не отображает отдельный блок. */
  extra?: ListContent;
  grid?: ListGridType;
  itemLayout?: ListItemLayout;
  /** @defaultValue false */
  loading?: boolean | SpinProps;
  /** Defaults читаются один раз; current/pageSize в объекте остаются controlled. */
  pagination?: PaginationConfig | boolean | null;
  size?: ListSize;
  locale?: ListLocale;
  /** Меняет DOM-классы; встроенный CSS рассчитан на ant-list. */
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Поддерживает bind:nativeElement; доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}

/** ListItem использует контекст List; nativeElement — li либо внешний grid Col. */
export interface ListItemProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'class' | 'style'
> {
  /** Массив сохраняет типы строк/чисел и точный mixed-text layout при SSR. */
  children?: ListContent;
  actions?: readonly ListContent[];
  extra?: ListContent;
  classNames?: ListItemSemanticClassNames;
  styles?: ListItemSemanticStyles;
  colStyle?: string;
  prefixCls?: string;
  class?: string;
  style?: string;
  nativeElement?: HTMLElement;
}

/** Объектный ref Meta; nativeElement отсутствует до mount и после unmount. */
export interface ListItemMetaRef {
  readonly nativeElement: HTMLDivElement | undefined;
}

/** Meta с avatar/title/description; children, как в upstream, не отображаются. */
export interface ListItemMetaProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'title' | 'class' | 'style'
> {
  avatar?: ListContent;
  title?: ListContent;
  description?: ListContent;
  children?: ListContent;
  prefixCls?: string;
  class?: string;
  style?: string;
  nativeElement?: HTMLDivElement;
  /** Поддерживает bind:ref; очищается при unmount. */
  ref?: ListItemMetaRef;
}

export interface ListConsumerProps {
  readonly grid?: ListGridType;
  readonly itemLayout?: ListItemLayout;
}
