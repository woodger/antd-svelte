import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-calendar-theme-reference.json';
import CalendarThemeCase from '../browser/fixtures/CalendarThemeCase.svelte';

describe('Calendar theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with native date cells and intrinsic fields without browser effects`,
      () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(reference.reference.now));
        try {
          const { body } = render(CalendarThemeCase, { props: { sample } });

          expect(body).toContain('--ant-calendar-mini-content-height');
          expect(body).toContain('role="gridcell"');
          expect(body).toContain('role="combobox"');
          expect(body).toContain('title="2024-09-15"');
          expect(body).toContain('aria-selected="true"');
          expect(body).toContain('intrinsic-label');
          expect(body).not.toContain('_autoWidth');
          expect(body).not.toContain('[object Object]');
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      });
  }
});
