import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-masonry-theme-reference.json';
import MasonryThemeCase from '../browser/fixtures/MasonryThemeCase.svelte';

describe('Masonry theme public package SSR', () => {
  it('pins the official archive and declares the source scope-marker adjustment', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.reference.scopeMarker).toContain('rootClassName=ant-masonry-css-var');
    expect(reference.unscoped.find(sample => sample.name === 'component-aliases')?.root['font-size'])
      .toBe('14px');
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} root shells without items, callbacks, refs or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(MasonryThemeCase, { props: { sample } });

        expect(body).toContain('ant-masonry-css-var');
        expect(body).toContain('height:0px');
        expect(body).toContain('Masonry theme ref normal">empty</output>');
        expect(body).toContain('Masonry theme notifications normal">[]</output>');
        expect(body).not.toContain('data-key=');
        if (sample.name === 'custom-css-prefix') {
          expect(body).toContain('masonry-probe');
          expect(body).toContain('--owned-font-size:30px');
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
