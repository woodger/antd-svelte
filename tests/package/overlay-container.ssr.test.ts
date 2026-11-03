import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-overlay-container-reference.json';
import OverlayContainerCase from '../browser/fixtures/OverlayContainerCase.svelte';
import type { OverlayContainerCase as ContainerCase } from '../browser/fixtures/overlay-container-presets';

describe('Overlay container source inheritance SSR', () => {
  it('pins container priorities to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`keeps the native SSR shell without calling DOM getters for ${sample.name}`, () => {
      const { body } = render(OverlayContainerCase, { props: {
        sample: sample as ContainerCase,
        onCall: () => { throw new Error('Unexpected SSR container call'); }
      } });

      expect(body).toContain('id="overlay-parent"');
      expect(body).toContain('id="overlay-shadow"');
      expect(body).toContain('aria-label="Overlay container calls">[]');
      expect(body.toLowerCase()).not.toMatch(/get(?:popup|tooltip)container=/);
    });
  }

  for (const sample of reference.cases.filter(item =>
    item.name.endsWith('-parent') || item.name === 'tooltip-svg')) {
    it(`defers getters with an explicitly open ${sample.name} during SSR`, () => {
      const { body } = render(OverlayContainerCase, { props: {
        sample: sample as ContainerCase,
        opened: true,
        onCall: () => { throw new Error('Unexpected open SSR container call'); }
      } });

      expect(body).toContain('aria-label="Overlay container calls">[]');
      if (sample.component !== 'typography') {
        const surfaces = Array.from(body.matchAll(/<(?:span|div)[^>]*\spopover="manual"[^>]*>/g));
        expect(surfaces).toHaveLength(sample.component === 'slider-range' ? 2 : 1);
        for (const [surface] of surfaces) expect(surface).toMatch(/\shidden(?:[=\s>])/);
      }
    });
  }
});
