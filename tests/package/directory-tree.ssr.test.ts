import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-directory-tree-reference.json';
import release from '../browser/fixtures/ant-design-directory-tree-control-release-observation.json';
import DirectoryTreeScope from '../browser/fixtures/DirectoryTreeScope.svelte';

describe('DirectoryTree SSR', () => {
  it('pins source directory behavior and the control-release observation', () => {
    for (const evidence of [reference.reference, release.reference]) {
      expect(evidence).toMatchObject({
        version: registry.upstream.version,
        revision: registry.upstream.revision,
        archiveSha256: registry.upstream.archiveSha256,
        delegate: '@rc-component/tree 1.4.0'
      });
    }
    expect(reference.cases).toHaveLength(15);
    expect(release.cases).toHaveLength(2);
    expect(release.reference.controlledStateReference).toBe('@rc-component/util 1.14.0');
    for (const entry of release.cases) {
      expect(entry.errors).toEqual(["Cannot read properties of undefined (reading 'includes')"]);
    }
  });

  it.each(reference.cases)('renders $sample.id without selection callbacks or loading', ({ sample }) => {
    vi.useFakeTimers();
    try {
      const body = render(DirectoryTreeScope, { props: { sample } }).body;

      expect(body).toContain('Folder 0');
      expect(body).toContain('-tree-directory');
      expect(body).toContain('directory-user-array directory-user-object');
      const events = /<pre[^>]*data-directory-events[^>]*>([\s\S]*?)<\/pre>/.exec(body);
      expect(events?.[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('[]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
