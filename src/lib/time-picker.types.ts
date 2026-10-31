import type { Dayjs } from 'dayjs';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { DatePickerProps, DatePickerTimeConfig } from './date-picker.types';
import type { PickerLocale } from './picker-locale.types';
import type { InputContent } from './input.types';

export type TimePickerUnit = 'hour' | 'minute' | 'second' | 'millisecond';
export type TimePickerColumnType = TimePickerUnit | 'meridiem';
export type TimePickerContent = InputContent;
export type TimePickerFocusOptions = FocusOptions & { cursor?: 'start' | 'end' | 'all'; };

/** Словарь из Ant Design; prop locale использует общий DatePickerLocale с timePickerLocale. */
export interface TimePickerLocale {
  placeholder?: string;
  rangePlaceholder?: [string, string];
}

/** OriginNode — native button snippet; остальные поля сохраняют форму rc-picker. */
export interface TimePickerCellRenderInfo {
  prefixCls: string;
  originNode: Snippet;
  today: Dayjs;
  type: 'time';
  subType: TimePickerColumnType;
  range?: 'start' | 'end';
  locale: PickerLocale;
}

export interface TimePickerPreset {
  label: string | Snippet;
  value: Dayjs | (() => Dayjs);
}

export interface TimePickerPopupSlots {
  root?: string;
  content?: string;
  item?: string;
  footer?: string;
  container?: string;
}

export interface TimePickerSlots {
  root?: string;
  prefix?: string;
  input?: string;
  suffix?: string;
  /** Строка для classNames равнозначна popup.root. */
  popup?: string | TimePickerPopupSlots;
}

/** Как outer TimePicker: локальный callback получает исходные props с разрешённым variant. */
export type TimePickerSemantic = TimePickerSlots
  | ((info: { props: TimePickerProps; }) => TimePickerSlots | undefined);

/**
 * Объект component config заменяется целиком во вложенном ConfigProvider.
 * Общий semantic callback получает range props в TimeRangePicker runtime, как upstream.
 */
export interface TimePickerConfig {
  class?: string;
  style?: string;
  variant?: DatePickerProps['variant'];
  classNames?: TimePickerSemantic;
  styles?: TimePickerSemantic;
  suffixIcon?: TimePickerContent | true;
  allowClear?: boolean | { clearIcon?: TimePickerContent; };
  clearIcon?: TimePickerContent;
}

/** Выбор времени через Dayjs; дата, UTC/timezone и точность не сериализуются компонентом. */
export interface TimePickerProps extends Omit<
  DatePickerProps,
  'showTime' | 'showToday' | 'allowClear' | 'status' | 'onCalendarChange'
    | 'onPanelChange' | 'onPickerValueChange' | 'disabledDate' | 'onChange'
    | 'prefix' | 'onclick' | 'multiple'
>, Omit<DatePickerTimeConfig, 'format'> {
  /** На этом этапе поддерживается один Dayjs; multiple следует отдельным переносом. */
  multiple?: false;
  /** По умолчанию true, как в rc-picker для picker=time. */
  needConfirm?: boolean;
  /** По умолчанию hover; preview не вызывает change/calendarChange. */
  previewValue?: false | 'hover';
  /** Выбирает ближайший разрешённый unit через 300 ms после ручной прокрутки. */
  changeOnScroll?: boolean;
  /** По умолчанию true; иконка объекта имеет приоритет над clearIcon. */
  allowClear?: boolean | { clearIcon?: TimePickerContent; };
  clearIcon?: TimePickerContent;
  suffixIcon?: TimePickerContent | true;
  prefix?: TimePickerContent;
  status?: 'error' | 'warning' | 'success' | 'validating';
  /** @deprecated Используйте variant. False включает borderless, если variant не задан. */
  bordered?: boolean;
  /** @deprecated Используйте renderExtraFooter; современный snippet имеет приоритет. */
  addon?: Snippet;
  /** @deprecated Используйте styles.popup.root. */
  popupStyle?: string;
  classNames?: TimePickerSemantic;
  styles?: TimePickerSemantic;
  cellRender?: Snippet<[number | 'am' | 'pm', TimePickerCellRenderInfo]>;
  /** Получает snippet стандартной panel layout, сохраняя внешний popup lifecycle. */
  panelRender?: Snippet<[Snippet]>;
  presets?: readonly TimePickerPreset[];
  onclick?: HTMLAttributes<HTMLDivElement>['onclick'];
  /** Совместимый alias; onclick имеет приоритет. */
  onClick?: HTMLAttributes<HTMLDivElement>['onclick'];
  onFocus?: DatePickerProps['onfocus'];
  onBlur?: DatePickerProps['onblur'];
  onKeyDown?: (event: KeyboardEvent, preventDefault?: () => void) => void;
  disabledDate?: (date: Dayjs, info: { type: 'time'; }) => boolean;
  /** Третий аргумент SinglePicker — пустой объект после удаления range. */
  onCalendarChange?: (value: Dayjs | null, dateString: string, info: Record<string, never>) => void;
  /** При полной очистке dateString=null, как в runtime SinglePicker rc-picker. */
  onChange?: (value: Dayjs | null, dateString: string | null) => void;
  /** @deprecated Вызывается после onCalendarChange; при очистке может получить null. */
  onSelect?: (value: Dayjs | null) => void;
  onPanelChange?: (value: Dayjs, mode: 'time') => void;
  onPickerValueChange?: (value: Dayjs, info: { source: 'reset' | 'panel'; mode: 'time'; }) => void;
}
