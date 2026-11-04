import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import OverlayConfigCase from '../browser/fixtures/OverlayConfigCase.svelte';
import reference from '../browser/fixtures/ant-design-overlay-color-reference.json';
import type { OverlayConfigCase as Sample } from '../browser/fixtures/overlay-config-presets';

describe('Overlay color SSR', () => {
  it('pins color behavior to the studied official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const component of ['tooltip', 'popover', 'popconfirm', 'avatar-group', 'slider']) {
    for (const suffix of component === 'avatar-group' || component === 'slider'
      ? ['gold', 'fff', 'blue-inverse'] : ['blue', 'hex', 'transparent', 'inverse']) {
      it(`renders hidden ${component} color declarations and classes for ${suffix} without timers`, () => {
        const sample = reference.cases.find(sample => sample.name === `${component}-${suffix}`)!;
        const prefix = component === 'tooltip' || component === 'slider' ? 'ant-tooltip' : 'ant-popover';
        vi.useFakeTimers();

        try {
          const { body } = render(OverlayConfigCase, { props: { sample: sample as Sample } });
          const tags = [...body.matchAll(/<(?:div|span)\b[^>]*>/g)].map(match => ({
            tag: match[0],
            classes: (match[0].match(/\bclass="([^"]*)"/)?.[1] ?? '').split(/\s+/)
          }));
          const root = tags.find(value => value.classes.includes(prefix))!;
          const expected = sample.snapshots[0]![0];

          expect(root.tag).toContain('popover="manual"');
          expect(root.tag).toMatch(/\shidden(?:[\s=>])/);
          if (expected.colorClass) expect(root.classes).toContain(expected.colorClass);
          if (expected.arrowVariable) {
            expect(root.tag).toContain(`--ant-tooltip-arrow-background-color:${expected.arrowVariable}`);
          }
          if (expected.foregroundVariable) {
            expect(body).toContain(`--ant-tooltip-overlay-color:${expected.foregroundVariable}`);
          }
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      });
    }
  }
});
