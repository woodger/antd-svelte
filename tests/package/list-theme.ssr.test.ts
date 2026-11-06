import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-list-theme-reference.json';
import ListThemeCase from '../browser/fixtures/ListThemeCase.svelte';

describe('List theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with native keyed rows and no browser effects`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(ListThemeCase, { props: { sample } });

        expect(body).toMatch(/<ul [^>]*ant-list-items/);
        expect(body).toMatch(/<li [^>]*ant-list-item/);
        expect(body).toContain('ant-list-item-meta-title');
        expect(body).toContain('List theme draft normal Alpha');
        expect(body).toContain('value="Draft"');
        expect(body).toContain('--ant-list-item-padding');
        expect(body).toContain('No records');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
