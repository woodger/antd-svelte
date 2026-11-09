import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Table } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-table-prefix-reference.json';
import TablePrefixSSRFixtures from '../browser/fixtures/TablePrefixSSRFixtures.svelte';

describe('Table local/shared prefixes', () => {
  it('pins Source paint and live draft identity to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(23);
    expect(reference.transitions.every(step => step.sameRoot && step.sameTable
      && step.sameInput && step.sameCheckbox && step.focused)).toBe(true);
    expect(reference.transitions.every(step => step.value === 'Retained draft')).toBe(true);
  });

  it('keeps the raw Source custom filter menu style omission separate from its public counterpart', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'dropdown-popup')!;

    expect(entry.result.normal.filterMenu?.['background-color']).toBe('rgba(0, 0, 0, 0)');
    expect(entry.inheritedDropdown?.normal.filterMenu?.['background-color'])
      .toBe('rgb(255, 255, 255)');
  });

  it('renders local classes and a head stylesheet while preserving canonical theme markers', () => {
    const result = render(Table<{ key: string }>, { props: {
      prefixCls: 'grid', dropdownPrefixCls: 'filters', dataSource: [{ key: 'one' }],
      columns: [{ key: 'key', title: 'Key', dataIndex: 'key' }], pagination: false
    } });
    const body = result.body;
    const head = result.head;

    expect(body).toContain('grid-wrapper ant-table-css-var');
    expect(body).toContain('grid-thead');
    expect(body).toContain('grid-row');
    expect(body).not.toContain('prefixCls=');
    expect(body).not.toContain('dropdownPrefixCls=');
    expect(head).toContain('.grid-wrapper:where(');
    expect(head).toContain('--ant-table-header-bg');
  });

  it('keeps nested owner scopes independent from shared Checkbox namespaces without SSR timers', () => {
    vi.useFakeTimers();
    try {
      const result = render(TablePrefixSSRFixtures);
      const body = result.body;
      const head = result.head;

      expect(body).toContain('suite-table-wrapper');
      expect(body).toContain('grid-wrapper');
      expect(body).toContain('suite-checkbox-wrapper');
      expect(body).toContain('inner-checkbox-wrapper');
      expect(head).toContain('[data-ant-table-prefix="grid"]'
        + '[data-ant-table-root-prefix="suite"]');
      expect(head).toContain('[data-ant-table-prefix="grid"]'
        + '[data-ant-table-root-prefix="inner"]');
      expect(body).not.toContain('[object Object]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
