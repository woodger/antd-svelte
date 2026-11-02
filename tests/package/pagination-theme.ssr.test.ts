import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import PaginationThemeFixture from './PaginationThemeFixture.svelte';

describe('Source Pagination theme SSR', () => {
  it('renders defaults on native navigation and inherits them on the styled list', () => {
    const { body, head } = render(PaginationThemeFixture);

    expect(body).toContain('<nav');
    expect(body).toContain('pagination-ssr');
    expect(body).toContain('--ant-pagination-item-size:32px');
    expect(body).toContain('--ant-pagination-item-size:inherit');
    expect(body).toContain('--ant-pagination-padding-inline:11px');
    expect(body).toContain('ant-pagination-source-theme');
    expect(body).toContain('aria-current="page"');
    expect(body).toContain('ant-pagination-simple-pager');
    expect(head).toContain('data-ant-svelte-theme="pagination-ssr"');
  });

  it('uses compact item and input metrics before hydration', () => {
    const { body } = render(PaginationThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-pagination-item-size:28px');
    expect(body).toContain('--ant-pagination-item-size-sm:21px');
    expect(body).toContain('--ant-pagination-item-size-lg:35px');
    expect(body).toContain('--ant-pagination-input-font-size:12px');
  });

  it('applies source overrides including the quick-jumper Input defaults', () => {
    const { body } = render(PaginationThemeFixture, { props: { preset: 'own-tokens' } });

    expect(body).toContain('--ant-pagination-item-active-color:#eeeeee');
    expect(body).toContain('--ant-pagination-item-size:38px');
    expect(body).toContain('--ant-pagination-padding-inline:14px');
    expect(body).toContain('--ant-pagination-active-shadow:0 0 0 3px #884411');
  });

  it('uses global wireframe independently from component aliases', () => {
    const global = render(PaginationThemeFixture, { props: { preset: 'wireframe-own-false' } });
    const local = render(PaginationThemeFixture, { props: { preset: 'wireframe-own-true' } });

    expect(global.body).toContain('ant-pagination-bordered');
    expect(global.body).toContain('--ant-pagination-item-bg:#b5f5ec');
    expect(local.body).not.toContain('ant-pagination-bordered');
  });

  it('keeps zero dimensions and inherits explicitly undefined component values', () => {
    const zero = render(PaginationThemeFixture, { props: { preset: 'zero' } }).body;
    const missing = render(PaginationThemeFixture, { props: { preset: 'undefined' } }).body;

    expect(zero).toContain('--ant-pagination-item-size:0px');
    expect(zero).toContain('--ant-pagination-padding-inline:0px');
    expect(missing).toContain('--ant-pagination-item-active-color:inherit');
    expect(missing).not.toContain('--ant-pagination-item-size:32px');
  });

  it('bridges custom CSS prefixes and preserves runtime lengths', () => {
    const prefix = render(PaginationThemeFixture, { props: { preset: 'custom-prefix' } }).body;
    const lengths = render(PaginationThemeFixture, { props: { preset: 'css-lengths' } }).body;

    expect(prefix).toContain('--paging-2-pagination-item-size:36px');
    expect(prefix).toContain('--ant-pagination-item-size:var(--paging-2-pagination-item-size)');
    expect(lengths).toContain('--ant-pagination-item-size:2.5em');
    expect(lengths).toContain('--ant-pagination-padding-inline:1em');
  });

  it('keeps native root styles after defaults and before inherited list declarations', () => {
    const { body } = render(PaginationThemeFixture, { props: { semantic: true } });

    expect(body).toContain('--ant-pagination-item-size:41px;--ant-pagination-item-size:47px');
    expect(body.indexOf('--ant-pagination-item-size:32px')).toBeLessThan(
      body.indexOf('--ant-pagination-item-size:47px')
    );
    expect(body.indexOf('--ant-pagination-item-size:47px')).toBeLessThan(
      body.indexOf('--ant-pagination-item-size:inherit')
    );
  });

  it('preserves native-only themes without source scopes or declarations', () => {
    const { body, head } = render(PaginationThemeFixture, { props: { native: true } });

    expect(body).not.toContain('ant-pagination-source-theme');
    expect(body).not.toContain('--ant-pagination-item-size:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
