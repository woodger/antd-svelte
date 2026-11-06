import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-color-picker-theme-reference.json';
import ColorPickerThemeCase from '../browser/fixtures/ColorPickerThemeCase.svelte';

describe('ColorPicker source theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with independent child themes and no browser resources`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(ColorPickerThemeCase, { props: { sample, opened: 'basic' } });

        expect(body).toContain('Themed ColorPicker normal basic');
        expect(body).toContain('--ant-popover-z-index-popup');
        expect(body).toContain('aria-label="Hex color"');
        expect(body).toContain('ant-collapse-css-var');
        expect(body).toContain('color-picker-presets');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
