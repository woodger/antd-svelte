import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-grid-theme-reference.json';
import GridThemeCase from '../browser/fixtures/GridThemeCase.svelte';

describe('Grid Row/Col component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });
  for (const sample of reference.cases) {
    it(`renders ${sample.name} Row and Col aliases without connecting media listeners`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(GridThemeCase, { props: { sample } });

        expect(body).toContain('ant-row ant-grid-css-var');
        expect(body).toContain('ant-col ant-grid-css-var');
        expect(body).toContain('Column A');
        expect(body).toContain('Column B');
        expect(body).toContain('Grid theme refs');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
