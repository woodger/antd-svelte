import dayjs from 'dayjs';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker, TimePicker, type TimePickerCellRenderInfo } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-picker-prefix-reference.json';
import PickerPrefixSSRFixtures from '../browser/fixtures/PickerPrefixSSRFixtures.svelte';

describe('Date/Time picker local/shared prefixes', () => {
  it('pins Source styles and live root/input/popup/focus identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(33);
    expect(reference.transitions).toHaveLength(12);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.samePopup && step.focused)).toBe(true);
  });

  it('renders a local date owner without leaking prefixCls or creating browser resources', () => {
    const getPopupContainer = vi.fn();
    const result = render(DatePicker, {
      props: { prefixCls: 'dates', value: dayjs('2024-09-15'), getPopupContainer }
    });
    const body = result.body;
    const head = result.head;

    expect(body).toContain('dates ant-picker-css-var');
    expect(body).toContain('dates-input');
    expect(body).not.toContain('prefixCls=');
    expect(head).toContain('.dates-dropdown:where(');
    expect(getPopupContainer).not.toHaveBeenCalled();
  });

  it('passes the resolved owner to time renderers and their origin nodes', () => {
    const cellRender = createRawSnippet<[number | 'am' | 'pm', TimePickerCellRenderInfo]>(
      (_value, info) => ({ render: () => `<span data-render-prefix="${info().prefixCls}"></span>` })
    );
    const result = render(TimePicker, {
      props: { prefixCls: 'times', value: dayjs('2024-09-15T12:34:56.789Z'),
        defaultOpen: true, cellRender }
    });
    const body = result.body;

    expect(body).toContain('data-render-prefix="times"');
    expect(body).toContain('times-time-panel-column');
    expect(body).toContain('hidden');
    expect(body).not.toContain('prefixCls=');
  });

  it('keeps Date/Time shared namespaces and canonical component tokens independent in SSR', () => {
    vi.useFakeTimers();
    try {
      const result = render(PickerPrefixSSRFixtures);
      const body = result.body;
      const head = result.head;

      expect(body).toContain('suite-picker ant-picker-css-var');
      expect(body).toContain('suite-picker-range');
      expect(body).toContain('times ant-picker-css-var');
      expect(body).toContain('times-range');
      expect(head).toContain('--inner-date-picker-affix-color');
      expect(head).toContain('--ant-date-picker-active-bg');
      expect(body).not.toContain('[object Object]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
