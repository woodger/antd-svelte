// Calendar 6.6.8 / PickerPanel 1.12.2; MIT, vendor/LICENSE.ant-design и LICENSE.rc-picker.
import type { GenerateConfig } from './date-generate.types';
import type { CalendarLang, CalendarLocale, CalendarMode } from './calendar.types';
import { datePickerEnUS } from './date-picker.locale';

export function calendarSameYear<T>(a: T | undefined, b: T | undefined, date: GenerateConfig<T>) {
  return !!a && !!b && date.getYear(a) === date.getYear(b);
}

export function calendarSameMonth<T>(a: T | undefined, b: T | undefined, date: GenerateConfig<T>) {
  return calendarSameYear(a, b, date) && date.getMonth(a!) === date.getMonth(b!);
}

export function calendarSameDate<T>(a: T | undefined, b: T | undefined, date: GenerateConfig<T>) {
  return calendarSameMonth(a, b, date) && date.getDate(a!) === date.getDate(b!);
}

export function calendarLocale(context?: CalendarLocale, local?: CalendarLocale) {
  return {
    ...datePickerEnUS,
    ...context,
    ...local,
    lang: { ...datePickerEnUS.lang, ...context?.lang, ...local?.lang } as CalendarLang,
    timePickerLocale: {
      ...datePickerEnUS.timePickerLocale,
      ...context?.timePickerLocale,
      ...local?.timePickerLocale
    }
  };
}

export function calendarFilledLocale(locale: CalendarLang): CalendarLang {
  return {
    ...locale,
    fieldDateTimeFormat: locale.fieldDateTimeFormat || 'YYYY-MM-DD HH:mm:ss',
    fieldDateFormat: locale.fieldDateFormat || 'YYYY-MM-DD',
    fieldTimeFormat: locale.fieldTimeFormat || 'HH:mm:ss',
    fieldMonthFormat: locale.fieldMonthFormat || 'YYYY-MM',
    fieldYearFormat: locale.fieldYearFormat || 'YYYY',
    fieldWeekFormat: locale.fieldWeekFormat || 'gggg-wo',
    fieldQuarterFormat: locale.fieldQuarterFormat || 'YYYY-[Q]Q',
    yearFormat: locale.yearFormat || 'YYYY',
    cellYearFormat: locale.cellYearFormat || 'YYYY',
    cellQuarterFormat: locale.cellQuarterFormat || '[Q]Q',
    cellDateFormat: locale.cellDateFormat || locale.dayFormat || 'D'
  };
}

export function calendarYearOptions<T>(
  value: T,
  range: [T, T] | undefined,
  locale: CalendarLang,
  date: GenerateConfig<T>
) {
  const year = date.getYear(value);
  const start = range ? date.getYear(range[0]) : year - 10;
  const end = range ? date.getYear(range[1]) + 1 : start + 20;
  const options: { value: number; label: string; }[] = [];

  for (let index = start; index < end; index++)
    options.push({ value: index, label: `${index}${locale.year === '年' ? '年' : ''}` });

  return options;
}

export function calendarMonthOptions<T>(
  value: T,
  range: [T, T] | undefined,
  locale: CalendarLang,
  date: GenerateConfig<T>
) {
  const year = date.getYear(value);
  const start = range && date.getYear(range[0]) === year ? date.getMonth(range[0]) : 0;
  const end = range && date.getYear(range[1]) === year ? date.getMonth(range[1]) : 11;
  const months = locale.shortMonths || date.locale.getShortMonths?.(locale.locale) || [];
  const options: { value: number; label: string; }[] = [];

  for (let index = start; index <= end; index++)
    options.push({ value: index, label: months[index] });

  return options;
}

export function calendarSetYear<T>(
  value: T,
  year: number,
  range: [T, T] | undefined,
  date: GenerateConfig<T>
) {
  let next = date.setYear(value, year);

  if (range) {
    const [start, end] = range;
    const nextYear = date.getYear(next);
    const nextMonth = date.getMonth(next);

    if (nextYear === date.getYear(end) && nextMonth > date.getMonth(end))
      next = date.setMonth(next, date.getMonth(end));

    if (nextYear === date.getYear(start) && nextMonth < date.getMonth(start))
      next = date.setMonth(next, date.getMonth(start));
  }

  return next;
}

export function calendarDateDisabled<T>(
  value: T,
  range: [T, T] | undefined,
  disabledDate: ((value: T) => boolean) | undefined,
  date: GenerateConfig<T>
): boolean {
  return !!(range && (date.isAfter(range[0], value) || date.isAfter(value, range[1])))
    || !!disabledDate?.(value);
}

export function calendarMonthDisabled<T>(
  value: T,
  range: [T, T] | undefined,
  disabledDate: ((value: T) => boolean) | undefined,
  date: GenerateConfig<T>
): boolean {
  const start = date.setDate(value, 1);
  const next = date.setMonth(start, date.getMonth(start) + 1);
  const end = date.addDate(next, -1);

  return calendarDateDisabled(start, range, disabledDate, date)
    && calendarDateDisabled(end, range, disabledDate, date);
}

export function calendarRows<T>(
  value: T,
  mode: CalendarMode,
  locale: string,
  date: GenerateConfig<T>
): T[][] {
  if (mode === 'year') {
    const base = date.setMonth(value, 0);

    return Array.from({ length: 4 }, (_, row) =>
      Array.from({ length: 3 }, (_, col) => date.addMonth(base, row * 3 + col))
    );
  }

  const first = date.setDate(value, 1);
  const weekFirstDay = date.locale.getWeekFirstDay(locale);
  const startWeekDay = date.getWeekDay(first);
  let base = date.addDate(first, weekFirstDay - startWeekDay);

  if (date.getMonth(base) === date.getMonth(value) && date.getDate(base) > 1)
    base = date.addDate(base, -7);

  return Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => date.addDate(base, row * 7 + col))
  );
}
