import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { Tooltip } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import OverlayLifecycleCase from '../browser/fixtures/OverlayLifecycleCase.svelte';
import reference from '../browser/fixtures/ant-design-overlay-lifecycle-reference.json';
import type { OverlayLifecycleCase as Sample } from '../browser/fixtures/overlay-lifecycle-presets';

describe('Overlay content lifetime public package SSR', () => {
  it('pins content lifetime evidence to the studied official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`keeps the native hidden shell and source destruction policy without DOM work for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(OverlayLifecycleCase, { props: { sample: sample as Sample } });
        const retained = sample.snapshots.closed.contents.length > 0;

        expect(body).toContain('data-lifecycle-anchor');
        expect(body.includes('data-lifecycle-payload')).toBe(retained && sample.component !== 'typography');
        expect(body).toMatch(/aria-label="Lifecycle container calls">(?:<!--[\s\S]*?-->)*0/);
        expect(body).toMatch(/aria-label="Lifecycle events">(?:<!--[\s\S]*?-->)*\[\]/);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }

  for (const mode of ['single', 'range', 'pinned'] as const) {
    it(`keeps initially open destroying ${mode} Slider contents lazy until mount`, () => {
      const sample: Sample = { name: mode, component: 'tooltip',
        options: { destroyOnHidden: true }, open: true, snapshots: {}, retained: false };

      const { body } = render(OverlayLifecycleCase, { props: { sample, sliderMode: mode } });

      expect(body).toContain('data-ant-tooltip');
      expect(body).not.toContain('Value 25');
      expect(body).not.toContain('Value 50');
      expect(body).not.toContain('Value 75');
    });
  }

  it('does not invoke a destroying Tooltip title snippet even when initially open without ConfigProvider', () => {
    const title = createRawSnippet(() => { throw new Error('SSR title must remain lazy'); });
    const children = createRawSnippet(() => ({ render: () => '<button>Trigger</button>' }));

    const { body } = render(Tooltip, { props: { title, children, open: true, destroyOnHidden: true } });

    expect(body).toContain('role="tooltip"');
    expect(body).toContain('popover="manual"');
    expect(body).toContain('Trigger');
  });
});
