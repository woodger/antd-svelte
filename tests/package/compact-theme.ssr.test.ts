import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import CompactThemeFixtures from '../browser/fixtures/CompactThemeFixtures.svelte';

describe('Compact theme metrics in published SSR components', () => {
  for (const initialMode of ['native', 'source', 'native-token', 'source-parent']) {
    it(`renders prepared control metrics in ${initialMode} mode before hydration`, () => {
      const { body } = render(CompactThemeFixtures, { props: { initialMode } });

      expect(body).toContain('--ant-input-padding-block:3px;');
      expect(body).toContain('--ant-input-padding-inline:7px;');
      expect(body).toContain('--ant-input-number-padding-block:3px;');
      expect(body).toContain('--ant-button-padding-inline:11px;');
      expect(body).toContain('&quot;fontHeight&quot;:20');
      expect(body).toContain('&quot;controlHeightSM&quot;:21');
      expect(body).toContain('&quot;controlHeightLG&quot;:35');
    });
  }

  it('leaves native scope classes and colors unchanged while supplying only control metrics', () => {
    const { body } = render(CompactThemeFixtures);
    const button = body.match(/<button[^>]+id="compact-metrics-button"[^>]*>/)?.[0];

    expect(button).toContain('--ant-button-content-font-size:12px');
    expect(button).not.toContain('--ant-button-default-bg:');
    expect(button).not.toContain('css-var-');
    expect(button).not.toContain('css-dev-only');
  });

  it('keeps local inline padding after the prepared compact metrics', () => {
    const { body } = render(CompactThemeFixtures);
    const input = body.match(/<input[^>]+id="compact-style-priority"[^>]*>/)?.[0];

    expect(input).toMatch(/--ant-input-padding-block:3px;.*--ant-input-padding-block:9px/);
    expect(input).toMatch(/--ant-input-padding-inline:7px;.*--ant-input-padding-inline:17px/);
  });
});
