import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-responsive-controls-reference.json';
import ResponsiveControlsCase from '../browser/fixtures/ResponsiveControlsCase.svelte';

describe('Masonry and Pagination theme breakpoints', () => {
  it('pins raw responsive layout and separates stale Source observers from current fresh mounts', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.reduce((sum, entry) => sum + entry.result.length, 0)).toBe(36);
    expect(reference.live.updated.metrics).toEqual(reference.live.initial);
    expect(reference.live.updated.metrics).not.toEqual(reference.live.fresh[0].metrics);
    expect(reference.live.updated.sameMasonry && reference.live.updated.samePager
      && reference.live.updated.sameInput).toBe(true);
  });

  it('keeps SSR fallback markup without media subscriptions or timers', () => {
    vi.useFakeTimers();
    try {
      const result = render(ResponsiveControlsCase, { props: {
        sample: { id: 'shifted', token: reference.live.token }
      } });
      const body = result.body;

      expect(body).toContain('ant-masonry');
      expect(body).not.toContain('class="ant-masonry-item');
      expect(body).toContain('fixture-responsive-pagination');
      expect(body).not.toMatch(/class="[^"]*\bant-pagination-mini\b/);
      expect(body).toContain('aria-current="page"');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  for (const kind of ['masonry', 'pagination'] as const) {
    it(`rejects invalid global thresholds in ${kind} before mount`, () => {
      expect(() => render(ResponsiveControlsCase, { props: { kind, sample: {
        id: 'invalid', responsive: false, token: { screenSM: 400 }
      } } }).body).toThrow('screenSMMin<=screenSM fails : !(576<=400)');
    });
  }
});
