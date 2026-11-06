import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tour-theme-reference.json';
import TourThemeCase from '../browser/fixtures/TourThemeCase.svelte';

describe('Tour component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`keeps ${sample.name} tour layers and descriptions out of SSR without resources`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TourThemeCase, { props: { sample, mode: 'target' } });

        expect(body).toContain('tour-theme-target');
        expect(body).not.toContain('Stored step');
        expect(body).not.toContain('Stored description');
        expect(body).not.toContain('ant-tour-mask');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
