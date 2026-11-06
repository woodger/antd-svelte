import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-theme-reference.json';
import TreeThemeCase from '../browser/fixtures/TreeThemeCase.svelte';

describe('Tree theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with native nodes and no browser loading or effects`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TreeThemeCase, { props: { sample } });

        expect(body).toContain('role="tree"');
        expect(body).toContain('role="treeitem"');
        expect(body).toContain('role="checkbox"');
        expect(body).toContain('ant-tree-checkbox-indeterminate');
        expect(body).toContain('--ant-tree-title-height');
        expect(body).toContain('Themed Tree normal');
        expect(body).not.toContain('_themeStyle');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
