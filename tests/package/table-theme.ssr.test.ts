import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-table-theme-reference.json';
import observation from '../browser/fixtures/ant-design-table-root-style-observation.json';
import TableThemeCase from '../browser/fixtures/TableThemeCase.svelte';

describe('Table component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    for (const source of [reference, observation]) {
      expect(source.reference).toMatchObject({
        version: registry.upstream.version,
        revision: registry.upstream.revision,
        archiveSha256: registry.upstream.archiveSha256
      });
    }
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} cells and expanded native inputs without browser resources`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TableThemeCase, { props: { sample, mode: 'stateful' } });
        const prefix = sample.config.cssVar?.prefix ?? 'ant';

        expect(body).toContain('aria-label="Themed people"');
        expect(body).toContain('Alpha');
        expect(body).toContain('Beta');
        expect(body).toContain('aria-expanded="true"');
        expect(body).toContain('type="checkbox"');
        expect(body).toContain('name="draft"');
        expect(body).toContain('value="Draft"');
        expect(body).toContain('ant-table-selection-col');
        expect(body).toContain('ant-table-expand-icon-col');
        expect(body).toContain(`--${prefix}-table-header-color`);
        expect(body).toContain(`--${prefix}-table-expand-icon-scale`);
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
