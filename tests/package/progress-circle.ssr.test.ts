import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Progress } from 'antd-svelte';
import ProgressCirclePair from './ProgressCirclePair.svelte';
import ProgressCircleCase from '../browser/fixtures/ProgressCircleCase.svelte';

describe('Progress circle public package SSR', () => {
  it('renders source dashboard gaps and accessible values before hydration', () => {
    const { body } = render(Progress, { props: { type: 'dashboard', percent: 65 } });

    expect(body).toContain('ant-progress-circle');
    expect(body).toContain('aria-valuenow="65"');
    expect(body).toContain('transform: rotate(127.5deg)');
    expect(body).toContain('stroke-dasharray: 233.78685330464043px');
    expect(body).not.toContain('NaN');
  });

  it('renders success and remaining paths in source paint order', () => {
    const { body } = render(Progress, { props: {
      type: 'circle', percent: 70, success: { percent: 30, strokeColor: '#cc22ff' },
      strokeColor: '#ff2244'
    } });

    expect(body.indexOf('stroke: #ff2244')).toBeLessThan(body.indexOf('stroke: #cc22ff'));
    expect(body).toContain('opacity: 1');
    expect(body.match(/data-ant-progress-circle-path/g)).toHaveLength(2);
  });

  it('keeps independent gradient masks within one SSR render', () => {
    const { body } = render(ProgressCirclePair);
    const ids = [...body.matchAll(/<mask id="([^"]+)"/g)].map(match => match[1]);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(body).toContain(`mask="url(#${id})"`);
    expect(body).toContain('conic-gradient(from 217.5deg');
  });

  it('renders circular steps without browser work or the unused continuous rail', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(Progress, { props: {
        type: 'circle', percent: 40, steps: { count: 8, gap: 4 }
      } });

      expect(body.match(/data-ant-progress-circle-path/g)).toHaveLength(8);
      expect(body).not.toContain('class="ant-progress-circle-rail');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps tiny captions lazy and numeric values available without timers', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(Progress, { props: { type: 'circle', percent: 65, size: 16 } });

      expect(body).not.toContain('class="ant-progress-indicator');
      expect(body).toContain('aria-valuetext="65%"');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('applies circle tokens and semantic declarations with a local prefix on SSR', () => {
    const { body, head } = render(ProgressCircleCase, { props: { sample: {
      name: 'own', theme: 'own', semantic: true,
      props: { type: 'dashboard', percent: 65, prefixCls: 'source-progress' }
    } } });

    expect(body).toContain('--ant-progress-circle-text-font-size:1.3em');
    expect(body).toContain('source-progress-circle-rail');
    expect(body).toContain('padding-left:4px');
    expect(head).toContain('progress-prefix:source-progress');
  });
});
