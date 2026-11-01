import dayjs from 'dayjs';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TimeRangePicker from './TimeRangePicker.svelte';

describe('TimeRangePicker SSR', () => {
  it('renders two native time fields and source range placeholders without hidden ISO inputs', () => {
    const body = render(TimeRangePicker, { props: {
      value: [dayjs('2024-09-15T10:23:44.567'), dayjs('2024-09-15T17:45:56.789')],
      id: { start: 'start', end: 'end' }, name: 'interval', required: true
    } }).body;

    expect(body).toContain('value="10:23:44"');
    expect(body).toContain('value="17:45:56"');
    expect(body.match(/name="interval"/g)).toHaveLength(2);
    expect(body.match(/role="combobox"/g)).toHaveLength(2);
    expect(body).toContain('placeholder="Время начала"');
    expect(body).toContain('placeholder="Время окончания"');
    expect(body).not.toContain('type="hidden"');
    expect(body).not.toContain('[object Object]');
  });

  it('leaves both fields empty despite defaults and renders nullable time-only panels for SSR', () => {
    const body = render(TimeRangePicker, { props: {
      value: null, defaultOpen: true,
      defaultValue: [dayjs('2024-09-15T10:23:44'), dayjs('2024-09-15T17:45:56')],
      allowEmpty: [true, true]
    } }).body;
    const html = body.replace(/<!--[\s\S]*?-->/g, '');

    expect(body.match(/value=""/g)).toHaveLength(2);
    expect(body).toContain('ant-picker-time-range-wrapper');
    expect(body).toMatch(/role="dialog"[^>]*hidden/);
    expect(body).not.toContain('ant-picker-time-panel-cell-selected');
    expect(body).not.toContain('role="grid"');
    expect(html).toMatch(/<button\b[^>]*\bdisabled[^>]*>\s*<span>ОК<\/span>/);
  });

  it('renders per-field defaultOpenValue only in the panel and supports footer mode snippets', () => {
    const body = render(TimeRangePicker, { props: {
      value: null, defaultOpen: true,
      defaultOpenValue: [dayjs('2024-02-29T08:09:10'), dayjs('2024-03-01T18:19:20')],
      renderExtraFooter: createRawSnippet<['time']>(getMode => ({
        render: () => `<span>Footer ${getMode()}</span>`
      }))
    } }).body;

    expect(body.match(/value=""/g)).toHaveLength(2);
    expect(body).toMatch(/data-value="8"[^>]*ant-picker-time-panel-cell-selected/);
    expect(body).toContain('Footer time');
  });

  it('applies one resolved semantic layer and keeps the custom variant raw', () => {
    const body = render(TimeRangePicker, { props: {
      placeholder: 'Choose interval',
      format: date => date.format('HH:mm'), inputReadOnly: false,
      classNames: ({ props }) => ({ root: props.size === 'middle'
        && props.variant === undefined && props.disabled === false ? 'resolved-props' : 'wrong' }),
      styles: { root: 'outline-offset:2px' }, style: 'outline-offset:4px',
      suffixIcon: false
    } }).body;

    expect(body).toContain('resolved-props');
    expect(body.match(/placeholder="Choose interval"/g)).toHaveLength(2);
    expect(body.match(/readonly/g)).toHaveLength(2);
    expect(body).toContain('outline-offset:2px;outline-offset:4px');
    expect(body).not.toContain('ant-picker-suffix');
  });
});
