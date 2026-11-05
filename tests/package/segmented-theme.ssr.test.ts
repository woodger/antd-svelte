import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-segmented-theme-reference.json';
import SegmentedThemeCase from '../browser/fixtures/SegmentedThemeCase.svelte';

describe('Segmented component theme public package SSR', () => {
  it('pins the official source used for component token expectations', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  it('renders component tokens and native radios before hydration', () => {
    const sample = reference.cases.find(item => item.name === 'component-tokens')!;

    const { body } = render(SegmentedThemeCase, { props: { sample } });

    expect(body).toContain('--ant-segmented-track-padding:4px');
    expect(body).toContain('--ant-segmented-track-bg:#f6ffed');
    expect(body).toContain('--ant-segmented-item-active-bg:#d9f7be');
    expect(body).toContain('role="radiogroup"');
    expect(body).toContain('type="radio"');
    expect(body).toContain('name="theme-normal" checked');
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without thumb, observers, events or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(SegmentedThemeCase, { props: { sample } });

        expect(body).toContain('data-segmented-theme="normal"');
        expect(body).toContain('data-segmented-theme="vertical"');
        expect(body).toContain('segmented-track-padding:');
        expect(body).toContain('Segmented theme events">[]</output>');
        expect(body).not.toMatch(/class="ant-segmented-thumb(?:\s|")/);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
