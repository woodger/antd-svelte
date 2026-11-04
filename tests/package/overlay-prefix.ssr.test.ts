import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import OverlayConfigCase from '../browser/fixtures/OverlayConfigCase.svelte';
import reference from '../browser/fixtures/ant-design-overlay-prefix-reference.json';
import type { OverlayConfigCase as Sample } from '../browser/fixtures/overlay-config-presets';

describe('Overlay source prefixes SSR', () => {
  it('pins prefix behavior to the studied official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const name of ['tooltip-custom', 'popover-custom', 'popconfirm-custom',
    'avatar-group-custom', 'slider-custom', 'slider-range-custom']) {
    it(`renders hidden source classes and scoped CSS without timers for ${name}`, () => {
      const sample = reference.cases.find(sample => sample.name === name)!;
      const kind = sample.component === 'slider' ? 'tooltip'
        : sample.component === 'avatar-group' ? 'popover' : sample.component;
      vi.useFakeTimers();

      try {
        const { body, head } = render(OverlayConfigCase, { props: { sample: sample as Sample } });
        const tags = [...body.matchAll(/<(?:div|span)\b[^>]*>/g)].map(match => match[0]);
        const root = tags.find(tag => tag.includes('popover="manual"'))!;

        expect(root).toMatch(/\shidden(?:[\s=>])/);
        for (const name of sample.snapshots[0]![0].classes!) expect(root).toContain(name);
        expect(body).not.toMatch(/\bprefixcls=/i);
        expect(head).toContain(`data-ant-svelte-theme="${kind}-prefix:${sample.local!.prefixCls}"`);
        expect(head).toContain(`.${sample.local!.prefixCls}`);
        expect(head).toContain(`--ant-${kind}-`);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
