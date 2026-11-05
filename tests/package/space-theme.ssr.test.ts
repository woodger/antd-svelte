import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-space-theme-reference.json';
import SpaceThemeCase from '../browser/fixtures/SpaceThemeCase.svelte';

describe('Space configuration and theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} gaps and semantic scopes without refs or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(SpaceThemeCase, { props: { sample } });

        expect(body).toContain('data-space-theme="default"');
        expect(body).toContain('ant-space-item-separator');
        expect(body).toContain('Space theme ref default">empty</output>');
        expect(body).toContain('local-compact');
        if (sample.name === 'config-functions') {
          expect(body).toContain('ctx-horizontal-center-15-large');
          expect(body).toContain('ctx-vertical-unset-15-large');
        }
        if (sample.name === 'custom-css-prefix') {
          expect(body).toContain('space-probe');
          expect(body).toContain('--owned-padding-xs:14px');
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
