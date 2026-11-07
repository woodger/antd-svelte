import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-table-header-reference.json';
import TableHeaderCase from '../browser/fixtures/TableHeaderCase.svelte';

describe('Table showHeader public package SSR', () => {
  it('pins the official source of header visibility and no-header radius conditions', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    for (const [mode, expected] of Object.entries(sample.modes)) {
      it(`renders ${sample.name} ${mode} caption and rows with the source header condition`, () => {
        vi.useFakeTimers();
        try {
          const { body } = render(TableHeaderCase, { props: { sample, mode } });

          expect(/<thead\b/.test(body)).toBe(expected.headerCells > 0);
          expect(body.includes('ant-table-no-header')).toBe(expected.noHeader);
          expect(body.includes('class="ant-table-title')).toBe(expected.title !== null);
          expect(body).toContain('Header people');
          if (expected.bodyRows) {
            expect(body).toContain('Alpha');
            expect(body).toContain('Beta');
          }
          expect(body).not.toContain('[object Object]');
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      });
    }
  }
});
