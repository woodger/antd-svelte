import dayjs from 'dayjs';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker, type TimePickerProps } from 'antd-svelte';
import TimePickerFixtures from '../browser/fixtures/TimePickerFixtures.svelte';

describe('TimePicker public package SSR', () => {
  it('exports typed time selection and preserves native form text', () => {
    const props: TimePickerProps = {
      value: dayjs('2024-09-15T10:23:44.567'),
      format: 'HH:mm:ss.SSS',
      name: 'time',
      showMillisecond: true
    };
    const body = render(TimePicker, { props }).body;

    expect(body).toContain('name="time"');
    expect(body).toContain('value="10:23:44.567"');
    expect(body).not.toContain('type="hidden"');
    expect(body).not.toContain('[object Object]');
  });

  it('renders source time-only panels for an initially open picker without browser APIs', () => {
    const body = render(TimePicker, { props: {
      defaultValue: dayjs('2024-09-15T22:23:44.567'),
      defaultOpen: true,
      use12Hours: true,
      locale: { lang: { locale: 'en_US' } }
    } }).body;

    expect(body).toContain('value="10:23:44 PM"');
    expect(body).toMatch(/role="dialog"[^>]*hidden/);
    expect(body).toContain('data-type="meridiem"');
    expect(body).not.toContain('ant-picker-date-panel');
  });

  it('renders nested component config, snippets and form integration without timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(TimePickerFixtures).body;

      expect(body).toContain('time-context');
      expect(body).toContain('local-time-raw');
      expect(body).toContain('context-time-middle');
      expect(body).toContain('ant-picker-filled');
      expect(body).toContain('value="10:23:44"');
      expect(body).toContain('Required time');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
