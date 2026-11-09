import dayjs, { type Dayjs } from 'dayjs';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Calendar, type CalendarCellRenderInfo } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-calendar-prefix-reference.json';
import CalendarPrefixSSRFixtures from '../browser/fixtures/CalendarPrefixSSRFixtures.svelte';

describe('Calendar local/shared prefixes', () => {
  it('pins Source styles and live year/cell/focus identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(21);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.sameCell && step.focused)).toBe(true);
  });

  it('renders local cells and exposes the resolved picker prefix to cellRender', () => {
    const cellRender = createRawSnippet<[Dayjs, CalendarCellRenderInfo]>(
      (_date, info) => ({ render: () => `<span data-render-prefix="${info().prefixCls}"></span>` })
    );
    const result = render(Calendar, {
      props: { prefixCls: 'dates', value: dayjs('2024-09-15'), cellRender }
    });
    const body = result.body;
    const head = result.head;

    expect(body).toContain('dates-calendar-full');
    expect(body).toContain('dates-cell-selected');
    expect(body).toContain('data-render-prefix="dates"');
    expect(body).not.toContain('prefixCls=');
    expect(head).toContain('.dates-calendar:where(');
    expect(body).toContain('ant-picker-calendar-css-var');
  });

  it('keeps constrained Source header heights separate from the wider public counterpart', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'aliases')!;

    expect(entry.result.normal.mode?.height).toBe('48px');
    expect(entry.wideHeader?.normal.mode?.height).toBe('25.5625px');
    expect(entry.result.normal.root?.width).toBe('320px');
    expect(entry.wideHeader?.normal.root?.width).toBe('400px');
  });

  it('keeps shared Select/Radio namespaces and theme markers independent during SSR', () => {
    vi.useFakeTimers();
    try {
      const result = render(CalendarPrefixSSRFixtures);
      const body = result.body;
      const head = result.head;

      expect(body).toContain('suite-picker-calendar-mini');
      expect(body).toContain('dates-calendar-mini');
      expect(body).toContain('suite-select');
      expect(body).toContain('inner-select');
      expect(body).toContain('suite-radio-group');
      expect(body).toContain('inner-radio-button-wrapper');
      expect(head).toContain('--ant-calendar-mini-content-height');
      expect(body).not.toContain('[object Object]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
