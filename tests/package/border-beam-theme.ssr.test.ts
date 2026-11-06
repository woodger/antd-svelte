import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-border-beam-theme-reference.json';
import BorderBeamThemeCase from '../browser/fixtures/BorderBeamThemeCase.svelte';

describe('BorderBeam theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} host content without decoration, DOM readers or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(BorderBeamThemeCase, { props: { sample } });

        expect(body).toContain('data-beam-theme="normal"');
        expect(body).toContain('data-beam-theme="external"');
        expect(body).toContain('Beam themed draft normal');
        expect(body).not.toContain('class="ant-border-beam');
        expect(body).not.toContain('aria-hidden="true"');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
