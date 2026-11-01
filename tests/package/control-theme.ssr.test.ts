import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ControlThemeFixture from './ControlThemeFixture.svelte';

describe('Source control theme SSR', () => {
  it('renders source component variables on native and composed control roots', () => {
    const { body } = render(ControlThemeFixture);

    expect(body).toContain('--ant-button-default-bg:#123456');
    expect(body).toContain('--ant-button-font-weight:600;');
    expect(body).not.toContain('--ant-button-font-weight:600px');
    expect(body).toContain('--ant-input-input-font-size:17px');
    expect(body).toContain('--ant-input-padding-inline:5px');
    expect(body).toContain('--ant-input-number-handle-width:36px');
    expect(body).toContain('--ant-input-number-control-width:170px');
    expect(body).toContain('--ant-color-text:#a011bb');
  });

  it('includes the alias reset rule in the SSR head and captures provider values in its scope', () => {
    const { body, head } = render(ControlThemeFixture);

    expect(head).toContain('data-ant-svelte-theme="control-ssr"');
    expect(head).toContain('.control-ssr{');
    expect(head).toContain('--ant-color-primary:var(');
    expect(body).toContain('--ant-color-primary:#1677ff');
    expect(body).toMatch(/class="ant-btn control-ssr css-dev-only-do-not-override-/);
  });

  it('preserves native-only CSS without generating component variables or head rules', () => {
    const { body, head } = render(ControlThemeFixture, { props: { native: true } });

    expect(body).toContain('data-ant-compact="true"');
    expect(body).not.toContain('--ant-button-font-weight:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
