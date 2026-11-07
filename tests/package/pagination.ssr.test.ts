import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Pagination, type PaginationProps } from 'antd-svelte';
import PaginationFeatures from '../browser/fixtures/PaginationFeaturesFixtures.svelte';

describe('Pagination source public package', () => {
  it('exports extended Props without changing pagination binding props', () => {
    const props: PaginationProps = {
      simple: { readOnly: true },
      total: 120,
      current: 2,
      pageSize: 10,
      align: 'end',
      showLessItems: true,
      responsive: true
    };
    const body = render(Pagination, { props }).body;

    expect(body).toContain('ant-pagination-simple');
    expect(body).toContain('ant-pagination-end');
    expect(body).toContain('title="2/12"');
  });

  it('renders the complete fixture without browser globals or scheduled work', () => {
    vi.useFakeTimers();

    try {
      const body = render(PaginationFeatures).body;

      expect(body).toContain('id="pagination-features-fixture"');
      expect(body).toContain('aria-label="Extended pagination"');
      expect(body).toContain('ant-pagination-item-6');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
