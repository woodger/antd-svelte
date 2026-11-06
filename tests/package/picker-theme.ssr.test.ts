import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-picker-theme-reference.json';
import PickerThemeCase from '../browser/fixtures/PickerThemeCase.svelte';

describe('DatePicker and TimePicker theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} in all four controls without browser effects`, () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(reference.reference.now));
      try {
        const { body } = render(PickerThemeCase, { props: { sample } });

        expect(body).toContain('--ant-date-picker-padding-block');
        expect(body).toContain('--ant-date-picker-time-cell-height');
        expect(body).toContain('role="combobox"');
        expect(body).toContain('Themed picker normal date');
        expect(body).toContain('Themed picker normal range');
        expect(body).toContain('Themed picker normal time');
        expect(body).toContain('Themed picker normal time-range');
        expect(body).not.toContain('role="dialog"');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }

  for (const header of reference.headerCases) {
    it(`renders the ${header.name} datetime header without creating scroll resources`, () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(reference.reference.now));
      try {
        const { body } = render(PickerThemeCase, { props: {
          sample: reference.cases[0], header: header.name, opened: 'datetime'
        } });

        expect(body).toContain('ant-picker-time-panel');
        expect(body).toContain('ant-picker-header-view');
        if (header.name !== 'empty') expect(body).toContain(header.metrics.timeHeaderText!);
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
