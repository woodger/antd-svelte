import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import DividerThemeCase from '../browser/fixtures/DividerThemeCase.svelte';

describe('Divider component theme public package SSR', () => {
  it('renders all three tokens and the source scope without timers', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(DividerThemeCase, { props: { preset: 'own-tokens' } });

      expect(body).toContain('--ant-divider-text-padding-inline:24px');
      expect(body).toContain('--ant-divider-orientation-margin:0.2');
      expect(body).not.toContain('--ant-divider-orientation-margin:0.2px');
      expect(body).toContain('--ant-divider-vertical-margin-inline:14px');
      expect(head).toContain('data-ant-svelte-theme="divider-theme-scope"');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('preserves zero, undefined, CSS units and a custom variable namespace', () => {
    const zero = render(DividerThemeCase, { props: { preset: 'zero' } }).body;
    const missing = render(DividerThemeCase, { props: { preset: 'undefined' } }).body;
    const units = render(DividerThemeCase, { props: { preset: 'strings' } }).body;
    const prefixed = render(DividerThemeCase, { props: { preset: 'custom-prefix' } }).body;

    expect(zero).toContain('--ant-divider-text-padding-inline:0px');
    expect(zero).toContain('--ant-divider-orientation-margin:0');
    expect(missing).toContain('--ant-divider-text-padding-inline:inherit');
    expect(missing).toContain('--ant-divider-orientation-margin:inherit');
    expect(units).toContain('--ant-divider-text-padding-inline:2em');
    expect(units).toContain('--ant-divider-vertical-margin-inline:1.5em');
    expect(prefixed).toContain('--divider-x-divider-text-padding-inline:24px');
    expect(prefixed).toContain('--ant-divider-text-padding-inline:var(--divider-x-divider-text-padding-inline)');
  });

  it('keeps theme variables before semantic root and user style', () => {
    const { body } = render(DividerThemeCase, { props: { preset: 'own-tokens', priority: true } });

    expect(body).toMatch(/--ant-divider-text-padding-inline:24px;[^>]*--ant-divider-text-padding-inline:29px;--ant-divider-text-padding-inline:31px/);
    expect(body).toContain('padding-inline-end:37px');
  });

  it('preserves native rendering when source theme fields are absent', () => {
    const { body, head } = render(DividerThemeCase, { props: { enabled: false } });
    const samples = body.slice(0, body.indexOf('data-divider-nested'));

    expect(samples).not.toContain('--ant-divider-');
    expect(samples).not.toContain('divider-theme-scope');
    expect(samples).toContain('ant-divider-css-var');
    expect(head).not.toContain('data-ant-svelte-theme="divider-theme-scope"');
  });
});
