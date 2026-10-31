import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Transfer, type TransferProps, type TransferItem, type TransferKey } from 'antd-svelte';
import TransferFixtures from '../browser/fixtures/TransferFixtures.svelte';

describe('Transfer public package SSR', () => {
  it('exports typed controlled keys, callbacks and metadata rendering', () => {
    const props: TransferProps<TransferItem> = {
      dataSource: [{ key: 0, title: 'Zero' }, { key: 'a', title: 'Alpha' }],
      targetKeys: ['a', 'missing'], selectedKeys: [0], status: '',
      render: item => ({ label: item.title, value: `search:${item.title}` })
    };
    const body = render(Transfer<TransferItem>, { props }).body;

    expect(body).toContain('ant-transfer-section');
    expect(body).toContain('title="search:Zero"');
    expect(body).toContain('aria-label="search:Zero" aria-checked="true"');
    expect(body).not.toContain('type="hidden"');
  });

  it('accepts arbitrary record interfaces with rowKey without an index signature', () => {
    interface Record { id: TransferKey; name: string; }
    const props: TransferProps<Record> = {
      dataSource: [{ id: 7n, name: 'Seven' }], targetKeys: [7n],
      rowKey: item => item.id, render: item => item.name
    };
    const body = render(Transfer<Record>, { props }).body;

    expect(body).toContain('title="Seven"');
    expect(body).toContain('aria-label="Seven"');
  });

  it('renders independent simple pagination from the built component', () => {
    const body = render(Transfer<{ key: number; title: string; }>, { props: {
      dataSource: Array.from({ length: 20 }, (_, key) => ({ key, title: `Item ${key}` })),
      pagination: { pageSize: 3 }, render: item => item.title
    } }).body;

    expect(body).toContain('ant-pagination-simple');
    expect(body).toContain('title="1/7"');
    expect(body).toContain('title="Item 2"');
    expect(body).not.toContain('title="Item 3"');
  });

  it('renders public fixture/configuration without browser globals or queued work', () => {
    vi.useFakeTimers();

    try {
      const body = render(TransferFixtures).body;

      expect(body).toContain('id="transfer-fixture"');
      expect(body).toContain('Transfer lists');
      expect(body).toContain('Bigint nine');
      expect(body).toContain('ant-transfer-css-var');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
