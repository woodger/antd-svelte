import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { theme, type ComponentTokenMap, type ComponentsConfig, type GlobalToken,
  type ThemeConfig, type ThemeTokenResult } from 'antd-svelte';
import ThemeContextFixture from './ThemeContextFixture.svelte';

describe('ConfigProvider source design-token SSR', () => {
  it('renders source variables and hook values during SSR without a document', () => {
    const body = render(ThemeContextFixture).body;

    expect(body).toContain('data-primary="#1668dc"');
    expect(body).toContain('data-height="28"');
    expect(body).toContain('data-font="12"');
    expect(body).toContain('data-hash=""');
    expect(body).toContain('data-component-primary="#03a05e"');
    expect(body).toContain('data-css-primary="var(--source-color-primary)"');
    expect(body).toContain('--source-color-primary:#1668dc');
    expect(body).toContain('--ant-color-primary:var(--source-color-primary)');
  });

  it('keeps source values across a provider that omits its own theme', () => {
    const body = render(ThemeContextFixture, { props: { kind: 'inherited' } }).body;

    expect(body).toContain('data-primary="#1668dc"');
    expect(body).toContain('data-font="12"');
    expect(body).toContain('data-component-primary="#03a05e"');
  });

  it('resets algorithms and component overrides while retaining CSS prefix and hashed=false', () => {
    const body = render(ThemeContextFixture, { props: { kind: 'reset' } }).body;

    expect(body).toContain('data-primary="#1677ff"');
    expect(body).toContain('data-font="14"');
    expect(body).toContain('data-height="32"');
    expect(body).toContain('data-css-primary="var(--source-color-primary)"');
    expect(body).toContain('data-hash=""');
    expect(body).not.toContain('data-component-primary=');
  });

  it('preserves native colors while exposing compact control metrics without source scope rules', () => {
    const { body, head } = render(ThemeContextFixture, { props: { kind: 'native' } });

    expect(body).toContain('data-ant-theme="dark"');
    expect(body).toContain('data-ant-primary="purple"');
    expect(body).toContain('data-ant-compact="true"');
    expect(body).toContain('data-primary="#642ab5"');
    expect(body).toContain('--ant-button-content-font-size:12px');
    expect(body).not.toContain('--ant-color-primary:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });

  it('uses the source default context without a ConfigProvider', () => {
    const body = render(ThemeContextFixture, { props: { kind: 'default' } }).body;

    expect(body).toContain('data-primary="#1677ff"');
    expect(body).toContain('data-font="14"');
    expect(body).toContain('data-css-primary="var(--ant-color-primary)"');
    expect(body).toMatch(/data-hash="css-dev-only-do-not-override-[a-z0-9]+"/);
  });

  it('publishes complete component-token keys and source config without a React type dependency', () => {
    expectTypeOf<ReturnType<typeof theme.useToken>>().toEqualTypeOf<ThemeTokenResult>();
    expectTypeOf<GlobalToken['colorPrimary']>().toEqualTypeOf<string>();
    expectTypeOf<NonNullable<ComponentTokenMap['InputNumber']>['handleWidth']>()
      .toEqualTypeOf<number>();
    expectTypeOf<NonNullable<ComponentTokenMap['BorderBeam']>>().toEqualTypeOf<object>();
    expectTypeOf<NonNullable<ComponentTokenMap['FloatButton']>>().toEqualTypeOf<object>();
    const config: ThemeConfig = { components: { Input: { colorPrimary: '#00b96b', algorithm: true },
      InputNumber: { handleWidth: 50.1234 }, Button: { fontWeight: 500 }, Rate: { starHoverScale: 'scale(2)' }
    } satisfies ComponentsConfig };

    expect(config.components?.InputNumber?.handleWidth).toBe(50.1234);
  });

  it('accepts full ThemeConfig in the static API while keeping component overrides in runtime only', () => {
    const token = theme.getDesignToken({ components: { Input: { colorPrimary: '#00b96b' } },
      inherit: false, hashed: false, cssVar: { prefix: 'custom' }, zeroRuntime: true });

    expect(token.colorPrimary).toBe('#1677ff');
    expect(token).not.toHaveProperty('Input');
  });
});
