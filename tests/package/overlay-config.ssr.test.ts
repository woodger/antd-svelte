import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import OverlayConfigCase from '../browser/fixtures/OverlayConfigCase.svelte';
import reference from '../browser/fixtures/ant-design-overlay-config-reference.json';
import type { OverlayConfigCase as Sample } from '../browser/fixtures/overlay-config-presets';

describe('Overlay ConfigProvider and semantic slots SSR', () => {
  it('pins component configuration to the studied official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders hidden source root classes and arrow settings without DOM work for ${sample.name}`, () => {
      const prefix = sample.component === 'tooltip' || sample.component === 'slider'
        ? 'ant-tooltip' : 'ant-popover';
      vi.useFakeTimers();

      try {
        const { body } = render(OverlayConfigCase, { props: { sample: sample as Sample } });
        const tags = [...body.matchAll(/<(?:div|span)\b[^>]*>/g)].map(match => ({
          tag: match[0],
          classes: (match[0].match(/\bclass="([^"]*)"/)?.[1] ?? '').split(/\s+/)
        }));
        const root = tags.find(value => value.classes.includes(prefix))!;

        expect(root.tag).toContain('popover="manual"');
        expect(root.tag).toMatch(/\shidden(?:[\s=>])/);
        const classes = root.classes.filter(name => /^(ctx-|local-|outer-|inner-|cb-)/.test(name));
        expect([...new Set(classes)].sort()).toEqual(sample.snapshots[0]!.slots.root.classes);
        expect(tags.some(value => value.classes.includes(`${prefix}-arrow`)))
          .toBe(sample.snapshots[0]!.slots.arrow !== null);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
