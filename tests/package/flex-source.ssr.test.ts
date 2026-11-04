import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import FlexSourceCase from '../browser/fixtures/FlexSourceCase.svelte';

describe('Flex source API public package SSR', () => {
  it('renders custom root, direct children and prefix CSS without refs, timers or leaked layout props', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(FlexSourceCase, { props: { preset: 'custom-root' } });

      expect(body).toContain('<section');
      expect(body).toContain('data-custom-label="Root"');
      expect(body).toContain('custom-flex');
      expect(body).toContain('aria-label="Custom layout"');
      expect(body).toContain('data-probe="forwarded"');
      expect(body).toContain('Flex source ref">none');
      expect(body).not.toMatch(/<section[^>]*\s(?:prefixCls|nativeElement|orientation|gap|flex)=/);
      expect(head).toContain('data-ant-svelte-theme="flex-prefix:custom-flex"');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('inherits provider vertical/style and replaces nested records', () => {
    const inherit = render(FlexSourceCase, { props: { preset: 'nested-inherit' } }).body;
    const replace = render(FlexSourceCase, { props: { preset: 'nested-empty' } }).body;

    expect(inherit).toContain('provider-flex');
    expect(inherit).toContain('child-flex-vertical');
    expect(inherit).toContain('gap:19px;flex:1;opacity:0.6');
    expect(replace).not.toContain('provider-flex');
    expect(replace).not.toContain('child-flex-vertical');
    expect(replace).not.toContain('gap:19px');
  });

  it('keeps local style before layout properties and preserves an empty prefix fallback', () => {
    const priority = render(FlexSourceCase, { props: { preset: 'style-priority' } }).body;
    const fallback = render(FlexSourceCase, { props: { preset: 'prefix-empty' } });

    expect(priority).toContain('gap:19px;flex:1;opacity:0.6;gap:40px;flex:2;opacity:0.9;flex:0;gap:12px');
    expect(fallback.body).toContain('ant-flex');
    expect(fallback.head).not.toContain('data-ant-svelte-theme="flex-prefix:');
  });

  it('applies component aliases without adding typography reset declarations', () => {
    const own = render(FlexSourceCase, { props: { preset: 'aliases-large' } }).body;
    const variable = render(FlexSourceCase, { props: { preset: 'variables' } }).body;
    const plain = render(FlexSourceCase, { props: { preset: 'plain-root' } }).body;

    expect(own).toContain('--ant-padding-lg:31px');
    expect(own).toContain('--ant-font-size:30px');
    expect(variable).toContain('--flex-x-padding:27px');
    expect(variable).toContain('--ant-padding:var(--flex-x-padding)');
    expect(plain).toContain('<article');
    expect(plain).not.toContain('nativeElement=');
  });
});
