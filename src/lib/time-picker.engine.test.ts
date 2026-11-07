import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { describe, expect, it } from 'vitest';
import { datePickerEnUS, datePickerRuRU } from './date-picker.locale';
import {
  timePickerFormats,
  timePickerClock,
  timePickerPanel,
  timePickerColumnDate,
  timePickerColumnValue,
  timePickerDateDisabled,
  timePickerOptions,
  timePickerSameValue,
  timePickerLang
} from './time-picker.engine';
import { timePickerSharedProps } from './time-picker-props.engine';
import { timePickerSemantic } from './time-picker-semantic.engine';

dayjs.extend(utc);

describe('TimePicker formatting and units', () => {
  it('defaults input formats from the time locale and visible units', () => {
    expect(timePickerFormats({})).toEqual(['HH:mm:ss']);
    expect(timePickerFormats({ use12Hours: true })).toEqual(['hh:mm:ss A']);
    expect(timePickerFormats({ showSecond: false })).toEqual(['HH:mm']);
    expect(timePickerFormats({ showHour: true })).toEqual(['HH']);
    expect(timePickerFormats({ showMillisecond: true })).toEqual(['HH:mm:ss.SSS']);
    expect(timePickerFormats({ use12Hours: true }, { fieldTimeFormat: 'HH:mm' }))
      .toEqual(['HH:mm']);
    expect(timePickerFormats({ format: ['HH:mm', 'H:m'] })).toEqual(['HH:mm', 'H:m']);
  });

  it('infers time columns from format while explicit flags retain source fallback rules', () => {
    const short = timePickerClock({ format: 'HH:mm' });
    const explicit = timePickerClock({ format: 'HH:mm', showSecond: false });
    const literal = timePickerClock({ format: 'YYYY' });

    expect([short.showHour, short.showMinute, short.showSecond, short.showMillisecond])
      .toEqual([true, true, false, false]);
    expect([explicit.showHour, explicit.showMinute, explicit.showSecond]).toEqual([true, true, false]);
    expect([literal.showHour, literal.showMinute, literal.showSecond]).toEqual([true, true, true]);
    expect(timePickerClock({ format: 'h:mm a' }).use12Hours).toBe(true);
    expect(timePickerClock({ format: 'h:mm a', use12Hours: false }).use12Hours).toBe(false);
    expect(timePickerClock({ showHour: true }).showMinute).toBe(false);
  });

  it('keeps filled locale defaults separate from the explicit input format', () => {
    const locale = timePickerLang({ format: 'HH:mm', use12Hours: true }, datePickerEnUS.lang);

    expect(locale.fieldTimeFormat).toBe('hh:mm:ss A');
    expect(locale.fieldDateTimeFormat).toBe('YYYY-MM-DD hh:mm:ss A');
    expect(locale.fieldMonthFormat).toBe('YYYY-MM');
    expect(locale.cellDateFormat).toBe('D');
    expect(timePickerFormats({ format: 'HH:mm', use12Hours: true }, locale)).toEqual(['HH:mm']);
  });

  it('uses source bitwise step truncation, labels and disabled-option filtering', () => {
    expect(timePickerOptions(6, 2.9, [2])).toEqual([
      { value: 0, label: '00', disabled: false },
      { value: 2, label: '02', disabled: true },
      { value: 4, label: '04', disabled: false }
    ]);
    expect(timePickerOptions(6, 2, [2], true)).toEqual([
      { value: 0, label: '00', disabled: false },
      { value: 4, label: '04', disabled: false }
    ]);
    expect(timePickerOptions(1000, 500, [], false, 3).map(option => option.label))
      .toEqual(['000', '500']);
    expect(timePickerOptions(2, -1).map(option => option.value)).toEqual([0, 1]);
    expect(() => timePickerOptions(24, 2 ** 32)).toThrow(RangeError);
  });

  it('leaves an empty value unselected and uses optional picker time as the change template', () => {
    const now = dayjs.utc('2024-09-15T12:34:56.789Z');
    const panel = timePickerPanel(null, now.startOf('day'), timePickerClock({}), undefined,
      datePickerEnUS.lang, now);

    expect(timePickerColumnValue(null, 'hour')).toBeNull();
    expect(panel.template.toISOString()).toBe('2024-09-15T00:00:00.000Z');
    expect(timePickerColumnDate(panel.template, null, 'hour', 1).toISOString())
      .toBe('2024-09-15T01:00:00.000Z');
  });

  it('finds first enabled dependent units when neither value nor pickerValue exists', () => {
    const now = dayjs.utc('2024-09-15T12:34:56.789Z');
    const panel = timePickerPanel(null, null, timePickerClock({ minuteStep: 15 }), () => ({
      disabledHours: () => [0, 1],
      disabledMinutes: hour => hour === 2 ? [0] : [],
      disabledSeconds: (_hour, minute) => minute === 15 ? [0] : []
    }), datePickerEnUS.lang, now);

    expect(panel.template.toISOString()).toBe('2024-09-15T02:15:01.000Z');
  });

  it('aligns all units with restrictions evaluated from the current panel value', () => {
    const value = dayjs.utc('2024-09-15T10:23:44.567Z');
    const observed: string[] = [];
    const panel = timePickerPanel(value, null, timePickerClock({
      minuteStep: 15, secondStep: 10
    }), base => {
      observed.push(base.toISOString());
      return { disabledHours: () => base.hour() === 10 ? [9] : [] };
    }, datePickerEnUS.lang, value);

    const next = panel.align(timePickerColumnDate(panel.template, value, 'hour', 9));

    expect(observed).toEqual(['2024-09-15T10:23:44.567Z']);
    expect(next.toISOString()).toBe('2024-09-15T08:15:40.500Z');
    expect(next.isUTC()).toBe(true);
    expect(value.toISOString()).toBe('2024-09-15T10:23:44.567Z');
  });

  it('filters 12-hour values and disables a meridiem with no enabled hours', () => {
    const value = dayjs.utc('2024-09-15T15:34:56.789Z');
    const panel = timePickerPanel(value, null, timePickerClock({ use12Hours: true }), () => ({
      disabledHours: () => Array.from({ length: 12 }, (_, hour) => hour)
    }), datePickerEnUS.lang, value);
    const hours = panel.columns.find(column => column.type === 'hour')!;
    const meridiem = panel.columns.find(column => column.type === 'meridiem')!;

    expect(hours.options).toHaveLength(12);
    expect(hours.options[0]).toEqual({ value: 12, label: '12', disabled: false });
    expect(hours.options[3]).toEqual({ value: 15, label: '03', disabled: false });
    expect(meridiem.options).toEqual([
      { value: 'am', label: 'AM', disabled: true },
      { value: 'pm', label: 'PM', disabled: false }
    ]);
    expect(timePickerColumnDate(panel.template, value, 'meridiem', 'am').toISOString())
      .toBe('2024-09-15T03:34:56.789Z');
  });

  it('formats localized meridiem labels and retains the empty-hour PM behavior', () => {
    const now = dayjs.utc('2024-09-15T19:34:56.789Z');
    const panel = timePickerPanel(null, now, timePickerClock({ use12Hours: true }), undefined,
      datePickerRuRU.lang, now);
    const meridiem = panel.columns.find(column => column.type === 'meridiem')!;

    expect(meridiem.options.map(option => option.label)).toEqual(['утра', 'дня']);
    expect(timePickerColumnDate(panel.template, null, 'meridiem', 'pm').toISOString())
      .toBe('2024-09-15T12:34:56.789Z');
  });

  it('compares source calendar fields independently of the timestamp offset', () => {
    const a = dayjs.utc('2024-09-15T10:00:00.123Z');
    const sameWall = a.utcOffset(60, true);
    const sameInstant = a.utcOffset(60);

    expect(timePickerSameValue(a, sameWall)).toBe(true);
    expect(timePickerSameValue(a, sameInstant)).toBe(false);
    expect(timePickerSameValue(a, a.millisecond(124))).toBe(false);
    expect(timePickerSameValue(null, null)).toBe(true);
  });

  it('applies time boundary equality to hours/minutes/seconds without comparing the date or milliseconds', () => {
    const value = dayjs.utc('2024-09-15T10:00:00.123Z');

    expect(timePickerDateDisabled(value, { minDate: value.add(1, 'year') })).toBe(false);
    expect(timePickerDateDisabled(value, { minDate: value.millisecond(900) })).toBe(false);
    expect(timePickerDateDisabled(value, { minDate: value.add(1, 'second') })).toBe(true);
    expect(timePickerDateDisabled(value, { disabledDate: () => true })).toBe(true);
  });
});

