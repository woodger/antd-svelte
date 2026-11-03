import type { Snippet } from 'svelte';
import type { DesignTokenConfig } from './theme-token.types';
import type { ComponentsConfig } from './theme-component-token.types';
import type { TypographyLocale } from './typography.types';
import type { ColorPickerLocale } from './color-picker.types';
import { colorPickerEnUS, colorPickerRuRU } from './color-picker.locale';
import { typographyEnUS, typographyRuRU } from './typography.locale';
import type { TourLocale } from './tour.types';
import type { CarouselLocale } from './carousel.types';
import { tourEnUS, tourRuRU } from './tour.locale';
import type { UploadLocale } from './upload.types';
import type { DatePickerLocale } from './date-picker.types';
import { datePickerEnUS, datePickerRuRU } from './date-picker.locale';
import type { QRCodeLocale } from './qrcode.types';
import type { CalendarLocale } from './calendar.types';
import type { TransferLocale } from './transfer.types';
import { transferEnUS, transferRuRU } from './transfer.locale';
import { qrCodeEnUS, qrCodeRuRU } from './qrcode.locale';
export type ComponentSize = 'small' | 'middle' | 'large';

/** Контейнер popup из ConfigProvider; trigger отсутствует у некоторых потребителей upstream. */
export type GetPopupContainer = (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot;

export type RenderEmptyComponent = 'Table' | 'Table.filter' | 'List' | 'Select'
  | 'TreeSelect' | 'Cascader' | 'Transfer' | 'Mentions';
export type RenderEmptyContent = string | number | boolean | null | undefined | Snippet
  | readonly RenderEmptyContent[];
/** Producer callback заменяет ReactNode; undefined/null/false/0 используют fallback List. */
export type RenderEmptyHandler = (componentName?: RenderEmptyComponent) => RenderEmptyContent;

/** Source tokens/algorithms с наследованием; mode/primary/compact сохраняют native theme API. */
export interface ThemeConfig extends DesignTokenConfig {
  mode?: 'light' | 'dark';
  primary?: 'blue' | 'purple' | 'green';
  /** Компактные метрики текста, размеров и отступов; native цвета сохраняются. */
  compact?: boolean;
  /**
   * Компонентные overrides в GlobalToken; algorithm=true пересчитывает зависимые aliases.
   * Применение ComponentToken к стилям компонентов пока переносится отдельно.
   */
  components?: ComponentsConfig;
  /** false сбрасывает родительские tokens/algorithm/components; hashed/cssVar/zeroRuntime наследуются. */
  inherit?: boolean;
  /** По умолчанию true; false возвращает пустой hashId. */
  hashed?: boolean;
  /** Prefix по умолчанию ant; key генерируется для каждого provider с локальной theme. */
  cssVar?: { prefix?: string; key?: string; };
  /** Компоненты используют опубликованный CSS; настройка наследуется вместе с source theme. */
  zeroRuntime?: boolean;
}

export type ResolvedThemeConfig = ThemeConfig
  & Required<Pick<ThemeConfig, 'mode' | 'primary' | 'compact'>>;

export interface Locale {
  colorPicker?: Partial<ColorPickerLocale>;
  ColorPicker?: Partial<ColorPickerLocale>;
  typography?: Partial<TypographyLocale>;
  /** Исходный alias Ant Design; локальные поля Text перекрывают typography. */
  Text?: Partial<TypographyLocale>;
  global?: { show?: string; hide?: string; close?: string; };
  tour?: Partial<TourLocale>;
  /** Исходный alias Ant Design; локальный Tour имеет приоритет над tour. */
  Tour?: Partial<TourLocale>;
  carousel?: Partial<CarouselLocale>;
  /** Исходный alias Ant Design; локальный Carousel перекрывает carousel. */
  Carousel?: Partial<CarouselLocale>;
  image?: { preview?: string; };
  tree?: { expand?: string; collapse?: string; };
  upload?: UploadLocale;
  datePicker?: DatePickerLocale;
  calendar?: CalendarLocale;
  transfer?: TransferLocale;
  okText: string;
  cancelText: string;
  closeText: string;
  clearText: string;
  emptyText: string;
  searchText: string;
  submitErrorText: string;
  confirmErrorText?: string;
  removeText?: string;
  selectRequiredText?: string;
  pagination?: Partial<PaginationLocale>;
  table?: Partial<TableLocale>;
  inputNumber?: Partial<InputNumberLocale>;
  progress?: Partial<ProgressLocale>;
  spin?: Partial<SpinLocale>;
  skeleton?: Partial<SkeletonLocale>;
  empty?: Partial<EmptyLocale>;
  steps?: Partial<StepsLocale>;
  badge?: Partial<BadgeLocale>;
  avatarGroup?: Partial<AvatarGroupLocale>;
  layout?: Partial<LayoutLocale>;
  qrcode?: Partial<QRCodeLocale>;
}

export interface LayoutLocale {
  expand: string;
  collapse: string;
}

export interface AvatarGroupLocale {
  label: string;
  hiddenLabel: string;
  overflow: string;
}

export interface BadgeLocale {
  count: string;
  dot: string;
  success: string;
  processing: string;
  default: string;
  error: string;
  warning: string;
}

export interface StepsLocale {
  label: string;
  wait: string;
  process: string;
  finish: string;
  error: string;
}

export interface EmptyLocale {
  description: string;
}

export interface SkeletonLocale {
  loadingText: string;
}

export interface SpinLocale {
  loadingText: string;
}

export interface ProgressLocale {
  label: string;
  successText: string;
  exceptionText: string;
}

export interface InputNumberLocale {
  increase: string;
  decrease: string;
  invalidNumber: string;
}

export interface TableLocale {
  label: string;
  emptyText: string;
  loadingText: string;
  selectAll: string;
  selectRow: string;
  sortAscending: string;
  sortDescending: string;
  cancelSort: string;
  filterTitle?: string;
  filterApply?: string;
  filterReset?: string;
  expandColumn?: string;
  expandRow?: string;
  collapseRow?: string;
}

export interface PaginationLocale {
  label: string;
  previous: string;
  next: string;
  page: string;
  jumpPrevious: string;
  jumpNext: string;
  pageSize: string;
  itemsPerPage: string;
  jumpTo?: string;
  jumpToConfirm?: string;
  pageSuffix?: string;
  items_per_page?: string;
  jump_to?: string;
  jump_to_confirm?: string;
  prev_page?: string;
  next_page?: string;
  prev_5?: string;
  next_5?: string;
  prev_3?: string;
  next_3?: string;
  page_size?: string;
}

export interface SelectOption<Value extends string | number = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

export const ruRU = {
  colorPicker: colorPickerRuRU,
  typography: typographyRuRU,
  tour: tourRuRU,
  carousel: { prevSlide: 'Предыдущий слайд', nextSlide: 'Следующий слайд' },
  tree: { expand: 'Развернуть', collapse: 'Свернуть' },
  upload: {
    uploading: 'Загрузка...',
    removeFile: 'Удалить файл',
    uploadError: 'При загрузке произошла ошибка',
    previewFile: 'Предпросмотр файла',
    downloadFile: 'Загрузить файл'
  },
  datePicker: datePickerRuRU,
  calendar: datePickerRuRU,
  layout: { expand: 'Развернуть боковую панель', collapse: 'Свернуть боковую панель' },
  avatarGroup: {
    label: 'Участники',
    hiddenLabel: 'Скрытые участники',
    overflow: 'Ещё участников'
  },
  badge: {
    count: 'Количество',
    dot: 'Есть обновления',
    success: 'Успешно',
    processing: 'Выполняется',
    default: 'Обычный статус',
    error: 'Ошибка',
    warning: 'Предупреждение'
  },
  steps: {
    label: 'Этапы',
    wait: 'Ожидается',
    process: 'Выполняется',
    finish: 'Завершён',
    error: 'Ошибка'
  },
  empty: { description: 'Нет данных' },
  skeleton: { loadingText: 'Загрузка…' },
  spin: { loadingText: 'Загрузка…' },
  qrcode: qrCodeRuRU,
  progress: { label: 'Ход выполнения', successText: 'Завершено', exceptionText: 'Ошибка' },
  inputNumber: {
    increase: 'Увеличить значение',
    decrease: 'Уменьшить значение',
    invalidNumber: 'Введите число в допустимом диапазоне.'
  },
  removeText: 'Удалить',
  selectRequiredText: 'Выберите хотя бы один вариант.',
  okText: 'Подтвердить',
  cancelText: 'Отмена',
  closeText: 'Закрыть',
  global: { show: 'Показать', hide: 'Скрыть', close: 'Закрыть' },
  image: { preview: 'Просмотр изображения' },
  clearText: 'Очистить',
  emptyText: 'Ничего не найдено',
  searchText: 'Поиск',
  submitErrorText: 'Не удалось отправить форму. Попробуйте ещё раз.',
  confirmErrorText: 'Не удалось выполнить действие. Попробуйте ещё раз.',
  pagination: {
    label: 'Пагинация',
    previous: 'Предыдущая страница',
    next: 'Следующая страница',
    page: 'Страница',
    jumpPrevious: 'Предыдущие страницы',
    jumpNext: 'Следующие страницы',
    pageSize: 'Записей на странице',
    itemsPerPage: '/ стр.',
    jumpTo: 'Перейти',
    jumpToConfirm: 'подтвердить',
    pageSuffix: 'Страница'
  },
  transfer: transferRuRU,
  table: {
    label: 'Таблица',
    emptyText: 'Нет данных',
    loadingText: 'Загрузка данных…',
    selectAll: 'Выбрать все строки на странице',
    selectRow: 'Выбрать строку',
    sortAscending: 'Сортировать по возрастанию',
    sortDescending: 'Сортировать по убыванию',
    cancelSort: 'Сбросить сортировку',
    filterTitle: 'Фильтр',
    filterApply: 'Применить',
    filterReset: 'Сбросить',
    expandColumn: 'Подробности',
    expandRow: 'Раскрыть строку',
    collapseRow: 'Свернуть строку'
  }
} satisfies Locale;

export const enUS = {
  colorPicker: colorPickerEnUS,
  typography: typographyEnUS,
  tour: tourEnUS,
  carousel: { prevSlide: 'Previous slide', nextSlide: 'Next slide' },
  tree: { expand: 'Expand', collapse: 'Collapse' },
  upload: {
    uploading: 'Uploading...',
    removeFile: 'Remove file',
    uploadError: 'Upload error',
    previewFile: 'Preview file',
    downloadFile: 'Download file'
  },
  datePicker: datePickerEnUS,
  calendar: datePickerEnUS,
  layout: { expand: 'Expand sidebar', collapse: 'Collapse sidebar' },
  avatarGroup: { label: 'Members', hiddenLabel: 'Hidden members', overflow: 'More members' },
  badge: {
    count: 'Count',
    dot: 'Updates available',
    success: 'Success',
    processing: 'Processing',
    default: 'Default status',
    error: 'Error',
    warning: 'Warning'
  },
  steps: {
    label: 'Steps',
    wait: 'Waiting',
    process: 'In progress',
    finish: 'Finished',
    error: 'Error'
  },
  empty: { description: 'No data' },
  skeleton: { loadingText: 'Loading…' },
  spin: { loadingText: 'Loading…' },
  qrcode: qrCodeEnUS,
  progress: { label: 'Progress', successText: 'Completed', exceptionText: 'Failed' },
  inputNumber: {
    increase: 'Increase value',
    decrease: 'Decrease value',
    invalidNumber: 'Enter a number within the allowed range.'
  },
  removeText: 'Remove',
  selectRequiredText: 'Select at least one option.',
  okText: 'OK',
  cancelText: 'Cancel',
  closeText: 'Close',
  global: { show: 'Show', hide: 'Hide', close: 'Close' },
  image: { preview: 'Image preview' },
  clearText: 'Clear',
  emptyText: 'No options',
  searchText: 'Search',
  submitErrorText: 'Could not submit the form. Please try again.',
  confirmErrorText: 'Could not complete the action. Please try again.',
  pagination: {
    label: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
    page: 'Page',
    jumpPrevious: 'Previous pages',
    jumpNext: 'Next pages',
    pageSize: 'Items per page',
    itemsPerPage: '/ page',
    jumpTo: 'Go to',
    jumpToConfirm: 'confirm',
    pageSuffix: 'Page'
  },
  transfer: transferEnUS,
  table: {
    label: 'Table',
    emptyText: 'No data',
    loadingText: 'Loading data…',
    selectAll: 'Select all rows on this page',
    selectRow: 'Select row',
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    cancelSort: 'Clear sorting',
    filterTitle: 'Filter',
    filterApply: 'Apply',
    filterReset: 'Reset',
    expandColumn: 'Details',
    expandRow: 'Expand row',
    collapseRow: 'Collapse row'
  }
} satisfies Locale;
