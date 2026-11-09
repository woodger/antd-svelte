import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Pagination, type PaginationProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-pagination-prefix-reference.json';
import PaginationPrefixSSRFixtures from '../browser/fixtures/PaginationPrefixSSRFixtures.svelte';

describe('Pagination local/shared prefixes', () => {
  it('pins Source states and live jumper identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(23);
    expect(reference.cases[0].result.normal.previousControl?.['font-family']).toBe('Arial');
    expect(reference.cases[0].nativeButtons.normal.previousControl?.['font-family']).toContain('BlinkMacSystemFont');
    expect(reference.transitions.every(step => step.sameRoot && step.sameQuick && step.sameActive
      && step.focused && step.value === '12')).toBe(true);
  });

  it('renders local states and controls without leaking prefix or adding leading text', () => {
    const props = {
      prefixCls: 'pages', total: 500, defaultCurrent: 5, showQuickJumper: true, showSizeChanger: false
    } satisfies PaginationProps;
    const rendered = render(Pagination, { props });
    const body = rendered.body;

    expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/^<nav/);
    expect(body).toContain('pages-item-active');
    expect(body).toContain('pages-options-quick-jumper');
    expect(body).toContain('ant-pagination-css-var');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('pagination-prefix:pages:ant');
  });

  it('uses independent private metric namespaces without browser work in SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(PaginationPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-pagination');
      expect(body).toContain('pages-item');
      expect(rendered.head).toContain('--inner-pagination-item-size-actual');
      expect(rendered.head).toContain('--suite-pagination-item-spacing-actual');
      expect(rendered.head).toContain('--ant-pagination-item-size');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
