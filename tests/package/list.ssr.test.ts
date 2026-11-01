import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { List, type ListProps, type RenderEmptyHandler } from 'antd-svelte';
import ListFixture from './ListFixture.svelte';

describe('List public package', () => {
  it('exports generic readonly data and snippet rendering props', () => {
    const NumberList = List<number>;
    const props: ListProps<number> = { dataSource: Object.freeze([0, 1]), pagination: null };
    const item = createRawSnippet<[number, number]>((value, index) => ({
      render: () => `<li>${String(value())}:${index()}</li>`
    }));
    const body = render(NumberList, { props: { ...props, renderItem: item } }).body;

    expect(body).toContain('<li>0:0</li>');
    expect(body).toContain('<li>1:1</li>');
    expect(body).not.toContain('ant-list-pagination');
  });

  it('inherits List size and item semantic slots through compiled snippets', () => {
    const body = render(ListFixture).body;

    expect(body).toContain('ant-list-sm');
    expect(body).toContain('provider-list');
    expect(body).toContain('provider-actions local-actions');
    expect(body).toContain('provider-extra local-extra');
    expect(body).toContain('color:pink;color:blue');
    expect(body).toContain('padding:1px;padding:2px');
    expect(body).not.toContain('ignored');
  });

  it('keeps SSR grid at the base column and wraps each item in Col', () => {
    const body = render(ListFixture, { props: { variant: 'grid' } }).body;

    expect(body).toContain('ant-list-grid');
    expect(body).toContain('width:50%;max-width:50%');
    expect(body).toContain('margin-inline:-8px');
    expect(body).toMatch(/<div[^>]*class="ant-col /);
  });

  it('resolves mixed array children during SSR without DOM measurement', () => {
    const body = render(ListFixture, { props: { variant: 'mixed' } }).body;

    expect(body.match(/ant-list-item-no-flex/g)).toHaveLength(2);
    expect(body).toContain('Lead ');
  });

  it('calls renderEmpty only for empty collections and passes the source component name', () => {
    const renderEmpty = vi.fn<RenderEmptyHandler>(name => `Empty for ${name}`);
    const full = render(ListFixture, { props: { renderEmpty } }).body;

    expect(full).toContain('Alpha');
    expect(renderEmpty).not.toHaveBeenCalled();

    const empty = render(ListFixture, { props: { variant: 'empty', renderEmpty } }).body;

    expect(empty).toContain('Empty for List');
    expect(renderEmpty).toHaveBeenCalledWith('List');
  });

  it('gives locale empty content priority over the shared empty producer', () => {
    const renderEmpty = vi.fn<RenderEmptyHandler>(() => 'Shared empty');
    const body = render(ListFixture, { props: { variant: 'local-empty', renderEmpty } }).body;

    expect(body).toContain('Own empty');
    expect(body).not.toContain('Shared empty');
    expect(renderEmpty).not.toHaveBeenCalled();
  });

  it('creates no browser resources while rendering compiled grid and item contexts', () => {
    vi.useFakeTimers();

    try {
      const body = render(ListFixture, { props: { variant: 'grid' } }).body;

      expect(body).toContain('Alpha');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
