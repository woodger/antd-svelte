import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-typography-theme-reference.json';
import TypographyThemeCase from '../browser/fixtures/TypographyThemeCase.svelte';

describe('Typography theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with native typography and no browser effects`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TypographyThemeCase, { props: { sample } });

        expect(body).toMatch(/<article /);
        expect(body).toMatch(/<h1 /);
        expect(body).toMatch(/<a [^>]*href="#typography-theme"/);
        expect(body).toContain('ant-typography-edit-content');
        expect(body).toContain('Editing draft</textarea>');
        expect(body).toContain('--ant-typography-title-margin-top');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
