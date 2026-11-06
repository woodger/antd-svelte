import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-modal-theme-reference.json';
import ModalThemeCase from '../browser/fixtures/ModalThemeCase.svelte';

describe('Modal component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} content without opening a nonmodal dialog`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(ModalThemeCase, { props: { sample } });
        const prefix = sample.config.cssVar?.prefix ?? 'ant';

        expect(body).toMatch(/<dialog\b[^>]*aria-modal="true"/);
        expect(body).not.toMatch(/<dialog\b[^>]*\sopen(?:\s|=|>)/);
        expect(body).toContain('Modal title');
        expect(body).toContain('name="draft"');
        expect(body).toContain('value="Draft"');
        expect(body).toContain('ant-modal-close-x');
        expect(body).toContain('ant-modal-footer');
        expect(body).toContain(`--${prefix}-modal-title-font-size`);
        expect(body).toContain(`--${prefix}-modal-content-bg`);
        expect(body).toContain(`--${prefix}-modal-body-padding`);
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
