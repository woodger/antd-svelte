import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import {
  Cascader, CascaderPanel, type CascaderFieldNames, type CascaderOption, type CascaderProps
} from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-cascader-prefix-reference.json';
import CascaderPrefixSSRFixtures from '../browser/fixtures/CascaderPrefixSSRFixtures.svelte';

describe('Cascader/Panel local/shared prefixes', () => {
  it('pins Source styles and retained editor/popup/focus identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(30);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.samePopup && step.focused)).toBe(true);
  });

  it('retains raw local popup padding separately from the public zero-padding counterpart', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'local')!;

    expect(entry.result.normal.popup?.['padding-top']).toBe('4px');
    expect(entry.nativePadding?.normal.popup?.['padding-top']).toBe('0px');
  });

  it('retains raw Panel root direction separately from the HTML dir wrapper counterpart', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'panel-rtl')!;

    expect(entry.result.normal.root?.direction).toBe('ltr');
    expect(entry.nativeDirection?.normal.root?.direction).toBe('rtl');
  });

  it('renders local parts and a hidden defaultOpen popup without browser loading', () => {
    const loadData = vi.fn();
    const props = {
      prefixCls: 'paths', options: [{ value: 'a', label: 'Alpha', isLeaf: false }],
      defaultOpen: true, loadData
    } satisfies CascaderProps;
    const rendered = render(Cascader, { props });
    const body = rendered.body;

    expect(body).toContain('paths-input');
    expect(body).toContain('paths-menu-item');
    expect(body).toContain('ant-cascader-css-var');
    expect(body).toContain('popover="manual" hidden=');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('cascader-prefix:paths:paths:ant');
    expect(loadData).not.toHaveBeenCalled();
  });

  it('renders a local multiple Panel with checkbox semantics', () => {
    const rendered = render(CascaderPanel, { props: {
      prefixCls: 'paths', options: [{ value: 'a', label: 'Alpha' }], multiple: true
    } });
    const body = rendered.body;

    expect(body).toContain('paths-panel');
    expect(body).toContain('paths-checkbox');
    expect(body).toContain('role="menuitemcheckbox"');
    expect(rendered.head).toContain('cascader-prefix:paths:paths:ant');
  });

  it('passes the resolved Cascader owner prefix to a custom search renderer', () => {
    const searchRender = createRawSnippet<[
      string, CascaderOption[], string, Required<CascaderFieldNames>
    ]>((query, _path, prefix) => ({
      render: () => `<span data-render-prefix="${prefix()}">${query()}</span>`
    }));
    const rendered = render(Cascader, { props: {
      prefixCls: 'paths', options: [{ value: 'a', label: 'Alpha' }], defaultOpen: true,
      showSearch: { searchValue: 'a', render: searchRender }
    } });

    expect(rendered.body).toContain('data-render-prefix="paths"');
    expect(rendered.body).toContain('paths-menu-item');
  });

  it('isolates nested namespaces without browser resources', () => {
    vi.useFakeTimers();

    try {
      const rendered = render(CascaderPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-select-input');
      expect(body).toContain('paths-panel');
      expect(rendered.head).toContain('cascader-prefix:paths:paths:inner');
      expect(rendered.head).toContain('--ant-cascader-control-item-width');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
