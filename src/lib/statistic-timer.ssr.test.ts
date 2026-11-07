import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import StatisticTimer from './StatisticTimer.svelte';

describe('Statistic timer SSR', () => {
  it.each(['countdown', 'countup'] as const)(
    'renders a stable placeholder without scheduling timers or calling callbacks',
    type => {
      vi.useFakeTimers();
      try {
        const onChange = vi.fn();
        const onFinish = vi.fn();
        const body = render(
          StatisticTimer,
          { props: { type, value: 1000, title: 'Time', onChange, onFinish } }
        ).body.replace(
          /<!--.*?-->/g,
          ''
        );
        expect(body).toMatch(/class="ant-statistic-content-value[^"]*">-<\/span>/);
        expect(body).toContain('Time');
        expect(onChange).not.toHaveBeenCalled();
        expect(onFinish).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    }
  );
});
