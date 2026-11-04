import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import OverlayCornerCase from '../browser/fixtures/OverlayCornerCase.svelte';
import reference from '../browser/fixtures/ant-design-overlay-corner-reference.json';
import type { OverlayCornerCase as Sample } from '../browser/fixtures/overlay-corner-presets';

describe('Overlay corner placement SSR', () => {
  it('pins geometry to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases.filter(sample => !sample.geometry)) {
    it(`renders hidden source placement classes without DOM work for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(OverlayCornerCase, { props: { sample: sample as Sample } });
        const prefix = sample.component === 'tooltip' || sample.component === 'slider'
          ? 'ant-tooltip' : 'ant-popover';

        expect(body).toContain(`${prefix}-placement-${sample.placement}`);
        expect(body).toContain('popover="manual"');
        expect(body).toMatch(/popover="manual"[^>]*\shidden(?:[\s=>])/);
        expect(body).not.toContain('aria-expanded="true"');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
