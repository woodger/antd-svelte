import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Calendar from './Calendar.svelte';
import type { CalendarCellRenderInfo } from './calendar.types';

dayjs.extend(utc);

describe('Calendar SSR', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 8, 15, 12, 34, 56, 789));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('selects the adapter current date when neither value nor defaultValue is provided', () => {
    const body = render(Calendar).body;

    expect(body).toContain('title="2024-09-15"');
    expect(body).toContain('aria-selected="true"');
    expect(body).toContain('ant-picker-calendar-date-today');
  });

  it('renders full date rows, header controls and a selected date without a hidden date input', () => {
    const body = render(Calendar, { props: {
      defaultValue: dayjs.utc('2024-09-15T12:34:56.789Z'),
      rootClassName: 'owner'
    } }).body;

    expect(body).toContain('ant-picker-calendar-full');
    expect(body).toContain('ant-picker-calendar-year-select');
    expect(body).toContain('ant-picker-calendar-month-select');
    expect(body).toContain('ant-radio-button-wrapper');
    expect(body).toContain('role="grid"');
    expect(body.match(/role="gridcell"/g)).toHaveLength(42);
    expect(body).toContain('title="2024-09-15"');
    expect(body).toContain('aria-selected="true"');
    expect(body).toContain('owner');
    expect(body).not.toContain('type="hidden"');
  });

  it('renders mini month rows and does not include a week column in year mode', () => {
    const body = render(Calendar, { props: {
      value: dayjs.utc('2024-02-29T12:34:56.789Z'),
      mode: 'year',
      fullscreen: false,
      showWeek: true
    } }).body;

    expect(body).toContain('ant-picker-calendar-mini');
    expect(body).toContain('ant-picker-month-panel');
    expect(body.match(/role="gridcell"/g)).toHaveLength(12);
    expect(body).toContain('title="2024-02"');
    expect(body).not.toContain('ant-picker-calendar-month-select');
    expect(body).not.toContain('ant-picker-cell-week');
  });

  it('renders week numbers separately from custom date content and retains full date precision', () => {
    const dates: string[] = [];
    const content = createRawSnippet<[dayjs.Dayjs, CalendarCellRenderInfo]>(
      (getDate, getInfo) => ({ render: () => {
        const date = getDate();
        const info = getInfo();
        dates.push(date.toISOString());

        return `<span>${info.type}:${info.prefixCls}:${info.locale.cellDateFormat}</span>`;
      } })
    );

    const body = render(Calendar, { props: {
      value: dayjs.utc('2024-09-15T12:34:56.789Z'),
      locale: { lang: { locale: 'en_US' } },
      showWeek: true,
      cellRender: content
    } }).body;

    expect(body.match(/role="gridcell"/g)).toHaveLength(48);
    expect(body.match(/date:ant-picker:D/g)).toHaveLength(42);
    expect(dates[0]).toBe('2024-09-01T12:34:56.789Z');
    expect(dates[41]).toBe('2024-10-12T12:34:56.789Z');
  });

  it('uses fullCellRender before legacy renderers and omits the default cell wrapper', () => {
    const body = render(Calendar, { props: {
      value: dayjs('2024-09-15'),
      fullCellRender: createRawSnippet(() => ({ render: () => '<span>Full replacement</span>' })),
      dateFullCellRender: createRawSnippet(() => ({ render: () => '<span>Legacy full</span>' })),
      cellRender: createRawSnippet(() => ({ render: () => '<span>Cell content</span>' }))
    } }).body;

    expect(body.match(/Full replacement/g)).toHaveLength(42);
    expect(body).not.toContain('Legacy full');
    expect(body).not.toContain('Cell content');
    expect(body).not.toContain('ant-picker-calendar-date-value');
  });

  it('retains raw undefined mode in semantic props while resolving fullscreen to true', () => {
    const body = render(Calendar, { props: {
      value: dayjs('2024-09-15'),
      classNames: ({ props }) => ({
        root: props.mode === undefined && props.fullscreen ? 'default-contract' : 'wrong-default',
        itemContent: 'owner-content'
      }),
      styles: { root: 'outline-offset:2px', body: 'outline-offset:4px' },
      style: 'outline-offset:6px'
    } }).body;

    expect(body).toContain('default-contract');
    expect(body).not.toContain('wrong-default');
    expect(body).toContain('outline-offset:2px;outline-offset:6px');
    expect(body).toContain('outline-offset:4px');
    expect(body).toContain('owner-content');
  });

  it('accepts the source null value boundary without selecting a date', () => {
    const body = render(Calendar, { props: { value: null as unknown as dayjs.Dayjs } }).body;

    expect(body.match(/role="gridcell"/g)).toHaveLength(42);
    expect(body).not.toContain('ant-picker-cell-selected');
  });
});
