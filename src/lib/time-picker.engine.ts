// TimePanelBody/useTimeInfo из rc-picker 1.12.2; MIT, vendor/LICENSE.rc-picker.
import type { Dayjs } from 'dayjs';
import type { DatePickerFormat, DatePickerTimeConfig } from './date-picker.types';
import type { TimePickerProps, TimePickerColumnType, TimePickerUnit } from './time-picker.types';
import { dayjsGenerateConfig as date } from './date-picker-dayjs.engine';
import { validPickerTime } from './date-picker.engine';
import { fillPickerLocale } from './picker-locale.engine';
import type { PickerLocale } from './picker-locale.types';

export interface TimePickerOption<Value extends number | 'am' | 'pm' = number | 'am' | 'pm'> {
  value: Value;
  label: string;
  disabled: boolean;
}

function fillShow(config: Pick<DatePickerTimeConfig,
  'showHour' | 'showMinute' | 'showSecond' | 'showMillisecond'>) {
  const explicit = [config.showHour, config.showMinute, config.showSecond, config.showMillisecond]
    .some(value => value !== undefined);
  const hasFalse = [config.showHour, config.showMinute, config.showSecond]
    .some(value => value === false);
  const hasTrue = [config.showHour, config.showMinute, config.showSecond]
    .some(value => value === true);
  const fallback = explicit ? hasFalse || !hasTrue : true;

  return {
    showHour: config.showHour ?? fallback,
    showMinute: config.showMinute ?? fallback,
    showSecond: config.showSecond ?? fallback,
    showMillisecond: config.showMillisecond
  };
}

function timeFormat(config: Pick<DatePickerTimeConfig,
  'showHour' | 'showMinute' | 'showSecond' | 'showMillisecond' | 'use12Hours'>) {
  const show = fillShow(config);
  const units = [
    show.showHour && (config.use12Hours ? 'hh' : 'HH'),
    show.showMinute && 'mm',
    show.showSecond && 'ss'
  ].filter(Boolean);

  return units.join(':') + (show.showMillisecond ? '.SSS' : '')
    + (config.use12Hours ? ' A' : '');
}

export function timePickerFormats(
  props: Pick<TimePickerProps, 'format' | 'use12Hours' | 'showHour' | 'showMinute'
    | 'showSecond' | 'showMillisecond'>,
  locale: NonNullable<TimePickerProps['locale']>['lang'] = {}
): DatePickerFormat[] {
  if (props.format) return Array.isArray(props.format) ? props.format : [props.format];

  return [locale.fieldTimeFormat || timeFormat(props)];
}

export function timePickerLang(props: TimePickerProps, locale: PickerLocale) {
  return fillPickerLocale(locale, timeFormat(props));
}

export function timePickerClock(
  props: TimePickerProps,
  locale: NonNullable<TimePickerProps['locale']>['lang'] = {}
): DatePickerTimeConfig {
  const format = timePickerFormats(props, locale)[0];
  const baseline = typeof format === 'string'
    ? format : locale.fieldTimeFormat || timeFormat(props);
  const explicit = [props.showHour, props.showMinute, props.showSecond, props.showMillisecond]
    .some(value => value !== undefined);
  const config = {
    ...props,
    format: typeof format === 'string' ? format : undefined,
    showHour: props.showHour ?? (!explicit && /[Hhk]|LT|LLL/.test(baseline)),
    showMinute: props.showMinute ?? (!explicit && /m|LT|LLL/.test(baseline)),
    showSecond: props.showSecond ?? (!explicit && /s|LTS/.test(baseline)),
    showMillisecond: props.showMillisecond ?? (!explicit && baseline.includes('SSS')),
    use12Hours: props.use12Hours ?? /[aA]|LT|LLL|LTS/.test(baseline)
  };

  // При явных show flags rc-picker заполняет незаданные units общим fallback.
  const show = fillShow(explicit ? props : config);

  if (!explicit && !show.showHour && !show.showMinute
    && !show.showSecond && !show.showMillisecond) {
    show.showHour = true;
    show.showMinute = true;
    show.showSecond = true;
  }

  return { ...config, ...show };
}

export function timePickerOptions(
  count: number,
  step = 1,
  disabled: readonly number[] = [],
  hideDisabled = false,
  pad = 2
): TimePickerOption<number>[] {
  const increment = step >= 1 ? step | 0 : 1;

  // Переполнение битового шага в upstream зацикливает for; не запускаем бесконечный цикл.
  if (increment <= 0) throw new RangeError('TimePicker step overflows a positive 32-bit integer');

  const options: TimePickerOption<number>[] = [];

  for (let value = 0; value < count; value += increment) {
    const unavailable = disabled.includes(value);

    if (!hideDisabled || !unavailable)
      options.push({ value, label: String(value).padStart(pad, '0'), disabled: unavailable });
  }

  return options;
}

