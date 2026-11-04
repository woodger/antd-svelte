import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import OverlayConfigCase from '../browser/fixtures/OverlayConfigCase.svelte';
import reference from '../browser/fixtures/ant-design-typography-tooltip-reference.json';
import type { OverlayConfigCase as Sample } from '../browser/fixtures/overlay-config-presets';

describe('Typography Tooltip public package SSR', () => {
  it('pins trigger defaults and event traces to the studied official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`keeps ellipsis Tooltip lazy without DOM work for ${sample.name}`, () => {
      vi.useFakeTimers();

      try {
        const { body } = render(OverlayConfigCase, { props: { sample: sample as Sample } });

        expect(body).toContain('ant-typography');
        expect(body).toContain(sample.text ?? 'A long text that exceeds the available width');
        expect(body).not.toContain('role="tooltip"');
        expect(body).not.toContain('aria-label="Config draft"');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
