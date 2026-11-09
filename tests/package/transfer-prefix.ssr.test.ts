import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Transfer, type TransferProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-transfer-prefix-reference.json';
import TransferPrefixSSRFixtures from '../browser/fixtures/TransferPrefixSSRFixtures.svelte';

describe('Transfer local/shared prefixes', () => {
  it('pins Source styles and retained search/checkbox identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(20);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.sameCheckbox && step.focused)).toBe(true);
  });

  it('renders local owner classes with independent shared controls without publishing callbacks', () => {
    const onChange = vi.fn();
    const props = {
      prefixCls: 'lists', dataSource: [{ key: 'a', title: 'Alpha' }],
      targetKeys: [], render: item => item.title, showSearch: true, onChange
    } satisfies TransferProps;
    const rendered = render(Transfer, { props });
    const body = rendered.body;

    expect(body).toContain('lists-section');
    expect(body).toContain('ant-checkbox-input');
    expect(body).toContain('ant-input');
    expect(body).toContain('ant-transfer-css-var');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('transfer-prefix:lists:ant');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('isolates nested Transfer/Checkbox/Input/Pagination prefixes without browser timers', () => {
    vi.useFakeTimers();

    try {
      const rendered = render(TransferPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-transfer-section');
      expect(body).toContain('suite-input');
      expect(body).toContain('lists-section');
      expect(body).toContain('inner-checkbox-input');
      expect(body).toContain('inner-pagination-simple-pager');
      expect(rendered.head).toContain('transfer-prefix:lists:inner');
      expect(rendered.head).toContain('--ant-transfer-list-width');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
