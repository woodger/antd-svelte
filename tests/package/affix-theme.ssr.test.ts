import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-affix-theme-reference.json';
import AffixThemeCase from '../browser/fixtures/AffixThemeCase.svelte';

describe('Affix theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} in flow without a placeholder, fixed class or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(AffixThemeCase, { props: { sample } });

        expect(body).toContain('Affix themed draft normal');
        expect(body).toContain('data-affix-theme="normal"');
        expect(body.match(/name="affix-normal"/g)).toHaveLength(1);
        expect(body).not.toContain('theme-affix-fixed');
        expect(body).not.toContain('aria-hidden="true"');
        expect(body).not.toContain('position:fixed');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
