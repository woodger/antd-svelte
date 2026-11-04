import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import DividerConfigCase from '../browser/fixtures/DividerConfigCase.svelte';

describe('Divider prefix and config public package SSR', () => {
  it('renders local classes and a scoped stylesheet without timers or leaked props', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(DividerConfigCase);

      expect(body).toContain('tenant-divider-horizontal');
      expect(body).toContain('tenant-divider-rail-start');
      expect(body).not.toMatch(/<div[^>]*\sprefixCls=/);
      expect(head).toContain('data-ant-svelte-theme="divider-prefix:tenant-divider"');
      expect(head).toContain('.tenant-divider:where([data-ant-divider-prefix])');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('merges provider and local slots in source order and replaces nested records', () => {
    const priority = render(DividerConfigCase, { props: { preset: 'priority' } }).body;
    const inherited = render(DividerConfigCase, { props: { preset: 'nested-inherit' } }).body;
    const replaced = render(DividerConfigCase, { props: { preset: 'nested-empty' } }).body;
    const sample = (body: string) => body.slice(body.indexOf('data-divider-config-case'),
      body.indexOf('data-divider-inline'));

    expect(sample(priority)).toContain('provider-root local-semantic');
    expect(sample(priority)).toContain('provider-content local-content');
    expect(sample(priority)).toContain('opacity:0.4;opacity:0.6;color:rgb(10,20,30);opacity:0.8;opacity:0.95');
    expect(sample(inherited)).toContain('provider-main');
    expect(sample(replaced)).not.toContain('provider-main');
    expect(sample(replaced)).not.toContain('provider-content');
  });

  it('keeps default prefix fallback and accepts empty semantic callbacks', () => {
    const empty = render(DividerConfigCase, { props: { preset: 'prefix-empty' } });
    const callbacks = render(DividerConfigCase, { props: { preset: 'callback-empty' } }).body;

    expect(empty.body).toContain('ant-divider-horizontal');
    expect(empty.head).not.toContain('data-ant-svelte-theme="divider-prefix:');
    expect(callbacks).toContain('ant-divider-inner-text');
  });

  it('keeps component variable names independent of the local BEM prefix', () => {
    const { body } = render(DividerConfigCase, { props: { preset: 'own-tokens' } });

    expect(body).toContain('token-divider-with-text-start');
    expect(body).toContain('--ant-divider-text-padding-inline:23px');
    expect(body).not.toContain('--token-divider-text-padding-inline');
  });
});
