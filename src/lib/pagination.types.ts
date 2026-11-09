import type { Snippet } from 'svelte';
import type { ComponentSize, PaginationLocale, SelectOption } from './types';
import type { SelectProps } from './select.types';

export type PaginationItemType = 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next';
export type PaginationContent = string | number | boolean | null | Snippet;

export interface PaginationItemInfo {
  disabled: boolean;
  active: boolean;
  label: string;
  title?: string;
  /** Привяжите к native control, если не используете originalElement. */
  onClick: (event: MouseEvent) => void;
}

export interface PaginationSizeChangerInfo {
  value: number;
  disabled: boolean;
  class: string;
  prefixCls: string;
  options: readonly SelectOption<number>[];
  onChange: (value: number) => void;
}

/** Поддержанные Select props; onChange сохраняет callback Ant Design. */
export interface PaginationSizeChangerProps extends Partial<SelectProps<number>> {
  onChange?: (value: number, option: SelectOption<number> | undefined) => void;
}

export interface PaginationSlots {
  root?: string;
  item?: string;
}

export type PaginationSemantic = PaginationSlots
  | ((info: { props: PaginationProps; }) => PaginationSlots | undefined);

/** Общие настройки Pagination; локальные props имеют приоритет. */
export interface PaginationComponentConfig {
  class?: string;
  style?: string;
  classNames?: PaginationSemantic;
  styles?: PaginationSemantic;
  showSizeChanger?: boolean | PaginationSizeChangerProps;
  /** @defaultValue 50 */
  totalBoundaryShowSizeChanger?: number;
}

/** Pagination сохраняет bind:current/pageSize и нормализацию чисел прежнего API. */
export interface PaginationProps {
  /** @defaultValue 0 */
  total?: number;
  /** Поддерживает bind:current. */
  current?: number;
  /** Читается один раз. @defaultValue 1 */
  defaultCurrent?: number;
  /** Поддерживает bind:pageSize. */
  pageSize?: number;
  /** Читается один раз. @defaultValue 10 */
  defaultPageSize?: number;
  pageSizeOptions?: readonly (number | string)[];
  showSizeChanger?: boolean | PaginationSizeChangerProps;
  /** Порог автоматического size changer. @defaultValue 50 */
  totalBoundaryShowSizeChanger?: number;
  /** @defaultValue false */
  hideOnSinglePage?: boolean;
  showTotal?: Snippet<[total: number, range: [number, number]]>;
  /** По умолчанию буфер 2; true задаёт буфер 1 и jump на 3. @defaultValue false */
  showLessItems?: boolean;
  /** @defaultValue true */
  showPrevNextJumpers?: boolean;
  /** Input принимает цифры; goButton=true добавляет стандартную кнопку. @defaultValue false */
  showQuickJumper?: boolean | { goButton?: PaginationContent; };
  /** @defaultValue true */
  showTitle?: boolean;
  /** Объект включает simple mode; readOnly скрывает редактирование. @defaultValue false */
  simple?: boolean | { readOnly?: boolean; };
  align?: 'start' | 'center' | 'end';
  /** XS включает legacy mini без явного size; CSS 6.6.8 меняет высоту только при size=small. */
  responsive?: boolean;
  disabled?: boolean;
  size?: ComponentSize;
  /** Snake_case aliases; locale.page — suffix, config.locale.pagination.page — прежний label. */
  locale?: Partial<PaginationLocale>;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, pageSize: number) => void;
  /** OriginalElement — готовый native button; info заменяет cloneElement/LI click. */
  itemRender?: Snippet<[number, PaginationItemType, Snippet, PaginationItemInfo]>;
  prevIcon?: PaginationContent;
  nextIcon?: PaginationContent;
  jumpPrevIcon?: PaginationContent;
  jumpNextIcon?: PaginationContent;
  components?: { sizeChanger?: Snippet<[PaginationSizeChangerInfo]>; };
  classNames?: PaginationSemantic;
  styles?: PaginationSemantic;
  rootClassName?: string;
  /** Локальный префикс частей Pagination; пустая строка наследует ConfigProvider. */
  prefixCls?: string;
  /** Префикс custom size changer; штатный Select сохраняет собственные классы. */
  selectPrefixCls?: string;
  id?: string;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** Прежний class применяется к ul; semantic root соответствует native nav. */
  class?: string;
  style?: string;
  [attribute: `data-${string}`]: unknown;
  [attribute: `aria-${string}`]: unknown;
}
