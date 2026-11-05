import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-layout-theme-reference.json';
import LayoutThemeCase from '../browser/fixtures/LayoutThemeCase.svelte';

describe('Layout theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} native parts and collapsed sidebars without refs or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(LayoutThemeCase, { props: { sample } });

        expect(body).toContain('<header');
        expect(body).toContain('<main');
        expect(body).toContain('<footer');
        expect(body).toContain('<aside');
        expect(body).toContain('Layout theme refs dark">empty</output>');
        expect(body).toContain('Layout theme changes dark">[]</output>');
        expect(body).toContain('inert');
        expect(body).toContain('--ant-layout-header-height:');
        if (sample.name === 'custom-css-prefix') {
          expect(body).toContain('layout-probe');
          expect(body).toContain('--owned-layout-header-height:72px');
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
