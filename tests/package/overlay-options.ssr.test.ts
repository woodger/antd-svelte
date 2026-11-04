import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import OverlayCornerCase from '../browser/fixtures/OverlayCornerCase.svelte';
import reference from '../browser/fixtures/ant-design-overlay-options-reference.json';
import type { OverlayCornerCase as Sample } from '../browser/fixtures/overlay-corner-presets';

describe('Overlay arrow and overflow SSR', () => {
  it('pins local options to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const name of [
    'topLeft-point-true',
    'top-overflow-0',
    'popover-topLeft-point',
    'popconfirm-rightBottom-point',
    'avatar-group-topLeft-point',
    'slider-rightBottom-point',
    'slider-range-bottomRight-point'
  ]) {
    it(`renders hidden panels with source arrow options and no DOM work for ${name}`, () => {
      const sample = reference.cases.find(sample => sample.name === name)! as Sample;
      const prefix = sample.component === 'tooltip' || sample.component === 'slider'
        ? 'ant-tooltip' : 'ant-popover';
      vi.useFakeTimers();

      try {
        const { body } = render(OverlayCornerCase, { props: { sample } });

        expect(body).toContain(`${prefix}-placement-${sample.placement}`);
        expect(body).toContain(`${prefix}-arrow`);
        expect(body).toMatch(/popover="manual"[^>]*\shidden(?:[\s=>])/);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }

  it('hides a boolean arrow while accepting object overflow options', () => {
    const sample = reference.cases.find(sample => sample.name === 'top-overflow-0')! as Sample;

    const { body } = render(OverlayCornerCase, { props: { sample: { ...sample, arrow: false } } });

    expect(body).not.toContain('class="ant-tooltip-arrow"');
    expect(body).toContain('ant-tooltip-placement-top');
    expect(body).toMatch(/popover="manual"[^>]*\shidden(?:[\s=>])/);
  });
});
