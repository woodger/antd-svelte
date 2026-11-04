import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import SliderPrefixCase from '../browser/fixtures/SliderPrefixCase.svelte';

describe('Slider local prefix public package SSR', () => {
  it('renders local classes and stylesheet before mounting a native control', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(SliderPrefixCase);

      expect(body).toContain('tenant-slider-horizontal');
      expect(body).toContain('tenant-slider-rail');
      expect(body).toContain('tenant-slider-handle-1');
      expect(body).toContain('tenant-slider-tooltip');
      expect(body).not.toMatch(/<input[^>]*\sprefixCls=/);
      expect(head).toContain('data-ant-svelte-theme="slider-prefix:tenant-slider"');
      expect(head).toContain('.tenant-slider:where([data-ant-slider-prefix])');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps default fallback for empty prefixes in both modes without extra CSS', () => {
    for (const preset of ['empty-single', 'empty-range']) {
      const { body, head } = render(SliderPrefixCase, { props: { preset } });

      expect(body).toContain('ant-slider-horizontal');
      expect(body).toContain('ant-slider-tooltip');
      expect(head).not.toContain('data-ant-svelte-theme="slider-prefix:');
    }
  });

  it('keeps component variable names independent of Slider and Tooltip prefixes', () => {
    const own = render(SliderPrefixCase, { props: { preset: 'own-range' } });
    const tooltip = render(SliderPrefixCase, { props: { preset: 'tooltip-single' } }).body;

    expect(own.body).toContain('--ant-slider-rail-size:6px');
    expect(own.body).not.toContain('--token-slider-rail-size');
    expect(tooltip).toContain('owner-slider-tooltip');
    expect(tooltip).toContain('owner-tip-container');
  });
});
