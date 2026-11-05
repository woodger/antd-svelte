import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-rate-theme-reference.json';
import RateThemeCase from '../browser/fixtures/RateThemeCase.svelte';

describe('Rate component theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without DOM, refs, focus, value events or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(RateThemeCase, { props: { sample } });

        expect(body).toContain('data-rate-theme="normal"');
        expect(body).toContain('role="radiogroup"');
        expect(body).toContain('Rate theme value">2.5</output>');
        expect(body).toContain('Rate theme ref">empty</output>');
        expect(body).toContain('Rate theme events">[]</output>');
        expect(body).toContain('Rate theme focus events">[]</output>');
        if ('opaque' in sample && sample.opaque) {
          const fallback = sample.name === 'opaque-css-prefix'
            ? '--ant-rate-star-hover-scale:var(--owned-rate-star-hover-scale,scale(1.1))'
            : '--ant-rate-star-hover-scale:scale(1.1)';
          expect(body).toContain(fallback);
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
