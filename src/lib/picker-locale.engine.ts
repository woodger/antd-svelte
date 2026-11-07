// useLocale rc-picker 1.12.2; MIT, vendor/LICENSE.rc-picker.
import type { PickerLocale } from './picker-locale.types';

export function fillPickerLocale(locale: PickerLocale, timeFormat = 'HH:mm:ss'): PickerLocale {
  return {
    ...locale,
    fieldDateTimeFormat: locale.fieldDateTimeFormat || `YYYY-MM-DD ${timeFormat}`,
    fieldDateFormat: locale.fieldDateFormat || 'YYYY-MM-DD',
    fieldTimeFormat: locale.fieldTimeFormat || timeFormat,
    fieldMonthFormat: locale.fieldMonthFormat || 'YYYY-MM',
    fieldYearFormat: locale.fieldYearFormat || 'YYYY',
    fieldWeekFormat: locale.fieldWeekFormat || 'gggg-wo',
    fieldQuarterFormat: locale.fieldQuarterFormat || 'YYYY-[Q]Q',
    yearFormat: locale.yearFormat || 'YYYY',
    cellYearFormat: locale.cellYearFormat || 'YYYY',
    cellQuarterFormat: locale.cellQuarterFormat || '[Q]Q',
    cellDateFormat: locale.cellDateFormat || 'D'
  };
}
