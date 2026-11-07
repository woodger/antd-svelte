import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Spin, type SpinIndicatorInfo } from 'antd-svelte';
import SpinSourceCase from '../browser/fixtures/SpinSourceCase.svelte';

afterEach(() => Spin.setDefaultIndicator(null));

describe('Spin source API public package SSR', () => {
  it('retains a fixed fullscreen root without scheduling progress or delay timers', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(Spin, { props: { fullscreen: true, percent: 'auto', delay: 500 } });

      expect(body).toContain('ant-spin-fullscreen');
      expect(body).not.toContain(' hidden');
      expect(body).not.toContain('ant-spin-section');
      expect(body).not.toContain('<svg');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('matches the source progress latch before hydration', () => {
    const { body } = render(Spin, { props: { percent: 25 } });

    expect(body).toContain('ant-spin-dot-holder-hidden');
    expect(body).not.toContain('role="progressbar"');
    expect(body.match(/ant-spin-dot-item /g)).toHaveLength(4);
  });

  it('adds no leading whitespace at the inline component boundary', () => {
    for (const prefixCls of [undefined, 'inline-spin']) {
      const { body } = render(Spin, { props: { prefixCls } });

      expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/^<div\s/);
    }
  });

  it('preserves zero children, description and busy content', () => {
    const { body } = render(Spin, {
      props: { children: 0, description: 'Current' }
    });

    expect(body).toContain('ant-spin-container');
    expect(body).toContain('>0<');
    expect(body).toContain('Current');
    expect(body).toContain('inert');
  });

  it('passes numeric progress to the static fallback and gives local snippets priority', () => {
    const global = createRawSnippet<[SpinIndicatorInfo]>(info => ({
      render: () => `<span>Global ${info().percent}</span>`
    }));
    const local = createRawSnippet(() => ({ render: () => '<span>Local</span>' }));
    Spin.setDefaultIndicator(global);

    expect(render(Spin, { props: { percent: 23 } }).body).toContain('Global 23');
    const overridden = render(Spin, { props: { percent: 23, indicator: local } }).body;

    expect(overridden).toContain('Local');
    expect(overridden).not.toContain('Global');
    expect(overridden).not.toContain('ant-spin-dot-item');
  });

  it.each([false, true])('keeps boolean child %s empty while retaining its container', children => {
    const { body } = render(Spin, { props: { children } });

    expect(body).toContain('ant-spin-container');
    expect(body).not.toContain(`>${children}<`);
    expect(body).toContain('inert');
  });

  it('forwards explicit native attributes after its accessibility defaults', () => {
    const { body } = render(Spin, { props: { hidden: true, role: 'img', 'aria-live': 'off' } });

    expect(body).toContain(' hidden');
    expect(body).toContain('role="img"');
    expect(body).toContain('aria-live="off"');
    expect(body).not.toContain('role="status"');
  });

  it('applies component variables in SSR with source aliases and prefixed CSS', () => {
    const own = render(SpinSourceCase, {
      props: { sample: { name: 'own', theme: 'own', props: { prefixCls: 'custom-spin' } } }
    });
    const prefixed = render(SpinSourceCase, {
      props: { sample: { name: 'prefixed', theme: 'variables', props: {} } }
    });

    expect(own.body).toContain('--ant-spin-dot-size:28px');
    expect(own.body).toContain('--ant-spin-dot-size-sm:18px');
    expect(own.body).toContain('--ant-spin-dot-size-lg:42px');
    expect(own.head).toContain('spin-prefix:custom-spin');
    expect(own.head).toContain('.custom-spin-dot-circle');
    expect(prefixed.body).toContain('--spin-x-spin-dot-size:26px');
    expect(prefixed.body).toContain('--ant-spin-dot-size:var(--spin-x-spin-dot-size)');
  });

  it('keeps root, standalone section and local style precedence', () => {
    const standalone = render(SpinSourceCase, { props: { sample: {
      name: 'semantic', semantic: true, provider: true, props: { style: 'padding-top:11px' }
    } } }).body;
    const fullscreen = render(SpinSourceCase, { props: { sample: {
      name: 'full', semantic: true, props: { fullscreen: true }
    } } }).body;

    expect(standalone).toMatch(/padding-top:3px;padding-top:9px;padding-top:7px;[^>]*padding-top:6px;padding-top:11px/);
    expect(fullscreen).toContain('local-root');
    expect(fullscreen).toContain('padding-top:7px;color:#cc2200');
  });
});
