import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ToggleThemeFixture from './ToggleThemeFixture.svelte';

describe('Source checkable theme SSR', () => {
  it('renders unitless Radio, dimensional Switch and Checkbox alias tokens', () => {
    const { body } = render(ToggleThemeFixture);

    expect(body).toContain('--ant-radio-radio-size:24;');
    expect(body).not.toContain('--ant-radio-radio-size:24px');
    expect(body).toContain('--ant-radio-dot-size:10;');
    expect(body).toContain('--ant-switch-track-height:31px;');
    expect(body).toContain('--ant-switch-handle-size:25px;');
    expect(body).toContain('--ant-control-interactive-size:25px;');
    expect(body).toContain('--ant-color-primary:#00b96b');
  });

  it('places source scope classes on native fieldsets and supplies their SSR head', () => {
    const { body, head } = render(ToggleThemeFixture);

    expect(body).toMatch(/<fieldset[^>]*id="ssr-radio-group"[^>]*toggle-ssr css-dev-only/);
    expect(body).toMatch(/<fieldset[^>]*id="ssr-checkbox-group"[^>]*toggle-ssr css-dev-only/);
    expect(body).toMatch(/class="ant-radio-button-wrapper ant-radio-css-var toggle-ssr/);
    expect(head).toContain('data-ant-svelte-theme="toggle-ssr"');
    expect(head).toContain('.toggle-ssr{');
  });

  it('preserves omitted source values instead of restoring vendor defaults', () => {
    const { body } = render(ToggleThemeFixture, { props: { missing: true } });

    expect(body).toContain('--ant-radio-radio-size:inherit;');
    expect(body).toContain('--ant-radio-dot-size:inherit');
    expect(body).toContain('--ant-switch-track-height:inherit;');
    expect(body).toContain('--ant-switch-handle-size:inherit');
  });

  it('bridges custom CSS prefixes for the published component styles', () => {
    const { body } = render(ToggleThemeFixture, { props: { prefix: 'Toggle2' } });

    expect(body).toContain('--toggle-2-radio-radio-size:24;');
    expect(body).toContain('--ant-radio-radio-size:var(--toggle-2-radio-radio-size)');
    expect(body).toContain('--toggle-2-switch-track-height:31px;');
  });

  it('keeps native-only themes free of generated component tokens and scope rules', () => {
    const { body, head } = render(ToggleThemeFixture, { props: { native: true } });

    expect(body).toContain('data-ant-compact="true"');
    expect(body).not.toContain('--ant-radio-radio-size:');
    expect(body).not.toContain('--ant-control-interactive-size:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
