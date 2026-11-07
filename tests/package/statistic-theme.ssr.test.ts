import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-statistic-theme-reference.json';
import StatisticThemeCase from '../browser/fixtures/StatisticThemeCase.svelte';

describe('Statistic component theme public package SSR', () => {
  it('pins the official source used for component token expectations', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  it('renders shared Statistic tokens for values, loading and both Timer modes', () => {
    const sample = reference.cases.find(item => item.name === 'component-tokens')!;

    const { body } = render(StatisticThemeCase, { props: { sample } });

    expect(body).toContain('--ant-statistic-title-font-size:18px');
    expect(body).toContain('--ant-statistic-content-font-size:32px');
    expect(body).toContain('data-statistic-theme="loading"');
    expect(body).toContain('data-statistic-theme="timer"');
    expect(body).toContain('data-statistic-theme="countdown"');
    expect(body).toContain('1,234');
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without browser clocks or timer side effects`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(StatisticThemeCase, { props: { sample } });

        expect(body).toContain('data-statistic-theme="normal"');
        expect(body).toContain('data-statistic-theme="timer"');
        expect(body).toContain('data-statistic-theme="outside"');
        expect(body).toContain('statistic-title-font-size:');
        expect(body).toContain('statistic-content-font-size:');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
