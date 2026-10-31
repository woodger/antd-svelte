import type { CalendarGenerateConfig } from 'antd-svelte';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const copy = (value: Date) => new Date(value.getTime());

function setDate(value: Date, day: number) {
  const next = copy(value);
  next.setUTCDate(day);
  return next;
}

function setMonth(value: Date, month: number) {
  const next = setDate(value, 1);
  next.setUTCMonth(month);
  const last = copy(next);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  next.setUTCDate(Math.min(value.getUTCDate(), last.getUTCDate()));
  return next;
}

function setYear(value: Date, year: number) {
  const next = setDate(value, 1);
  next.setUTCFullYear(year);
  next.setUTCDate(Math.min(value.getUTCDate(),
    setDate(setMonth(next, next.getUTCMonth() + 1), 0).getUTCDate()));
  return next;
}

function addDate(value: Date, days: number) {
  return setDate(value, value.getUTCDate() + days);
}

function startOfWeek(locale: string, value: Date) {
  const first = locale === 'ru_RU' ? 1 : 0;
  return addDate(value, -((value.getUTCDay() - first + 7) % 7));
}

/** Собственный UTC Date adapter потребителя проверяет независимость generateCalendar от Day.js. */
export const calendarDateAdapter: CalendarGenerateConfig<Date> = {
  getNow: () => new Date('2024-02-29T12:34:56.789Z'),
  getFixedDate: value => new Date(`${value}T00:00:00Z`),
  getEndDate: value => setDate(setMonth(setDate(value, 1), value.getUTCMonth() + 1), 0),
  getWeekDay: value => value.getUTCDay(),
  getMillisecond: value => value.getUTCMilliseconds(),
  getSecond: value => value.getUTCSeconds(),
  getMinute: value => value.getUTCMinutes(),
  getHour: value => value.getUTCHours(),
  getDate: value => value.getUTCDate(),
  getMonth: value => value.getUTCMonth(),
  getYear: value => value.getUTCFullYear(),
  addYear: (value, years) => setYear(value, value.getUTCFullYear() + years),
  addMonth: (value, months) => setMonth(value, value.getUTCMonth() + months),
  addDate,
  setYear,
  setMonth,
  setDate,
  setHour: (value, hour) => {
    const next = copy(value);
    next.setUTCHours(hour);
    return next;
  },
  setMinute: (value, minute) => {
    const next = copy(value);
    next.setUTCMinutes(minute);
    return next;
  },
  setSecond: (value, second) => {
    const next = copy(value);
    next.setUTCSeconds(second);
    return next;
  },
  setMillisecond: (value, millisecond) => {
    const next = copy(value);
    next.setUTCMilliseconds(millisecond);
    return next;
  },
  isAfter: (a, b) => a.getTime() > b.getTime(),
  isValidate: value => Number.isFinite(value.getTime()),
  locale: {
    getWeekFirstDay: locale => locale === 'ru_RU' ? 1 : 0,
    getWeekFirstDate: startOfWeek,
    getWeek: (locale, value) => Math.floor(
      (startOfWeek(locale, value).getTime()
        - startOfWeek(locale, new Date(`${value.getUTCFullYear()}-01-01T00:00:00Z`)).getTime())
        / 604800000
    ) + 1,
    getShortWeekDays: () => weekdays,
    getShortMonths: () => months,
    format: (_locale, value, format) => format.replace(/YYYY|MMM|MM|DD|D/g, part => {
      if (part === 'YYYY') return String(value.getUTCFullYear());
      if (part === 'MMM') return months[value.getUTCMonth()];
      if (part === 'MM') return String(value.getUTCMonth() + 1).padStart(2, '0');
      if (part === 'DD') return String(value.getUTCDate()).padStart(2, '0');
      return String(value.getUTCDate());
    }),
    parse: (_locale, value) => {
      const next = new Date(value);
      return Number.isFinite(next.getTime()) ? next : null;
    }
  }
};
