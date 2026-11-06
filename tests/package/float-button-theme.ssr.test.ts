import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-float-button-theme-reference.json';
import FloatButtonThemeCase from '../browser/fixtures/FloatButtonThemeCase.svelte';

describe('FloatButton theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with native form controls and no browser effects`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(FloatButtonThemeCase, { props: { sample } });

        expect(body).toContain('Float theme action normal');
        expect(body).toContain('name="draft"');
        expect(body).toContain('value="Draft"');
        expect(body).toContain('ant-float-btn-group');
        expect(body).toContain('ant-float-btn-progress');
        expect(body).not.toContain('_themeStyle');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
