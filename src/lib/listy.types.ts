import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type ListyKey = string | number | bigint;
export type ScrollAlign = 'top' | 'bottom' | 'auto';
export type ListyScrollAlign = ScrollAlign;
export type ListySemanticName = 'root' | 'item' | 'groupHeader';
export type ListyClassNames = Partial<Record<ListySemanticName, string>>;
/** Значения semantic styles записываются как CSS declaration strings. */
export type ListyStyles = Partial<Record<ListySemanticName, string>>;

/** Сырые props до применения defaults и ConfigProvider; generic callbacks остаются unknown. */
export interface ListySemanticProps {
  items?: readonly unknown[];
  sticky?: boolean;
  height?: number;
  virtual?: boolean;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: string;
  [name: string]: unknown;
}

export type ListySemantic = ListyClassNames | ((info: {
  props: ListySemanticProps;
}) => ListyClassNames);

/** Группы собираются по всему items, сохраняя порядок первого появления ключа. */
export interface ListyGroup<T, K extends ListyKey = ListyKey> {
  key: (item: T) => K;
  /** Snippet получает ключ и исходные объекты группы; index itemRender не меняется. */
  title: Snippet<[groupKey: K, items: T[]]>;
}

/** Align по умолчанию auto; group target — section в raw mode, header row в virtual mode. */
export type ListyScrollToConfig = number | null | {
  key: ListyKey;
  align?: ListyScrollAlign;
  offset?: number;
} | {
  groupKey: ListyKey;
  align?: ListyScrollAlign;
  offset?: number;
} | {
  top?: number;
  left?: number;
};

/** Доступен через bind:ref после mount; при unmount binding очищается. */
export interface ListyRef {
  /** Без аргумента: no-op в raw mode, показать scrollbar в virtual mode. */
  scrollTo: (config?: ListyScrollToConfig) => void;
}

/** Настройки Listy; локальные class/styles дополняют и перекрывают унаследованные. */
export interface ListyConfig {
  class?: string;
  style?: string;
  classNames?: ListySemantic;
  styles?: ListySemantic;
}

/** Список Ant Design с группировкой, sticky headers и измеряемыми виртуальными строками. */
export interface ListyProps<T = unknown, K extends ListyKey = ListyKey> {
  items?: readonly T[];
  /** Обязательный стабильный ключ; fallback на index отсутствует. */
  rowKey: keyof T | ((item: T) => ListyKey);
  /** Прямой Svelte snippet вместо ReactNode callback; index — в исходном items. */
  itemRender: Snippet<[item: T, index: number]>;
  group?: ListyGroup<T, K>;
  /** @defaultValue false */
  sticky?: boolean;
  height?: number;
  /** local ?? ConfigProvider.virtual ?? false; для окна также нужна ненулевая height. */
  virtual?: boolean;
  /** Native scroll event: currentTarget — root в raw mode, holder в virtual mode. */
  onScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  onscroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  classNames?: ListySemantic;
  styles?: ListySemantic;
  /** Меняет классы; встроенный CSS рассчитан на ant-listy. */
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Поддерживает bind:ref; объект содержит только scrollTo. */
  ref?: ListyRef;
  /** Корневой div; поддерживает bind:nativeElement и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  id?: string;
  role?: HTMLAttributes<HTMLDivElement>['role'];
  tabindex?: number;
  [attribute: `aria-${string}`]: unknown;
  [attribute: `data-${string}`]: unknown;
}

export interface ListyViewProps<T, K extends ListyKey> {
  items: readonly T[];
  rowKey: ListyProps<T, K>['rowKey'];
  itemRender: ListyProps<T, K>['itemRender'];
  group?: ListyGroup<T, K>;
  sticky?: boolean;
  height?: number;
  itemHeight: number;
  prefixCls: string;
  direction: 'ltr' | 'rtl';
  classNames: ListyClassNames;
  styles: ListyStyles;
  onScroll?: ListyProps<T, K>['onScroll'];
  ref?: ListyRef;
  nativeElement?: HTMLDivElement;
  attributes: Record<string, unknown>;
}
