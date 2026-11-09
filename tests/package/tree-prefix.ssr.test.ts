import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Tree, type TreeProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-prefix-reference.json';
import TreePrefixSSRFixtures from '../browser/fixtures/TreePrefixSSRFixtures.svelte';

describe('Tree local/shared prefixes', () => {
  it('pins Source nodes/styles and retained focus surfaces', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(21);
    expect(reference.transitions.every(step => step.sameRoot && step.sameFocus && step.sameTitle
      && step.focused)).toBe(true);
  });

  it('retains raw internal-list styles separately from public root style counterparts', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'user-style')!;

    expect(entry.result.normal.tree.root?.['background-color']).toBe('rgb(255, 255, 255)');
    expect(entry.nativeRoot?.normal.tree.root?.['background-color']).toBe('rgb(255, 251, 230)');
  });

  it('renders local parts and ARIA associations without leaking prefix or loading children in SSR', () => {
    const loadData = vi.fn().mockResolvedValue(undefined);
    const props = {
      prefixCls: 'nodes', treeData: [{ key: 'p', title: 'Parent', isLeaf: false }],
      defaultExpandedKeys: ['p'], checkable: true, loadData
    } satisfies TreeProps;
    const rendered = render(Tree, { props });
    const body = rendered.body;

    expect(body).toContain('nodes-treenode');
    expect(body).toContain('nodes-checkbox-inner');
    expect(body).toContain('ant-tree-css-var');
    expect(body).toContain('role="treeitem"');
    expect(body).toContain('aria-labelledby=');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('tree-prefix:nodes:ant');
    expect(loadData).not.toHaveBeenCalled();
  });

  it('keeps raw nonselectable selection separate from the public per-node readonly counterpart', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'no-select')!;

    expect(entry.result.normal.tree.nodes.Beta.content?.['background-color'])
      .toBe('rgba(0, 0, 0, 0)');
    expect(entry.nativeSelection?.normal.tree.nodes.Beta.content?.['background-color'])
      .toBe('rgb(230, 244, 255)');
  });

  it('isolates nested root scopes and preserves the TreeSelect CSS adapter without browser timers', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(TreePrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-tree-treenode');
      expect(body).toContain('nodes-checkbox');
      expect(body).toContain('ant-select');
      expect(rendered.head).toContain('tree-prefix:nodes:inner');
      expect(rendered.head).toContain('--ant-tree-title-height');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
