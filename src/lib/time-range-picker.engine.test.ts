import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { describe, expect, it } from 'vitest';
import { datePickerEnUS } from './date-picker.locale';
import {
  sameTimeRange, timeRangeClock, timeRangeInvalid, validTimeRange
} from './time-range-picker.engine';
import { timeRangeSemantic } from './time-range-picker-semantic.engine';
import type { RangePickerValue } from './range-picker.types';

dayjs.extend(utc);
const start = dayjs.utc('2024-09-15T10:23:44.567Z');
const end = dayjs.utc('2024-09-15T17:45:56.789Z');

describe('TimeRangePicker values and validation', () => {
  it('compares wall-clock calendar fields and milliseconds without timestamp offset conversion', () => {
    expect(sameTimeRange([start, end], [start.utcOffset(60, true), end.utcOffset(60, true)]))
      .toBe(true);
    expect(sameTimeRange([start, end], [start.utcOffset(60), end])).toBe(false);
    expect(sameTimeRange([start, end], [start, end.millisecond(788)])).toBe(false);
    expect(sameTimeRange([null, end], [null, end])).toBe(true);
  });

  it('keeps per-field defaultOpenValue and does not duplicate a single default into end', () => {
    expect(timeRangeClock({ defaultOpenValue: [start, end] }, datePickerEnUS.lang, 1)
      .defaultOpenValue).toBe(end);
    expect(timeRangeClock({ defaultOpenValue: start }, datePickerEnUS.lang, 0)
      .defaultOpenValue).toBe(start);
    expect(timeRangeClock({ defaultOpenValue: start }, datePickerEnUS.lang, 1)
      .defaultOpenValue).toBeUndefined();
    expect(timeRangeClock({ format: 'HH:mm', minuteStep: 15 }, datePickerEnUS.lang, 0))
      .toMatchObject({ showHour: true, showMinute: true, showSecond: false, minuteStep: 15 });
  });

  it('distinguishes same-day reverse time from equal HMS values on different dates', () => {
    expect(validTimeRange([end, start], [false, false], true, [true, false], () => false))
      .toBe(false);
    expect(validTimeRange([end, end.subtract(1, 'day')],
      [false, false], true, [true, false], () => false)).toBe(true);
    expect(validTimeRange([end, start], [false, false], false, [false, false], () => false))
      .toBe(true);
  });

  it('validates open boundaries and skips disabled dates without bypassing required emptiness', () => {
    expect(validTimeRange([null, end], [true, false], true, [false, false], () => false))
      .toBe(true);
    expect(validTimeRange([null, end], [false, false], true, [true, false], () => false))
      .toBe(false);
    expect(validTimeRange([start, end], [false, false], true, [true, false],
      (_date, index) => index === 0)).toBe(true);
  });

  it('passes from only to final end validation and preserves null for an allowed empty start', () => {
    const seen: unknown[] = [];
    const invalid = (_date: dayjs.Dayjs, index: number, info?: { from?: dayjs.Dayjs | null; }) => {
      seen.push([index, info]);
      return false;
    };

    validTimeRange([start, end], [false, false], true, [false, false], invalid);
    validTimeRange([null, end], [true, false], true, [false, false], invalid);

    expect(seen).toEqual([[0, undefined], [1, { from: start }], [1, { from: null }]]);
  });

  it('separates display restrictions from final from-dependent invalidation', () => {
    const calls: unknown[] = [];
    const props = { disabledTime: (
      _date: dayjs.Dayjs,
      part: 'start' | 'end',
      info: { from?: dayjs.Dayjs | null; }
    ) => {
      calls.push([part, info]);
      return { disabledMinutes: () => info.from ? [45] : [] };
    } };

    expect(timeRangeInvalid(end, props, {}, 1)).toBe(false);
    expect(timeRangeInvalid(end, props, {}, 1, { from: start })).toBe(true);
    expect(calls).toEqual([['end', { from: undefined }], ['end', { from: start }]]);
  });

  it('keeps time boundary equality independent of dates and applies disabledTime', () => {
    expect(timeRangeInvalid(start, { minDate: start.add(1, 'year') }, {}, 0)).toBe(false);
    expect(timeRangeInvalid(start, { disabledTime: () => ({ disabledHours: () => [10] }) },
      {}, 0)).toBe(true);
    expect(timeRangeInvalid(start, { disabledTime: () => ({ disabledHours: () => [] }) },
      {}, 0)).toBe(false);
  });
});

describe('TimeRangePicker semantic config', () => {
  it('uses one time semantic layer and range plain style with raw variant and resolved size', () => {
    const value: RangePickerValue = [start, end];
    const result = timeRangeSemantic({
      value,
      classNames: ({ props }) => ({ root: props.size === 'small'
        && props.variant === undefined && props.disabled === true ? 'source-props' : 'wrong' }),
      styles: { root: 'outline-offset:6px', popup: { root: 'outline-offset:5px' } }
    }, {
      classNames: ({ props }) => ({ root: Array.isArray(props.value) ? 'range-context' : 'wrong' }),
      style: 'outline-offset:88px', styles: { root: 'outline-offset:2px' }
    }, { style: 'outline-offset:4px' }, { size: 'small', disabled: true });

    expect(result.classes.root).toBe('range-context source-props');
    expect(result.styles.root).toBe('outline-offset:2px;outline-offset:4px;outline-offset:6px');
    expect(result.styles.popup.root).toBe('outline-offset:5px');
  });
});
