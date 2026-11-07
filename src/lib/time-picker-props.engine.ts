import type { DatePickerProps } from './date-picker.types';
import type { TimePickerProps } from './time-picker.types';

const timeOnly = new Set([
  'hourStep', 'minuteStep', 'secondStep', 'millisecondStep', 'showHour', 'showMinute',
  'showSecond', 'showMillisecond', 'use12Hours', 'hideDisabledOptions', 'defaultOpenValue',
  'changeOnScroll', 'previewValue',
  'suffixIcon', 'prefix', 'classNames', 'styles',
  'cellRender', 'panelRender', 'presets', 'onPickerValueChange', 'onPanelChange',
  'disabledDate', 'onCalendarChange', 'onChange', 'onclick', 'onClick', 'onFocus', 'onBlur',
  'onKeyDown', 'allowClear', 'status', 'multiple'
]);

/** Общие native/input props без утечки time-only callbacks и renderers в DOM. */
export function timePickerSharedProps(props: TimePickerProps): DatePickerProps {
  // После удаления time-only полей оставшаяся часть имеет общий контракт DatePickerProps.
  const shared = Object.fromEntries(
    Object.entries(props).filter(([key]) => !timeOnly.has(key))
  ) as DatePickerProps;

  return {
    ...shared,
    showTime: true,
    allowClear: true,
    onfocus: props.onfocus ?? props.onFocus,
    onblur: props.onblur ?? props.onBlur,
    onkeydown: props.onkeydown ?? props.onKeyDown,
    renderExtraFooter: props.renderExtraFooter,
    onCalendarChange: (value, text) => {
      props.onCalendarChange?.(value, text, {});
    },
    onChange: (value, text) => props.onChange?.(value, value ? text : null)
  };
}
