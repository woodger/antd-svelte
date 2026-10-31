import dayjs from 'dayjs';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { TimeRangePicker, type TimeRangePickerProps } from 'antd-svelte';
import TimeRangePickerFixtures from '../browser/fixtures/TimeRangePickerFixtures.svelte';

describe('TimeRangePicker public package SSR', () => {
  it('exports the time range component and typed Dayjs pairs with native names', () => {
    const props: TimeRangePickerProps = {
      value: [dayjs('2024-09-15T10:23:44.567'), dayjs('2024-09-15T17:45:56.789')],
      format: 'HH:mm:ss.SSS', name: 'interval', changeOnScroll: true
    };
    const body = render(TimeRangePicker, { props }).body;

    expect(body).toContain('value="10:23:44.567"');
    expect(body).toContain('value="17:45:56.789"');
    expect(body.match(/name="interval"/g)).toHaveLength(2);
    expect(body).not.toContain('changeOnScroll');
    expect(body).not.toContain('type="hidden"');
  });

  it('renders an open time panel without date grids or browser-only work', () => {
    const body = render(TimeRangePicker, { props: {
      value: null, defaultOpen: true, use12Hours: true,
      defaultOpenValue: dayjs('2024-09-15T10:23:44')
    } }).body;

    expect(body).toMatch(/role="dialog"[^>]*hidden/);
    expect(body).toContain('data-type="meridiem"');
    expect(body).not.toContain('ant-picker-date-panel');
  });

  it('renders the mixed range/time component config and form boundary without timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(TimeRangePickerFixtures).body;

      expect(body).toContain('range-context');
      expect(body).toContain('context-range-value');
      expect(body).toContain('ant-picker-underlined');
      expect(body).not.toContain('unused-time-context');
      expect(body).not.toContain('outline-offset:88px');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
