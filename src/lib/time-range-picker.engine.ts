// Range time paths rc-picker 1.12.2; MIT, vendor/LICENSE.rc-picker.
import type { Dayjs } from 'dayjs';
import type { RangePickerValue } from './range-picker.types';
import type { TimeRangePickerProps } from './time-range-picker.types';
import type { DatePickerTimeConfig } from './date-picker.types';
import type { PickerLocale } from './picker-locale.types';
import { timePickerClock, timePickerSameValue, timePickerDateDisabled } from './time-picker.engine';
import { pickerTimeDisabled } from './date-picker.engine';

export function sameTimeRange(a: RangePickerValue, b: RangePickerValue) {
  return timePickerSameValue(a[0], b[0]) && timePickerSameValue(a[1], b[1]);
}

export function timeRangeClock(props: TimeRangePickerProps, locale: PickerLocale, index: number) {
  const defaults = Array.isArray(props.defaultOpenValue)
    ? props.defaultOpenValue : [props.defaultOpenValue];
  return timePickerClock({ ...props, defaultOpenValue: defaults[index] }, locale);
}

export function samePickerTime(a: Dayjs, b: Dayjs) {
  return a.hour() === b.hour() && a.minute() === b.minute() && a.second() === b.second();
}

export function timeRangeInvalid(
  date: Dayjs,
  props: TimeRangePickerProps,
  clock: DatePickerTimeConfig,
  index: number,
  info?: { from?: Dayjs | null; }
) {
  return !date.isValid() || timePickerDateDisabled(date, {
    minDate: props.minDate,
    maxDate: props.maxDate,
    disabledDate: value => !!props.disabledDate?.(value, { type: 'time', ...info })
  }) || pickerTimeDisabled(date, {
    showTime: clock,
    disabledTime: value => props.disabledTime?.(value, index === 1 ? 'end' : 'start', {
      from: info?.from
    }) ?? {}
  });
}

export function validTimeRange(
  values: RangePickerValue,
  empty: readonly boolean[],
  order: boolean,
  disabled: readonly boolean[],
  invalid: (date: Dayjs, index: number, info?: { from?: Dayjs | null; }) => boolean
) {
  const [start, end] = values;
  return Boolean((start || empty[0]) && (end || empty[1])
    && (!order || !start || !end || samePickerTime(start, end) || end.isAfter(start))
    && (disabled[0] || !start || !invalid(start, 0))
    && (disabled[1] || !end || !invalid(end, 1, { from: start })));
}
