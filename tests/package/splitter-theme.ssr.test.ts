import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-splitter-theme-reference.json';
import SplitterThemeCase from '../browser/fixtures/SplitterThemeCase.svelte';

describe('Splitter component theme public package SSR', () => {
  it('pins the source version, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      directionWithoutHost: { hasRtlClass: true, direction: 'ltr' }
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without DOM, refs, resize events or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(SplitterThemeCase, { props: { sample } });

        expect(body).toContain('data-splitter-theme="normal"');
        expect(body).toContain('role="separator"');
        expect(body).toContain('Splitter theme ref">empty</output>');
        expect(body).toContain('Splitter theme events">[]</output>');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
