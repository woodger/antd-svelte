import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Progress } from 'antd-svelte';
import ProgressLineCase from '../browser/fixtures/ProgressLineCase.svelte';

describe('Progress line public package SSR', () => {
  it('renders both segments with source status precedence before hydration', () => {
    const body = render(Progress, {
      props: { percent: 100, success: { percent: 30, strokeColor: '#ff22cc' } }
    }).body;

    expect(body).toContain('ant-progress-status-normal');
    expect(body).toContain('ant-progress-track-success');
    expect(body).toContain('width: 100%');
    expect(body).toContain('width: 30%');
    expect(body).toContain('background-color: #ff22cc');
  });

  it('calls a two-parameter formatter once with normalized percent and success', () => {
    const format = vi.fn((p: number, s?: number) => `${p} / ${s}`);
    const body = render(Progress, { props: { percent: 130, success: { percent: 30 }, format } }).body;

    expect(format).toHaveBeenCalledExactlyOnceWith(100, 30);
    expect(body).toContain('100 / 30');
  });

  it('renders passive formatter snippets while keeping a textual accessible value', () => {
    const snippet = createRawSnippet(() => ({ render: () => '<strong>Rich progress</strong>' }));
    const body = render(Progress, { props: { percent: 42, format: () => snippet } }).body;

    expect(body).toContain('<strong>Rich progress</strong>');
    expect(body).toContain('aria-valuetext="42%"');
    expect(body).not.toContain('&lt;strong');
  });

  it('renders source steps and custom rounding without timers or browser measurements', () => {
    vi.useFakeTimers();
    try {
      const body = render(Progress, {
        props: { percent: 50, steps: 5, rounding: Math.floor }
      }).body;

      expect(body.match(/class="ant-progress-steps-item /g)).toHaveLength(5);
      expect(body.match(/ant-progress-steps-item-active/g)).toHaveLength(2);
      expect(body).not.toContain('class="ant-progress-rail');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('applies component defaults before provider, semantic and local styles', () => {
    const { body } = render(ProgressLineCase, { props: { sample: {
      name: 'priority', provider: true, semantic: true, theme: 'own',
      props: { style: 'padding-top:11px' }
    } } });

    expect(body).toContain('--ant-progress-line-border-radius:9px');
    expect(body).toMatch(/padding-top:3px;padding-top:5px;padding-top:7px;padding-top:11px/);
    expect(body).toContain('border-radius:3px');
  });

  it('keeps local prefix selectors and normalized variable namespaces in SSR', () => {
    const { body, head } = render(ProgressLineCase, { props: { sample: {
      name: 'prefix', theme: 'variables',
      props: { prefixCls: 'source-progress', percent: 42, strokeColor: '#6633aa' }
    } } });

    expect(body).toContain('--progress-x-progress-line-border-radius:7px');
    expect(head).toContain('progress-prefix:source-progress');
    expect(head).toContain('.source-progress-track');
    expect(body).toContain('--progress-line-stroke-color: #6633aa');
  });
});
