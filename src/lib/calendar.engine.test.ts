import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { describe, expect, it } from 'vitest';
import { dayjsGenerateConfig as date } from './date-picker-dayjs.engine';
import { datePickerRuRU } from './date-picker.locale';
import {
  calendarDateDisabled,
  calendarFilledLocale,
  calendarLocale,
  calendarMonthDisabled,
  calendarMonthOptions,
  calendarRows,
  calendarSameDate,
  calendarSameMonth,
  calendarSameYear,
  calendarSetYear,
  calendarYearOptions
} from './calendar.engine';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('Calendar date engine', () => {
  it('starts the six date rows on the locale week boundary without an extra aligned week', () => {
    const value = dayjs.utc('2024-09-15T12:34:56.789Z');

    const english = calendarRows(value, 'month', 'en_US', date);
    const russian = calendarRows(value, 'month', 'ru_RU', date);

    expect(english).toHaveLength(6);
    expect(english.every(row => row.length === 7)).toBe(true);
    expect(english[0][0].toISOString()).toBe('2024-09-01T12:34:56.789Z');
    expect(english[5][6].toISOString()).toBe('2024-10-12T12:34:56.789Z');
    expect(russian[0][0].toISOString()).toBe('2024-08-26T12:34:56.789Z');
    expect(russian[5][6].toISOString()).toBe('2024-10-06T12:34:56.789Z');
    expect(english.flat().every(value => value.isUTC())).toBe(true);
  });

  it('keeps leap-day and year-crossing date cells at the source time', () => {
    const rows = calendarRows(dayjs.utc('2024-02-29T23:59:59.999Z'), 'month', 'ru_RU', date);
    const yearRows = calendarRows(dayjs.utc('2024-12-31T23:59:59.999Z'), 'month', 'en_US', date);

    expect(rows[4][3].toISOString()).toBe('2024-02-29T23:59:59.999Z');
    expect(yearRows[5][6].toISOString()).toBe('2025-01-11T23:59:59.999Z');
  });

  it('builds four rows of months independently from January and clamps month ends', () => {
    const rows = calendarRows(dayjs.utc('2024-12-31T23:45:12.345Z'), 'year', 'en_US', date);

    expect(rows).toHaveLength(4);
    expect(rows.every(row => row.length === 3)).toBe(true);
    expect(rows[0][0].toISOString()).toBe('2024-01-31T23:45:12.345Z');
    expect(rows[0][1].toISOString()).toBe('2024-02-29T23:45:12.345Z');
    expect(rows[0][2].toISOString()).toBe('2024-03-31T23:45:12.345Z');
    expect(rows[3][2].toISOString()).toBe('2024-12-31T23:45:12.345Z');
  });

  it('compares calendar dates independently of time and handles an absent selection', () => {
    const early = dayjs.utc('2024-02-29T01:00:00.000Z');
    const late = dayjs.utc('2024-02-29T23:59:59.999Z');

    expect(calendarSameDate(early, late, date)).toBe(true);
    expect(calendarSameDate(early, early.add(1, 'day'), date)).toBe(false);
    expect(calendarSameMonth(early, early.date(1), date)).toBe(true);
    expect(calendarSameMonth(early, early.add(1, 'month'), date)).toBe(false);
    expect(calendarSameYear(early, early.month(11), date)).toBe(true);
    expect(calendarSameYear(early, early.add(1, 'year'), date)).toBe(false);
    expect(calendarSameDate(undefined, early, date)).toBe(false);
    expect(calendarSameMonth(early, undefined, date)).toBe(false);
  });

  it('preserves the supplied timezone offset and time through calendar arithmetic', () => {
    const value = dayjs.tz('2024-03-31T12:34:56.789', 'Europe/Berlin');

    const rows = calendarRows(value, 'year', 'en_US', date);
    const next = calendarSetYear(value, 2025, undefined, date);

    expect(rows[0][1].format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
      .toBe('2024-02-29T12:34:56.789+02:00');
    expect(next.format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toBe('2025-03-31T12:34:56.789+02:00');
    expect(value.format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toBe('2024-03-31T12:34:56.789+02:00');
  });

  it('restricts dates by inclusive timestamps and short-circuits the user predicate outside range', () => {
    const start = dayjs.utc('2024-02-15T12:34:56.789Z');
    const end = start.add(10, 'day');
    const queried: string[] = [];
    const disabledDate = (value: dayjs.Dayjs) => {
      queried.push(value.toISOString());
      return value.date() === 20;
    };

    expect(calendarDateDisabled(start.subtract(1, 'millisecond'), [start, end], disabledDate, date))
      .toBe(true);
    expect(calendarDateDisabled(start, [start, end], disabledDate, date)).toBe(false);
    expect(calendarDateDisabled(start.date(20), [start, end], disabledDate, date)).toBe(true);
    expect(calendarDateDisabled(end, [start, end], disabledDate, date)).toBe(false);
    expect(calendarDateDisabled(end.add(1, 'millisecond'), [start, end], disabledDate, date))
      .toBe(true);
    expect(queried).toEqual([
      '2024-02-15T12:34:56.789Z',
      '2024-02-20T12:34:56.789Z',
      '2024-02-25T12:34:56.789Z'
    ]);
  });

  it('checks only month endpoints and retains their time when deciding disabled months', () => {
    const value = dayjs.utc('2024-02-15T12:34:56.789Z');
    const queried: string[] = [];
    const disabledDate = (value: dayjs.Dayjs) => {
      queried.push(value.toISOString());
      return value.date() === 1;
    };

    expect(calendarMonthDisabled(value, undefined, disabledDate, date)).toBe(false);
    expect(queried).toEqual(['2024-02-01T12:34:56.789Z', '2024-02-29T12:34:56.789Z']);
    expect(calendarMonthDisabled(value, [value.date(2), value.date(28)], undefined, date))
      .toBe(true);
    expect(calendarMonthDisabled(value, [value.date(1), value.date(28)], undefined, date))
      .toBe(false);
  });

  it('stops checking a month when its first day is enabled', () => {
    const value = dayjs('2024-02-20');
    const queried: number[] = [];

    const disabled = calendarMonthDisabled(value, undefined, value => {
      queried.push(value.date());
      return false;
    }, date);

    expect(disabled).toBe(false);
    expect(queried).toEqual([1]);
  });

  it('offers twenty relative years or the inclusive range with only the source Chinese suffix', () => {
    const value = dayjs('2024-09-15');
    const locale = calendarLocale().lang;

    const options = calendarYearOptions(value, undefined, locale, date);
    const limited = calendarYearOptions(value, [dayjs('2018-02-02'), dayjs('2020-05-18')], {
      ...locale, year: '年'
    }, date);

    expect(options).toHaveLength(20);
    expect(options[0]).toEqual({ value: 2014, label: '2014' });
    expect(options[19]).toEqual({ value: 2033, label: '2033' });
    expect(limited).toEqual([
      { value: 2018, label: '2018年' },
      { value: 2019, label: '2019年' },
      { value: 2020, label: '2020年' }
    ]);
  });

  it('offers only boundary months while preserving their original zero-based values', () => {
    const range: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs('2017-02-02'), dayjs('2018-05-18')];
    const locale = calendarLocale(datePickerRuRU).lang;

    const first = calendarMonthOptions(dayjs('2017-10-01'), range, locale, date);
    const last = calendarMonthOptions(dayjs('2018-02-01'), range, locale, date);

    expect(first).toHaveLength(11);
    expect(first[0]).toEqual({ value: 1, label: 'Фев' });
    expect(first[10]).toEqual({ value: 11, label: 'Дек' });
    expect(last).toHaveLength(5);
    expect(last[0]).toEqual({ value: 0, label: 'Янв' });
    expect(last[4]).toEqual({ value: 4, label: 'Май' });
  });

  it('clamps the header year to boundary months without clamping its day or precision', () => {
    const value = dayjs.utc('2018-12-31T12:34:56.789Z');
    const range: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs.utc('2018-11-10'), dayjs.utc('2019-03-10')];

    const next = calendarSetYear(value, 2019, range, date);

    expect(next.toISOString()).toBe('2019-03-31T12:34:56.789Z');
    expect(next.isUTC()).toBe(true);
    expect(calendarDateDisabled(next, range, undefined, date)).toBe(true);
    expect(value.toISOString()).toBe('2018-12-31T12:34:56.789Z');
  });

  it('preserves source clamp ordering for an inverted range in the same year', () => {
    const range: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs('2019-11-01'), dayjs('2019-03-01')];

    expect(calendarSetYear(dayjs('1990-01-03'), 2019, range, date).format('YYYY-MM-DD'))
      .toBe('2019-11-03');
    expect(calendarSetYear(dayjs('1990-12-03'), 2019, range, date).format('YYYY-MM-DD'))
      .toBe('2019-03-03');
    expect(calendarYearOptions(dayjs('2024-01-01'), [range[0], dayjs('2018-01-01')], {
      locale: 'en_US'
    }, date)).toEqual([]);
  });

  it('deep-merges a partial locale without sharing Calendar settings with DatePicker', () => {
    const context = { lang: { locale: 'ru_RU', month: 'Контекст', shortMonths: ['A', 'B'] } };
    const local = { lang: { year: 'Локальный год', shortWeekDays: ['S', 'M'] } };

    const locale = calendarLocale(context, local);

    expect(locale.lang.locale).toBe('ru_RU');
    expect(locale.lang.month).toBe('Контекст');
    expect(locale.lang.year).toBe('Локальный год');
    expect(locale.lang.shortMonths).toEqual(['A', 'B']);
    expect(locale.lang.shortWeekDays).toEqual(['S', 'M']);
    expect(locale.lang.today).toBe('Today');
    expect(context.lang).not.toHaveProperty('year');
  });

  it('fills panel formats while leaving the raw month render locale intact', () => {
    const raw = calendarLocale(undefined, { lang: { cellDateFormat: 'DD', fieldMonthFormat: '' } }).lang;

    const filled = calendarFilledLocale(raw);

    expect(filled.cellDateFormat).toBe('DD');
    expect(filled.fieldMonthFormat).toBe('YYYY-MM');
    expect(filled.fieldDateTimeFormat).toBe('YYYY-MM-DD HH:mm:ss');
    expect(filled.fieldTimeFormat).toBe('HH:mm:ss');
    expect(filled.fieldWeekFormat).toBe('gggg-wo');
    expect(raw.cellDateFormat).toBe('DD');
    expect(raw.fieldMonthFormat).toBe('');
  });
});
