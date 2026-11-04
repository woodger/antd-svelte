import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import SliderThemeCase from '../browser/fixtures/SliderThemeCase.svelte';

describe('Slider component theme public package SSR', () => {
  it('renders both modes with source tokens before any DOM measurement', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(SliderThemeCase, { props: { preset: 'rail-six' } });

      expect(body).toContain('--ant-slider-rail-size:6px');
      expect(body).toContain('--ant-slider-handle-size:10px');
      expect(body).toContain('slider-theme-scope');
      expect(body).toContain('data-ant-slider-source="true"');
      expect(head).toContain('data-ant-svelte-theme="slider-theme-scope"');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps zero, undefined and prefixed component values', () => {
    const zero = render(SliderThemeCase, { props: { preset: 'zero' } }).body;
    const missing = render(SliderThemeCase, { props: { preset: 'undefined' } }).body;
    const prefixed = render(SliderThemeCase, { props: { preset: 'custom-prefix' } }).body;

    expect(zero).toContain('--ant-slider-rail-size:0px');
    expect(zero).toContain('--ant-slider-handle-line-width:0px');
    expect(missing).toContain('--ant-slider-rail-size:inherit');
    expect(missing).toContain('--ant-slider-handle-size-hover:inherit');
    expect(prefixed).toContain('--slider-x-slider-rail-size:7px');
    expect(prefixed).toContain('--ant-slider-rail-size:var(--slider-x-slider-rail-size)');
  });

  it('keeps source variables before user root styles and range rail styles', () => {
    const { body } = render(SliderThemeCase, { props: { preset: 'rail-six', priority: true } });

    expect(body).toMatch(/--ant-slider-rail-size:6px;[^>]*--ant-slider-rail-size:11px/);
    expect(body).toMatch(/--ant-slider-rail-size:6px;[^>]*--ant-slider-rail-size:9px;--ant-slider-rail-size:11px/);
    expect(body).toContain('height:13px');
  });

  it('removes component declarations and the source marker in native mode', () => {
    const { body, head } = render(SliderThemeCase, { props: { enabled: false } });
    const samples = body.slice(0, body.indexOf('data-slider-theme="nested"'));

    expect(samples).not.toContain('--ant-slider-rail-size:');
    expect(samples).not.toContain('data-ant-slider-source');
    expect(samples).not.toContain('slider-theme-scope');
    expect(head).not.toContain('data-ant-svelte-theme="slider-theme-scope"');
  });
});
