import type { RangePickerProps } from './range-picker.types';
import type { TimeRangePickerProps } from './time-range-picker.types';

const timeOnly = new Set([
  'hourStep', 'minuteStep', 'secondStep', 'millisecondStep', 'showHour', 'showMinute',
  'showSecond', 'showMillisecond', 'use12Hours', 'hideDisabledOptions', 'defaultOpenValue',
  'changeOnScroll', 'suffixIcon', 'prefix', 'classNames', 'styles',
  'cellRender', 'panelRender', 'onPickerValueChange', 'onPanelChange', 'disabledDate',
  'onclick', 'onClick', 'onFocus', 'onBlur', 'onKeyDown', 'onfocus', 'onblur',
  'allowClear', 'status', 'placeholder', 'renderExtraFooter', 'disabledTime'
]);

/** Общие поля RangePicker без time-only callbacks и renderers в native attributes. */
export function timeRangeSharedProps(props: TimeRangePickerProps): RangePickerProps {
  // Типы callback payload сохраняются на time boundary, остальные поля общие для RangePicker.
  const shared = Object.fromEntries(
    Object.entries(props).filter(([key]) => !timeOnly.has(key))
  ) as RangePickerProps;
  return { ...shared, showTime: true };
}
