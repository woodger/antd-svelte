import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { ColorPicker } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-color-picker-prefix-reference.json';
import ColorPickerPrefixSSRFixtures from '../browser/fixtures/ColorPickerPrefixSSRFixtures.svelte';

describe('ColorPicker local/shared prefixes', () => {
  it('pins Source styles and live editor/popup/focus identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(24);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.samePopup && step.focused)).toBe(true);
  });

  it('renders local trigger classes and an unopened popup without browser resources', () => {
    const getPopupContainer = vi.fn();
    const result = render(ColorPicker, {
      props: { prefixCls: 'colors', defaultValue: '#1677ff', getPopupContainer }
    });
    const body = result.body;
    const head = result.head;

    expect(body).toContain('colors-trigger');
    expect(body).toContain('ant-color-picker-css-var');
    expect(body).toContain('aria-expanded="false"');
    expect(body).not.toContain('aria-label="Hex color"');
    expect(head).toContain('.colors-trigger:where(');
    expect(getPopupContainer).not.toHaveBeenCalled();
  });

  it('retains Source cached child selectors separately from a unique local namespace counterpart', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'aliases')!;

    expect(entry.result.nested.collapse).toEqual({ display: 'block', gap: 'normal' });
    expect(entry.freshNamespace?.nested.collapse).toEqual({ display: 'flex', gap: '4px' });
    expect(entry.result.nested.divider?.['margin-top']).toBe('24px');
    expect(entry.freshNamespace?.nested.divider?.['margin-top']).toBe('12px');
  });

  it('keeps shared child namespaces independent from local color owners during SSR', () => {
    vi.useFakeTimers();
    try {
      const result = render(ColorPickerPrefixSSRFixtures);
      const body = result.body;
      const head = result.head;

      expect(body).toContain('suite-color-picker-trigger');
      expect(body).toContain('colors-trigger');
      expect(body).toContain('suite-popover-container');
      expect(body).toContain('inner-popover-container');
      expect(body).toContain('suite-select');
      expect(body).toContain('inner-input-number');
      expect(body).toContain('suite-collapse');
      expect(body).toContain('inner-collapse-panel');
      expect(body).toContain('inner-divider');
      expect(body).toContain('aria-label="Hex color"');
      expect(body).toContain('hidden');
      expect(head).toContain('.colors-inner .colors-presets .inner-collapse');
      expect(head).toContain('--ant-color-text');
      expect(body).not.toContain('[object Object]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