describe('TimePicker common props and semantic styles', () => {
  it('keeps native fields while adapting clear callback payloads and stripping time-only DOM props', () => {
    const events: unknown[] = [];
    const shared = timePickerSharedProps({
      name: 'time', required: true, minuteStep: 15, previewValue: false,
      onChange: (value, text) => events.push(['change', value, text]),
      onCalendarChange: (value, text, info) => events.push(['calendar', value, text, info])
    });

    shared.onCalendarChange?.(null, '', { source: 'time' });
    shared.onChange?.(null, '');

    expect(shared).toMatchObject({ name: 'time', required: true, showTime: true });
    expect(shared).not.toHaveProperty('minuteStep');
    expect(shared).not.toHaveProperty('previewValue');
    expect(events).toEqual([['calendar', null, '', {}], ['change', null, null]]);
  });

  it('preserves both upstream semantic layers and root style priority', () => {
    const result = timePickerSemantic({
      classNames: ({ props }) => ({ root: props.size === undefined ? 'raw-size' : 'wrong',
        popup: { root: 'local-popup' } }),
      styles: { root: 'outline-offset:6px', popup: { root: 'outline-offset:8px' } }
    }, {
      classNames: ({ props }) => ({ root: props.size ? 'inner-context' : 'outer-context' }),
      style: 'outline-offset:4px', styles: { root: 'outline-offset:2px' }
    }, { size: 'small', disabled: false, variant: 'filled' });

    expect(result.classes.root).toBe('inner-context outer-context raw-size');
    expect(result.classes.popup.root).toBe('local-popup');
    expect(result.styles.root?.endsWith('outline-offset:4px;outline-offset:6px')).toBe(true);
    expect(result.styles.popup.root).toBe('outline-offset:8px');
  });
});
