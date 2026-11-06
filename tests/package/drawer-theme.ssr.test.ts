import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-drawer-theme-reference.json';
import DrawerThemeCase from '../browser/fixtures/DrawerThemeCase.svelte';

describe('Drawer component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} panel content without opening a nonmodal dialog`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(DrawerThemeCase, { props: { sample } });
        const prefix = sample.config.cssVar?.prefix ?? 'ant';

        expect(body).toMatch(/<dialog\b[^>]*aria-modal="true"/);
        expect(body).not.toMatch(/<dialog\b[^>]*\sopen(?:\s|=|>)/);
        expect(body).toContain('Drawer title');
        expect(body).toContain('name="draft"');
        expect(body).toContain('value="Draft"');
        expect(body).toContain('ant-drawer-footer');
        expect(body).toContain(`--${prefix}-drawer-z-index-popup`);
        expect(body).toContain(`--${prefix}-drawer-footer-padding-block`);
        expect(body).toContain(`--${prefix}-drawer-footer-padding-inline`);
        expect(body).toContain(`--${prefix}-drawer-dragger-size`);
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
