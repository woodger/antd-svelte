import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-watermark-theme-reference.json';
import WatermarkThemeCase from '../browser/fixtures/WatermarkThemeCase.svelte';

describe('Watermark global theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} content without drawing, browser reads or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(WatermarkThemeCase, { props: { sample } });

        expect(body).toContain('data-watermark-theme="normal"');
        expect(body).toContain('Watermark theme draft normal');
        expect(body).not.toContain('normal:Text');
        expect(body).not.toContain('background-image');
        expect(body).not.toContain('<canvas');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
