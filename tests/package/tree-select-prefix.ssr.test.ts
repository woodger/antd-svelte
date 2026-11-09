import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { TreeSelect, type TreeSelectProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-select-prefix-reference.json';
import TreeSelectPrefixSSRFixtures from '../browser/fixtures/TreeSelectPrefixSSRFixtures.svelte';

describe('TreeSelect local/shared prefixes', () => {
  it('pins Source styles and retained editor/popup/focus identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(26);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.samePopup && step.focused)).toBe(true);
  });

  it('retains the raw missing local tree style separately from the inherited-prefix counterpart', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'local')!;

    expect(entry.result.normal.tree?.height).toBe('110px');
    expect(entry.result.normal.tree?.['background-color']).toBe('rgba(0, 0, 0, 0)');
    expect(entry.nativeTreeStyles?.normal.tree?.height).toBe('140px');
    expect(entry.nativeTreeStyles?.normal.tree?.['background-color']).toBe('rgb(255, 255, 255)');
  });

  it('renders local Select classes and the existing hidden defaultOpen SSR tree without loading data', () => {
    const loadData = vi.fn().mockResolvedValue(undefined);
    const props = {
      prefixCls: 'choices', treeData: [{ value: 'a', title: 'Alpha' }],
      defaultValue: 'a', defaultOpen: true, loadData
    } satisfies TreeSelectProps;
    const rendered = render(TreeSelect, { props });
    const body = rendered.body;

    expect(body).toContain('choices-input');
    expect(body).toContain('ant-select-css-var');
    expect(body).toContain('ant-tree-select-css-var');
    expect(body).toContain('aria-expanded="true"');
    expect(body).toContain('role="tree"');
    expect(body).toContain('popover="manual" hidden=');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('tree-select-prefix:choices:ant');
    expect(loadData).not.toHaveBeenCalled();
  });

  it('isolates nested owner/private namespaces without browser resources', () => {
    vi.useFakeTimers();

    try {
      const rendered = render(TreeSelectPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-select-input');
      expect(body).toContain('choices-input');
      expect(body).toContain('--inner-select-height');
      expect(rendered.head).toContain('tree-select-prefix:choices:inner');
      expect(rendered.head).toContain('--ant-tree-select-title-height');
      expect(rendered.head).toContain('.ant-tree-node-content-wrapper');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
