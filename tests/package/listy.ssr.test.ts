import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Listy, type ListyProps } from 'antd-svelte';
import ListyFixture from './ListyFixture.svelte';

describe('Listy public package', () => {
  const itemRender = createRawSnippet<[number, number]>((item, index) => ({
    render: () => `<span>${item()}:${index()}</span>`
  }));

  it('exports generic readonly items and renders raw mode by default', () => {
    const NumberListy = Listy<number>;
    const props: ListyProps<number> = {
      items: Object.freeze([0, 1]), rowKey: item => item, itemRender
    };
    const body = render(NumberListy, { props }).body;

    expect(body).toContain('data-key="item:0"');
    expect(body).toContain('<span>1:1</span>');
    expect(body).toContain('dir="ltr"');
    expect(body).not.toContain('ant-listy-holder');
  });

  it('renders an estimated virtual window and its scrollbar during SSR', () => {
    const body = render(ListyFixture, { props: { variant: 'virtual' } }).body;

    expect(body.match(/class="ant-listy-item /g)).toHaveLength(6);
    expect(body).toContain('height:920px');
    expect(body).toContain('ant-listy-scrollbar-visible');
    expect(body).toContain('position:static;color:green;position:relative');
    expect(body).not.toContain('group-header-fixed');
    expect(body).not.toContain('data-key=');
  });

  it('merges inherited semantics while callbacks receive raw virtual props', () => {
    const body = render(ListyFixture).body;

    expect(body).toContain('provider-listy provider-root');
    expect(body).toContain('provider-item local-item');
    expect(body).toContain('overflow-anchor:none;padding:1px;color:red;position:static;color:green');
    expect(body).toContain('color:blue');
  });

  it('groups noncontiguous entries and passes original indexes to compiled snippets', () => {
    const body = render(ListyFixture, { props: { variant: 'group' } }).body;

    expect(body.indexOf('Item 2:2')).toBeLessThan(body.indexOf('Item 1:1'));
    expect(body).toContain('Group 0:2');
    expect(body).toContain('Group :1');
    expect(body).toContain('ant-listy-group-header-sticky');
    expect(body).toContain('provider-header local-header');
  });

  it.each([undefined, 0])('keeps all virtual-branch rows without a truthy height (%s)', height => {
    const NumberListy = Listy<number>;
    const body = render(NumberListy, {
      props: { items: [0, 1], rowKey: item => item, itemRender, virtual: true, height }
    }).body;

    expect(body).toContain('ant-listy-holder-inner');
    expect(body).toContain('<span>0:0</span>');
    expect(body).toContain('<span>1:1</span>');
    expect(body).not.toContain('max-height:0px');
    expect(body).not.toContain('scrollbar-thumb');
  });

  it('renders an empty container without creating browser resources or a custom empty state', () => {
    vi.useFakeTimers();
    try {
      const NumberListy = Listy<number>;
      const body = render(NumberListy, {
        props: { items: [], rowKey: item => item, itemRender, virtual: true, height: 200 }
      }).body;

      expect(body).toContain('ant-listy-holder-inner');
      expect(body).not.toContain('ant-empty');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
