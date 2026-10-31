import type { Dayjs } from 'dayjs';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { DatePickerDisabledTime, DatePickerTimeConfig } from './date-picker.types';
import type {
  RangePickerProps,
  RangePickerInfo,
  RangePickerPart
} from './range-picker.types';
import type {
  TimePickerContent,
  TimePickerCellRenderInfo,
  TimePickerSlots
} from './time-picker.types';

export type TimeRangePickerFocusOptions = FocusOptions & {
  index?: 0 | 1;
  cursor?: 'start' | 'end' | 'all';
};

/** В диапазоне semantic callback получает resolved size/disabled и исходный variant. */
export type TimeRangePickerSemantic = TimePickerSlots
  | ((info: { props: TimeRangePickerProps; }) => TimePickerSlots | undefined);

/** Пара Dayjs с picker=time; каждая граница подтверждается отдельно, как в rc-picker. */
export interface TimeRangePickerProps extends Omit<
  RangePickerProps,
  'showTime' | 'allowClear' | 'status' | 'disabledDate' | 'disabledTime'
    | 'onPickerValueChange' | 'onPanelChange' | 'prefix' | 'onclick'
    | 'onfocus' | 'onblur' | 'multiple' | 'placeholder' | 'renderExtraFooter'
>, Omit<DatePickerTimeConfig, 'format' | 'defaultOpenValue'> {
  placeholder?: string | [string, string];
  /** Заполняет только панель и кандидат OK; одиночный Dayjs относится к start. */
  defaultOpenValue?: Dayjs | [Dayjs, Dayjs];
  changeOnScroll?: boolean;
  allowClear?: boolean | { clearIcon?: TimePickerContent; };
  clearIcon?: TimePickerContent;
  suffixIcon?: TimePickerContent;
  prefix?: TimePickerContent;
  status?: 'error' | 'warning' | 'success' | 'validating';
  /** @deprecated Используйте variant. */
  bordered?: boolean;
  /** @deprecated Используйте classNames.popup.root; popupClassName имеет приоритет. */
  dropdownClassName?: string;
  /** @deprecated Используйте styles.popup.root. */
  popupStyle?: string;
  classNames?: TimeRangePickerSemantic;
  styles?: TimeRangePickerSemantic;
  cellRender?: Snippet<[number | 'am' | 'pm', TimePickerCellRenderInfo]>;
  panelRender?: Snippet<[Snippet]>;
  renderExtraFooter?: Snippet<['time']>;
  disabledDate?: (date: Dayjs, info: { type: 'time'; from?: Dayjs | null; }) => boolean;
  disabledTime?: (
    date: Dayjs,
    partial: RangePickerPart,
    info: { from?: Dayjs | null; }
  ) => DatePickerDisabledTime;
  onPickerValueChange?: (
    value: [Dayjs, Dayjs],
    info: RangePickerInfo & { source: 'reset' | 'panel'; mode: ['time', 'time']; }
  ) => void;
  onPanelChange?: (value: [Dayjs | null, Dayjs | null], modes: ['time', 'time']) => void;
  onclick?: HTMLAttributes<HTMLDivElement>['onclick'];
  onClick?: HTMLAttributes<HTMLDivElement>['onclick'];
  /** Вызывается и для native controls панели; info относится к активной границе. */
  onfocus?: (event: FocusEvent, info: RangePickerInfo) => void;
  onblur?: (event: FocusEvent, info: RangePickerInfo) => void;
  onFocus?: TimeRangePickerProps['onfocus'];
  onBlur?: TimeRangePickerProps['onblur'];
  onKeyDown?: (event: KeyboardEvent, preventDefault?: () => void) => void;
}
