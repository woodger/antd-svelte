import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Transfer from './Transfer.svelte';
import type { TransferItem, TransferListBodyProps, TransferListProps } from './transfer.types';

const records: TransferItem[] = [
  { key: 'a', title: 'Alpha' }, { key: 'b', title: 'Beta' },
  { key: 'locked', title: 'Locked', disabled: true }
];

describe('Transfer SSR', () => {
  it('renders two independent native lists in data/target order without form serialization', () => {
    const body = render(Transfer<TransferItem>, { props: {
      dataSource: records, targetKeys: ['locked', 'b'], render: item => item.title,
      selectedKeys: ['a', 'locked'], titles: ['Source', 'Target']
    } }).body;

    expect(body).toContain('ant-transfer-css-var');
    expect(body.indexOf('title="Locked"')).toBeLessThan(body.indexOf('title="Beta"'));
    expect(body).toContain('type="checkbox"');
    expect(body).toContain('aria-label="Alpha" aria-checked="true"');
    expect(body).toMatch(/disabled(?:="")? aria-label="Locked"/);
    expect(body).toContain('Source');
    expect(body).toContain('Target');
    expect(body).not.toContain('type="hidden"');
    expect(body).not.toContain('name=');
  });

  it('defaults to blank row content while retaining title/key fallback and empty state', () => {
    const body = render(Transfer<TransferItem>, { props: {
      dataSource: [{ key: 0, title: 'Title only' }]
    } }).body;

    expect(body).toContain('title="Title only"');
    expect(body).not.toContain('>Title only<');
    expect(body).toContain('ant-empty-normal');
    expect(body).toContain('ant-transfer-list-content-item-text');
  });

  it('applies initial search before SSR output and renders provided metadata/snippets', () => {
    const label = createRawSnippet<[TransferItem]>(item => ({
      render: () => `<strong>${item().title}</strong>`
    }));
    const body = render(Transfer<TransferItem>, { props: {
      dataSource: records, showSearch: { defaultValue: 'alpha' },
      render: item => ({ label, value: item.title?.toLowerCase() ?? '' })
    } }).body;

    expect(body).toContain('<strong>Alpha</strong>');
    expect(body).not.toContain('<strong>Beta</strong>');
    expect(body).toContain('title="alpha"');
    expect(body).toContain('value="alpha"');
  });

  it(
    'keeps only aria/data attributes on root and respects semantic style precedence',
    () => {
      const body = render(Transfer<TransferItem>, { props: {
        dataSource: records, 'data-testid': 'root', 'aria-label': 'Transfer', id: 'ignored',
        title: 'ignored title', class: 'local', rootClassName: 'extra',
        style: 'color:green',
        styles: { root: 'color:red', section: 'width:203px',
          source: { section: 'width:204px' }, actions: 'margin:2px' }
      } }).body;

      expect(body).toContain('data-testid="root"');
      expect(body).toContain('aria-label="Transfer"');
      expect(body).not.toContain('id="ignored"');
      expect(body).not.toContain('title="ignored title"');
      expect(body).toContain('color:red;color:green');
      expect(body).toContain('width:203px;width:204px');
      expect(body).toContain('width:203px');
      expect(body).toContain('margin:2px');
    }
  );

  it('renders oneWay remove controls and suppresses the second move action', () => {
    const body = render(Transfer<TransferItem>, { props: {
      dataSource: records, targetKeys: ['b'], render: item => item.title, oneWay: true,
      locale: { remove: 'Delete record' }
    } }).body;

    expect(body).toContain('ant-transfer-list-content-show-remove');
    expect(body).toContain('aria-label="Delete record"');
    expect(body).toContain('aria-label="right"');
    expect(body).not.toContain('aria-label="left"');
  });

  it('passes footer/list props and disables pagination for custom children', () => {
    const children = createRawSnippet<[TransferListBodyProps<TransferItem>]>(props => ({
      render: () => `<p>${props().direction}:${props().filteredItems.length}</p>`
    }));
    const footer = createRawSnippet<[TransferListProps<TransferItem>, { direction: string; }]>(
      (props, info) => ({
        render: () => `<p>footer:${info().direction}:${props().checkedKeys.length}</p>`
      })
    );
    const body = render(Transfer<TransferItem>, { props: {
      dataSource: records, targetKeys: ['b'], selectedKeys: ['a'], children, footer,
      pagination: true
    } }).body;

    expect(body).toContain('left:2');
    expect(body).toContain('right:1');
    expect(body).toContain('footer:left:1');
    expect(body).toContain('ant-transfer-list-body-customize-wrapper');
    expect(body).not.toContain('ant-pagination-simple');
  });

  it('renders zero-valued custom labels and uses defaults for false/null/empty labels', () => {
    const zero = render(Transfer<TransferItem>, { props: {
      dataSource: records, selectAllLabels: [0, () => 0]
    } }).body;
    const fallback = render(Transfer<TransferItem>, { props: {
      dataSource: records, selectAllLabels: [false, null]
    } }).body;

    expect(zero).not.toContain('3 элем.');
    expect(fallback).toContain('3 элем.');
  });

  it(
    'keeps explicit empty content and missing array sides empty rather than restoring Empty',
    () => {
      const blank = render(Transfer<TransferItem>, { props: {
        locale: { notFoundContent: undefined }
      } }).body;
      const half = render(Transfer<TransferItem>, { props: {
        locale: { notFoundContent: ['First side'] }
      } }).body;

      expect(blank).not.toContain('ant-empty-normal');
      expect(half).toContain('First side');
      expect(half).not.toContain('ant-empty-normal');
    }
  );

  it('never publishes changes or schedules browser work while rendering SSR', () => {
    const onChange = vi.fn();
    const onSelectChange = vi.fn();
    const onSearch = vi.fn();
    vi.useFakeTimers();

    try {
      render(Transfer<TransferItem>, { props: {
        dataSource: records, targetKeys: ['b'], selectedKeys: ['a'],
        pagination: true, showSearch: true, onChange, onSelectChange, onSearch
      } });

      expect(onChange).not.toHaveBeenCalled();
      expect(onSelectChange).not.toHaveBeenCalled();
      expect(onSearch).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