export function timePickerPanel(
  value: Dayjs | null,
  pickerValue: Dayjs | null | undefined,
  config: DatePickerTimeConfig,
  disabledTime: TimePickerProps['disabledTime'],
  locale: NonNullable<TimePickerProps['locale']>['lang'],
  now: Dayjs
) {
  const dynamic = disabledTime?.(value || now) || {};
  const disabledHours = dynamic.disabledHours || config.disabledHours;
  const disabledMinutes = dynamic.disabledMinutes || config.disabledMinutes;
  const disabledSeconds = dynamic.disabledSeconds || config.disabledSeconds;
  const hours = timePickerOptions(
    24, config.hourStep, disabledHours?.(), config.hideDisabledOptions
  ).map(option => ({
      ...option,
      label: config.use12Hours
        ? String(Number(option.value) % 12 || 12).padStart(2, '0') : option.label
    }));
  const enabled = (options: TimePickerOption<number>[], current: number | undefined) =>
    current ?? options.find(option => !option.disabled)?.value;
  const hour = enabled(hours, value?.hour());
  const minutes = timePickerOptions(60, config.minuteStep, disabledMinutes?.(hour!),
    config.hideDisabledOptions);
  const minute = enabled(minutes, value?.minute());
  const seconds = timePickerOptions(60, config.secondStep, disabledSeconds?.(hour!, minute!),
    config.hideDisabledOptions);
  const second = enabled(seconds, value?.second());
  const milliseconds = timePickerOptions(1000, config.millisecondStep ?? 100,
    dynamic.disabledMilliseconds?.(hour!, minute!, second!), config.hideDisabledOptions, 3);
  const millisecond = enabled(milliseconds, value?.millisecond());
  const am = value ? value.hour() < 12 : true;
  const meridiem: TimePickerOption<'am' | 'pm'>[] = config.use12Hours ? [
    { value: 'am', label: locale.cellMeridiemFormat
      ? date.locale.format(locale.locale ?? 'en_US', now.hour(9), locale.cellMeridiemFormat) : 'AM',
    disabled: hours.every(option => option.disabled || Number(option.value) >= 12) },
    { value: 'pm', label: locale.cellMeridiemFormat
      ? date.locale.format(locale.locale ?? 'en_US', now.hour(15), locale.cellMeridiemFormat)
      : 'PM',
    disabled: hours.every(option => option.disabled || Number(option.value) < 12) }
  ] : [];
  let template = value || pickerValue || now;

  if (value || pickerValue) {
    const source = value || pickerValue!;
    template = template.hour(source.hour()).minute(source.minute())
      .second(source.second()).millisecond(source.millisecond());
  } else if (hour !== undefined) {
    template = template.hour(hour).minute(minute!).second(second!).millisecond(millisecond!);
  }

  return {
    template,
    align: (candidate: Dayjs) => validPickerTime(candidate, config, () => dynamic),
    columns: [
      { type: 'hour' as const, shown: config.showHour, options: config.use12Hours
        ? hours.filter(option => (Number(option.value) < 12) === am) : hours },
      { type: 'minute' as const, shown: config.showMinute, options: minutes },
      { type: 'second' as const, shown: config.showSecond, options: seconds },
      { type: 'millisecond' as const, shown: config.showMillisecond, options: milliseconds },
      { type: 'meridiem' as const, shown: config.use12Hours, options: meridiem }
    ].filter(column => column.shown)
  };
}

export function timePickerColumnValue(value: Dayjs | null | undefined, type: TimePickerColumnType) {
  if (!value) return null;
  return type === 'meridiem' ? value.hour() < 12 ? 'am' : 'pm' : value.get(type);
}

export function timePickerColumnDate(
  template: Dayjs,
  value: Dayjs | null,
  type: TimePickerColumnType,
  next: number | 'am' | 'pm'
): Dayjs {
  if (type !== 'meridiem') return template.set(type as TimePickerUnit, Number(next));

  // Как getMeridiemTime: null hour участвует в JS-сравнении как 0.
  const hour = value?.hour() ?? 0;

  if (next === 'am' && hour >= 12) return template.hour(hour - 12);
  if (next === 'pm' && hour < 12) return template.hour(hour + 12);
  return template;
}

export function timePickerValidTime(value: Dayjs, props: TimePickerProps) {
  return validPickerTime(value, { ...props, format: undefined }, props.disabledTime);
}

/** isSameTimestamp rc-picker сравнивает calendar/time fields без UTC-offset или valueOf(). */
export function timePickerSameValue(a: Dayjs | null, b: Dayjs | null) {
  if (!a || !b) return a === b;

  return a.year() === b.year() && a.month() === b.month() && a.date() === b.date()
    && a.hour() === b.hour() && a.minute() === b.minute() && a.second() === b.second()
    && a.millisecond() === b.millisecond();
}

export function timePickerDateDisabled(value: Dayjs, props: Pick<
  TimePickerProps,
  'disabledDate' | 'minDate' | 'maxDate'
>) {
  const sameTime = (other: Dayjs) => value.hour() === other.hour()
    && value.minute() === other.minute() && value.second() === other.second();

  return !!props.disabledDate?.(value, { type: 'time' })
    || !!(props.minDate && props.minDate.isAfter(value) && !sameTime(props.minDate))
    || !!(props.maxDate && value.isAfter(props.maxDate) && !sameTime(props.maxDate));
}
