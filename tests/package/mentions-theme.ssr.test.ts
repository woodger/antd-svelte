import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-mentions-theme-reference.json';
import MentionsThemeCase from '../browser/fixtures/MentionsThemeCase.svelte';

describe('Mentions component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with native form text and no browser resources`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(MentionsThemeCase, { props: { sample, autoSize: true } });
        const prefix = sample.config.cssVar?.prefix ?? 'ant';

        expect(body).toContain('aria-label="Themed Mentions"');
        expect(body).toContain('name="mention"');
        expect(body).toContain('Draft</textarea>');
        expect(body).toContain(`--${prefix}-mentions-input-font-size`);
        expect(body).not.toMatch(/class="[^"]*\bant-mentions-dropdown\b/);
        expect(body).not.toContain('name="mentions-measure"');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
