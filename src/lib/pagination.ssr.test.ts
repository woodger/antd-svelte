import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination.svelte';
import type { PaginationProps, PaginationSizeChangerInfo } from './pagination.types';

describe('Pagination source SSR', () => {
  it('renders the source middle window with native buttons and page classes', () => {
    const body = render(Pagination, { props: { total: 200, current: 10 } }).body;

    expect(body).toContain('ant-pagination-item-9');
    expect(body).toContain('ant-pagination-item-10');
    expect(body).toContain('ant-pagination-item-11');
    expect(body).not.toContain('ant-pagination-item-8 ');
    expect(body).toContain('aria-current="page"');
    expect(body).toContain('ant-pagination-css-var');
    expect(body).toContain('ant-pagination-jump-prev');
  });

  it('renders simple read-only totals including the source empty 1/0 counter', () => {
    const body = render(Pagination, { props: { total: 0, simple: { readOnly: true } } }).body;

    expect(body).toContain('ant-pagination-simple');
    expect(body).toContain('title="1/0"');
    expect(body).not.toContain('type="text"');
    expect(body).not.toContain('aria-current="page"');
  });

  it('hides one-page collections without creating a navigation wrapper', () => {
    expect(render(Pagination, { props: { total: 5, hideOnSinglePage: true } }).body)
      .not.toContain('<nav');
  });

  it('keeps legacy normalization while disabling the source no-data page', () => {
    const body = render(Pagination, {
      props: { total: Number.NaN, current: -1, pageSize: 0 }
    }).body;

    expect(body).toContain('ant-pagination-item-1');
    expect(body).toContain('ant-pagination-item-disabled');
    expect(body).not.toContain('aria-current="page"');
  });

  it('renders locale aliases, quick jumper and confirmation without native form names', () => {
    const body = render(Pagination, {
      props: {
        total: 100,
        showQuickJumper: { goButton: true },
        showSizeChanger: false,
        locale: {
          jump_to: 'Jump here',
          jump_to_confirm: 'Confirm',
          page: 'pages',
          prev_page: 'Back',
          next_page: 'Forward'
        }
      }
    }).body;

    expect(body).toContain('Jump here');
    expect(body).toContain('Confirm');
    expect(body).toContain('pages');
    expect(body).toContain('aria-label="Back"');
    expect(body).not.toContain('name=');
  });

  it('accepts string size options and retains the established sorted size contract', () => {
    const changer = createRawSnippet<[PaginationSizeChangerInfo]>(info => ({
      render: () => `<p>${info().value}:${info().options.map(option => option.value).join(',')}</p>`
    }));
    const body = render(Pagination, {
      props: {
        total: 51,
        pageSize: 10,
        pageSizeOptions: ['50', '10', '20'],
        components: { sizeChanger: changer }
      }
    }).body;

    expect(body).toContain('10:10,20,50');
  });

  it('renders simple quick navigation without nesting list items inside the jumper', () => {
    const body = render(Pagination, {
      props: {
        total: 200,
        current: 6,
        simple: { readOnly: true },
        showQuickJumper: { goButton: true },
        showSizeChanger: false
      }
    }).body;
    const quick = body.match(/<div[^>]*class="ant-pagination-options-quick-jumper[^>]*>(.*?)<\/div>/s);

    expect(quick).not.toBeNull();
    expect(quick?.[1]).toContain('type="text"');
    expect(quick?.[1]).toContain('подтвердить');
    expect(quick?.[1]).toMatch(/<span[^>]*class="ant-pagination-simple-pager/);
    expect(quick?.[1]).not.toContain('<li');
  });

  it('applies semantic root to nav and keeps the established class on ul', () => {
    const body = render(Pagination, {
      props: {
        total: 20,
        class: 'legacy-list',
        rootClassName: 'root-extra',
        style: 'padding:2px',
        classNames: { root: 'semantic-root', item: 'semantic-page' },
        styles: { root: 'padding:1px', item: 'color:red' }
      }
    }).body;

    expect(body).toMatch(/<nav[^>]*class="root-extra semantic-root(?:\s|")/);
    expect(body).toMatch(/<ul[^>]*legacy-list/);
    expect(body).toContain('padding:1px;padding:2px');
    expect(body).toContain('semantic-page');
    expect(body).toContain('color:red');
  });

  it('passes raw defaults and explicit size to semantic callbacks', () => {
    const classNames: PaginationProps['classNames'] = ({ props }) => ({
      root: `total-${props.total}-less-${props.showLessItems}-size-${props.size}`
    });
    const body = render(Pagination, { props: { classNames, size: 'large' } }).body;

    expect(body).toContain('total-undefined-less-undefined-size-large');
  });

  it('never calls changes or starts media/listener/timer work on the server', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const onShowSizeChange = vi.fn();

    try {
      render(Pagination, {
        props: {
          total: 100,
          responsive: true,
          simple: true,
          showQuickJumper: true,
          onChange,
          onShowSizeChange
        }
      });

      expect(onChange).not.toHaveBeenCalled();
      expect(onShowSizeChange).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
