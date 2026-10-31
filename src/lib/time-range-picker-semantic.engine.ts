import type { RangePickerConfig } from './range-picker.types';
import type { TimePickerConfig, TimePickerProps, TimePickerSemantic } from './time-picker.types';
import type { TimeRangePickerProps, TimeRangePickerSemantic } from './time-range-picker.types';
import { mergePickerSlots } from './time-picker-semantic.engine';

export function timeRangeSemantic(
  props: TimeRangePickerProps,
  context: TimePickerConfig | undefined,
  range: RangePickerConfig | undefined,
  resolved: Pick<TimeRangePickerProps, 'size' | 'disabled'>
) {
  const filled = { ...props, ...resolved };
  const resolve = (value: TimeRangePickerSemantic | undefined) =>
    typeof value === 'function' ? value({ props: filled }) : value;
  const resolveContext = (value: TimePickerSemantic | undefined) => {
    // В upstream общий timePicker config типизирован single props, но получает range props.
    return typeof value === 'function'
      ? value({ props: filled as unknown as TimePickerProps }) : value;
  };
  return {
    classes: mergePickerSlots([
      resolveContext(context?.classNames), resolve(props.classNames),
      { popup: { root: props.popupClassName || props.dropdownClassName } }
    ], ' '),
    styles: mergePickerSlots([
      resolveContext(context?.styles), { root: range?.style }, resolve(props.styles),
      { popup: { root: props.popupStyle } }
    ], ';')
  };
}
