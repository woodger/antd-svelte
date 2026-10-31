import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Calendar, generateCalendar, type CalendarProps } from 'antd-svelte';
import dayjs from 'dayjs';
import CalendarFixtures from '../browser/fixtures/CalendarFixtures.svelte';
import { calendarDateAdapter } from '../browser/fixtures/calendar-date-adapter';

describe('Calendar package SSR', () => {
  it('renders the public Dayjs Calendar with range restrictions and native header controls', () => {
    const props: CalendarProps = {
      value: dayjs('2024-09-15'),
      validRange: [dayjs('2024-09-10'), dayjs('2024-09-20')],
      fullscreen: false
    };

    const body = render(Calendar, { props }).body;

    expect(body).toContain('ant-picker-calendar-mini');
    expect(body).toContain('ant-picker-cell-disabled');
    expect(body).toContain('ant-radio-button-input');
    expect(body).toContain('title="2024-09-15"');
  });

  it('creates a custom native Date Calendar without converting its values to Dayjs', () => {
    const CustomCalendar = generateCalendar(calendarDateAdapter);

    const body = render(CustomCalendar, { props: {
      value: new Date('2024-02-29T12:34:56.789Z'),
      mode: 'year',
      fullscreen: false
    } }).body;

    expect(body).toContain('ant-picker-month-panel');
    expect(body).toContain('title="2024-02"');
    expect(body.match(/role="gridcell"/g)).toHaveLength(12);
    expect(body).toContain('aria-selected="true"');
  });

  it('renders both owned fixture calendars through the built package', () => {
    const body = render(CalendarFixtures).body;

    expect(body).toContain('id="calendar-fixture"');
    expect(body).toContain('fixture-calendar');
    expect(body).toContain('generated-calendar');
    expect(body).toContain('calendar-context');
    expect(body).toContain('2024-02-29T12:34:56.789Z');
  });
});
