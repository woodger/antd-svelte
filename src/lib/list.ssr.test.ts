import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import List from './List.svelte';
import ListItem from './ListItem.svelte';
import ListItemMeta from './ListItemMeta.svelte';

const item = createRawSnippet<[unknown, number]>((value, index) => ({
  render: () => `<li>${String(value())}:${index()}</li>`
}));

describe('List SSR', () => {
  it('renders the source simple Empty image without forwarding locale or extra', () => {
    const body = render(List, { props: { locale: { emptyText: 0 }, extra: 'ignored' } }).body;

    expect(body).toContain('ant-list-empty-text');
    expect(body).toContain('ant-empty-normal');
    expect(body).not.toContain('locale=');
    expect(body).not.toContain('extra=');
    expect(body).not.toContain('ignored');
  });

  it('paginates primitive readonly records with page-local render indices', () => {
    const body = render(List, {
      props: {
        dataSource: Object.freeze(['A', 'B', 'C']),
        renderItem: item,
        pagination: { defaultCurrent: 2, defaultPageSize: 2 }
      }
    }).body;

    expect(body).toContain('<li>C:0</li>');
    expect(body).not.toContain('<li>A:');
    expect(body).toContain('ant-pagination-end');
  });

  it('appends children after records and keeps numeric zero header and footer', () => {
    const body = render(List, {
      props: {
        dataSource: ['A'],
        renderItem: item,
        children: 'After records',
        header: 0,
        footer: 0
      }
    }).body;

    expect(body.indexOf('After records')).toBeGreaterThan(body.indexOf('<li>A:0</li>'));
    expect(body).toMatch(/ant-list-header[^>]*>.*?0/s);
    expect(body).toMatch(/ant-list-footer[^>]*>.*?0/s);
    expect(body).toContain('ant-list-something-after-last-item');
  });

  it('keeps a data container when renderItem is absent and omits Empty', () => {
    const body = render(List, { props: { dataSource: ['A'] } }).body;

    expect(body).toContain('ant-list-items');
    expect(body).not.toContain('ant-list-empty-text');
  });

  it('replaces only bottom pagination with loadMore', () => {
    const body = render(List, {
      props: {
        dataSource: ['A'],
        renderItem: item,
        loadMore: 'Load more',
        pagination: { position: 'both' }
      }
    }).body;

    expect(body.match(/<div[^>]*class="ant-list-pagination(?:\s|")/g)).toHaveLength(1);
    expect(body).toContain('Load more');
  });

  it('uses a loading stub and never creates callbacks, media subscriptions or timers', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    try {
      const body = render(List, {
        props: { loading: true, grid: { xs: 1 }, pagination: { onChange } }
      }).body;

      expect(body).toContain('min-height:53px');
      expect(body).not.toContain('ant-list-empty-text');
      expect(body).toContain('ant-list-loading');
      expect(onChange).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('ListItem and Meta SSR', () => {
  it('renders mixed text arrays as no-flex while retaining numeric children as flex', () => {
    const child = createRawSnippet(() => ({ render: () => '<span>child</span>' }));
    const text = render(ListItem, { props: { children: ['text', child] } }).body;
    const number = render(ListItem, { props: { children: [0, child] } }).body;

    expect(text).toContain('ant-list-item-no-flex');
    expect(number).not.toContain('ant-list-item-no-flex');
    expect(number).toContain('0');
  });

  it('keeps action slots and separators including empty actions', () => {
    const body = render(ListItem, { props: { actions: ['A', null, 'B'] } }).body;

    expect(body).toContain('ant-list-item-action');
    expect(body.match(/class="ant-list-item-action-split"/g)).toHaveLength(2);
  });

  it('renders zero Meta parts with h4 title and ignores Meta children', () => {
    const body = render(ListItemMeta, {
      props: { avatar: 0, title: 0, description: 0, children: 'ignored' }
    }).body;

    expect(body).toContain('ant-list-item-meta-avatar');
    expect(body).toContain('<h4 class="ant-list-item-meta-title"');
    expect(body).toContain('ant-list-item-meta-description');
    expect(body).not.toContain('ignored');
  });

  it('omits empty Meta sections and preserves true presence', () => {
    const empty = render(ListItemMeta, {
      props: { avatar: false, title: '', description: null }
    }).body;
    const present = render(ListItemMeta, { props: { title: true } }).body;

    expect(empty).not.toContain('ant-list-item-meta-content');
    expect(empty).not.toContain('ant-list-item-meta-avatar');
    expect(present).toContain('ant-list-item-meta-title');
  });
});
