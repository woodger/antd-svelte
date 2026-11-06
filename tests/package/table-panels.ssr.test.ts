import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-table-panels-reference.json';
import TablePanelsCase from '../browser/fixtures/TablePanelsCase.svelte';

describe('Table title/footer public package SSR', () => {
  it('pins the official source and the separately inspected rc-table archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      rcTableReferenceVersion: '1.11.1'
    });
    expect(reference.reference.rcTableReferenceArchiveIntegrity).toMatch(/^sha512-/);
  });

  for (const sample of reference.cases) {
    for (const [mode, expected] of Object.entries(sample.modes)) {
      it(`renders ${sample.name} ${mode} page records in independent title and footer panels`, () => {
        vi.useFakeTimers();
        try {
          const { body } = render(TablePanelsCase, { props: { sample, mode } });
          const html = body.replace(/<!--[\s\S]*?-->/g, '');
          const data = (name: string) => html.match(
            new RegExp(`<output\\b[^>]*data-${name}-data[^>]*>([^<]*)</output>`)
          )?.[1] ?? null;

          expect(data('title')).toBe(expected.titleData);
          expect(data('footer')).toBe(expected.footerData);
          expect(html.includes('class="ant-table-title')).toBe(expected.children.includes('title'));
          expect(html.includes('class="ant-table-footer')).toBe(expected.children.includes('footer'));
          expect(html).toContain('<caption');
          expect(html).toContain('Panel people</caption>');
          expect(html).not.toContain('[object Object]');
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      });
    }
  }
});
