import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TimePicker from './TimePicker.svelte';

dayjs.extend(utc);

describe('TimePicker SSR', () => {
  it('renders a time input and clock icon without serializing Dayjs or time-only props', () => {
    const body = render(TimePicker, { props: {
      value: dayjs.utc('2024-09-15T10:23:44.567Z'),
      name: 'meeting',
      required: true,
      minuteStep: 15,
      previewValue: false,
      'aria-label': 'Meeting time'
    } }).body;

    expect(body).toContain('value="10:23:44"');
    expect(body).toContain('name="meeting"');
    expect(body).toContain('required');
    expect(body).toContain('role="combobox"');
    expect(body).toContain('aria-expanded="false"');
    expect(body).toContain('ant-picker-suffix');
    expect(body).toContain('viewBox="64 64 896 896"');
    expect(body).not.toContain('type="hidden"');
    expect(body).not.toContain('minuteStep');
    expect(body).not.toContain('previewValue');
    expect(body).not.toContain('[object Object]');
  });

  it('gives controlled null precedence over defaultValue and defaultOpenValue', () => {
    const body = render(TimePicker, { props: {
      value: null,
      defaultValue: dayjs.utc('2024-09-15T10:23:44.567Z'),
      defaultOpenValue: dayjs.utc('2024-02-29T15:16:17.123Z'),
      defaultOpen: true
    } }).body;

    expect(body).toContain('value=""');
    expect(body).toContain('role="dialog"');
    expect(body).toMatch(/role="dialog"[^>]*hidden/);
    expect(body).toMatch(/data-value="15"[^>]*ant-picker-time-panel-cell-selected/);
    expect(body).not.toContain('role="grid"');
  });

  it('renders nullable columns without inventing a selected time', () => {
    const body = render(TimePicker, { props: { value: null, defaultOpen: true } }).body;

    expect(body.match(/class="ant-picker-time-panel-column"/g)).toHaveLength(3);
    expect(body).not.toContain('ant-picker-time-panel-cell-selected');
    expect(body).toMatch(/disabled[^>]*><span>ОК/);
  });

  it('uses the time locale and explicit display format independently from panel units', () => {
    const body = render(TimePicker, { props: {
      value: dayjs.utc('2024-09-15T22:23:44.567Z'),
      use12Hours: true,
      showMillisecond: true,
      locale: { lang: { locale: 'en_US' }, timePickerLocale: { placeholder: 'At what time?' } },
      format: value => `Time ${value.format('HH:mm:ss.SSS')}`
    } }).body;

    expect(body).toContain('value="Time 22:23:44.567"');
    expect(body).toContain('placeholder="At what time?"');
    expect(body).toContain('readonly');
    expect(body).not.toContain('role="dialog"');
  });

  it('preserves raw semantic props, style precedence and renderable empty clear icons', () => {
    const body = render(TimePicker, { props: {
      value: dayjs.utc('2024-09-15T10:23:44.567Z'),
      classNames: ({ props }) => ({
        root: props.size === undefined && props.variant === 'outlined' ? 'raw-owner' : 'wrong'
      }),
      styles: { root: 'outline-offset:2px' },
      style: 'outline-offset:4px',
      allowClear: { clearIcon: null },
      suffixIcon: false,
      prefix: 0,
      renderExtraFooter: createRawSnippet(() => ({ render: () => '<span>Extra</span>' }))
    } }).body;

    expect(body).toContain('raw-owner');
    expect(body).toContain('outline-offset:2px;outline-offset:4px');
    expect(body).toContain('ant-picker-prefix');
    expect(body).toContain('ant-picker-clear-btn');
    expect(body).not.toContain('ant-picker-suffix');
    expect(body).not.toContain('Extra');
  });
});
