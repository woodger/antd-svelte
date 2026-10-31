import type { datePickerEnUS } from './date-picker.locale';

/** Язык rc-picker; загружать Day.js locale, кроме встроенных en/ru, должен потребитель. */
export type PickerLocale = Partial<typeof datePickerEnUS.lang> & {
  locale: string;
  shortWeekDays?: string[];
  shortMonths?: string[];
  monthFormat?: string;
  fieldDateTimeFormat?: string;
  fieldDateFormat?: string;
  fieldTimeFormat?: string;
  fieldMonthFormat?: string;
  fieldYearFormat?: string;
  fieldWeekFormat?: string;
  fieldQuarterFormat?: string;
  cellYearFormat?: string;
  cellQuarterFormat?: string;
  cellDateFormat?: string;
};
