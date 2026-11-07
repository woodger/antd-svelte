import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { datePickerClock } from './time-picker.engine';
import type { DatePickerProps } from './date-picker.types';

describe('datetime time configuration', () => {
  const cases: {
    name: string;
    props: Pick<DatePickerProps, 'format' | 'showTime'>;
    flags: boolean[];
    format: string;
  }[] = [
    { name: 'date-only input', props: { format: 'YYYY-MM-DD', showTime: true },
      flags: [true, true, true, false, false], format: 'HH:mm:ss' },
    { name: 'input minutes', props: { format: 'YYYY-MM-DD HH:mm', showTime: true },
      flags: [true, true, false, false, false], format: 'HH:mm' },
    { name: 'panel minutes', props: { showTime: { format: 'HH:mm' } },
      flags: [true, true, false, false, false], format: 'HH:mm' },
    { name: 'panel precedence', props: { format: 'YYYY-MM-DD HH:mm:ss',
      showTime: { format: 'hh:mm A' } },
      flags: [true, true, false, false, true], format: 'hh:mm A' },
    { name: 'inferred meridiem', props: { format: 'YYYY-MM-DD hh:mm A', showTime: true },
      flags: [true, true, false, false, true], format: 'hh:mm A' },
    { name: 'explicit hour', props: { showTime: { showHour: true } },
      flags: [true, false, false, false, false], format: 'HH' },
    { name: 'explicit hidden seconds', props: { showTime: { showSecond: false } },
      flags: [true, true, false, false, false], format: 'HH:mm' },
    { name: 'all hidden', props: {
      showTime: { showHour: false, showMinute: false, showSecond: false }
    }, flags: [false, false, false, false, false], format: '' },
    { name: 'milliseconds', props: { format: 'YYYY-MM-DD HH:mm:ss.SSS', showTime: true },
      flags: [true, true, true, true, false], format: 'HH:mm:ss.SSS' },
    { name: 'single S', props: { format: 'YYYY-MM-DD HH:mm:ss.S', showTime: true },
      flags: [true, true, true, false, false], format: 'HH:mm:ss' },
    { name: 'literal input', props: { format: 'YYYY-MM-DD [Hours]', showTime: true },
      flags: [true, true, true, false, false], format: 'HH:mm:ss' },
    { name: 'literal meridiem text', props: { format: 'YYYY-MM-DD [at] HH:mm', showTime: true },
      flags: [true, true, false, false, false], format: 'HH:mm' }
  ];

  for (const sample of cases) {
    it(`resolves ${sample.name} without changing the input format`, () => {
      const clock = datePickerClock(sample.props);

      expect([clock.showHour, clock.showMinute, clock.showSecond,
        Boolean(clock.showMillisecond), clock.use12Hours]).toEqual(sample.flags);
      expect(clock.format).toBe(sample.format);
    });
  }

  it('uses the datetime locale when the display format is a callback', () => {
    const display = () => 'display text';
    const clock = datePickerClock({ format: [display, 'HH:mm:ss'], showTime: true }, {
      fieldDateTimeFormat: 'DD.MM.YYYY HH:mm'
    });

    expect(clock).toMatchObject({
      showHour: true, showMinute: true, showSecond: false, use12Hours: false, format: 'HH:mm'
    });
  });

  it('uses the datetime locale when the first format array entry is empty', () => {
    const clock = datePickerClock({ format: ['', 'HH:mm:ss'], showTime: true }, {
      fieldDateTimeFormat: 'DD.MM.YYYY HH:mm', fieldTimeFormat: 'HH'
    });

    expect(clock).toMatchObject({
      showHour: true, showMinute: true, showSecond: false, use12Hours: false, format: 'HH:mm'
    });
  });

  it('does not use the standalone time locale after excluding a literal-only panel format', () => {
    const clock = datePickerClock({ showTime: { format: '[Hours]' } }, {
      fieldTimeFormat: 'HH'
    });

    expect(clock).toMatchObject({
      showHour: true, showMinute: true, showSecond: true, use12Hours: false, format: '[Hours]'
    });
  });

  it('retains the default date and steps without mutating the config', () => {
    const date = dayjs('2024-09-15T12:34:56.789Z');
    const config = { format: 'HH:mm', minuteStep: 15, defaultOpenValue: date };
    const clock = datePickerClock({ showTime: config });

    expect(clock.defaultOpenValue).toBe(date);
    expect(clock.minuteStep).toBe(15);
    expect(config).toEqual({ format: 'HH:mm', minuteStep: 15, defaultOpenValue: date });
    expect(config).not.toHaveProperty('showHour');
  });
});
