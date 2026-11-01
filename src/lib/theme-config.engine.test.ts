import { describe, expect, it } from 'vitest';
import { createDesignTokenState, defaultThemeConfig, mergeThemeConfig } from './theme-config.engine';
import { defaultAlgorithm, darkAlgorithm, compactAlgorithm } from './theme-algorithms.engine';
import { createDerivativeTheme } from './theme-cache';
import type { ThemeConfig } from './types';
import type { MappingAlgorithm } from './theme-token.types';

describe('ConfigProvider theme inheritance', () => {
  it('preserves the parent object when the child supplies no theme', () => {
    const parent = mergeThemeConfig({ token: { fontSize: 15 } }, defaultThemeConfig, 'parent');

    const result = mergeThemeConfig(undefined, parent, 'child');

    expect(result).toBe(parent);
  });

  it('copies nested overrides without mutating input and gives each local theme a stable key', () => {
    const input: ThemeConfig = Object.freeze({
      cssVar: Object.freeze({ prefix: 'custom', key: 'parent' }),
      token: Object.freeze({ colorPrimary: '#123456' }),
      components: Object.freeze({ Input: Object.freeze({ activeShadow: 'none' }) })
    });
    const parent = mergeThemeConfig(input, defaultThemeConfig, ':parent:');

    const child = mergeThemeConfig({ components: { Input: { paddingBlock: 8 } } }, parent, ':child:');

    expect(child.cssVar).toEqual({ prefix: 'custom', key: 'css-var-child' });
    expect(child.token).toEqual({ colorPrimary: '#123456' });
    expect(child.components?.Input).toEqual({ activeShadow: 'none', paddingBlock: 8 });
    expect(input.components?.Input).toEqual({ activeShadow: 'none' });
    expect(input.cssVar).toEqual({ prefix: 'custom', key: 'parent' });
  });

  it('resets native and source fields while retaining inherited hash and CSS metadata', () => {
    const parent = mergeThemeConfig({
      mode: 'dark', primary: 'purple', compact: true,
      algorithm: darkAlgorithm, token: { fontSize: 19 },
      components: { Button: { defaultBg: '#123456' } },
      hashed: false, cssVar: { prefix: 'reset', key: 'outer' }, zeroRuntime: true
    }, defaultThemeConfig, 'parent');

    const result = mergeThemeConfig({ inherit: false }, parent, 'child');

    expect(result).toMatchObject({ mode: 'light', primary: 'blue', compact: false,
      token: {}, components: {}, hashed: false, zeroRuntime: true,
      cssVar: { prefix: 'reset', key: 'css-var-child' } });
    expect(result.algorithm).toBeUndefined();
  });

  it('uses an explicit empty key as the source signal to generate a local key', () => {
    const result = mergeThemeConfig({ cssVar: { key: '' } }, defaultThemeConfig, ':stable:');

    expect(result.cssVar?.key).toBe('css-var-stable');
  });
});

describe('ConfigProvider design-token state', () => {
  it('maps existing native theme selectors into source tokens without changing their input', () => {
    const config = { ...defaultThemeConfig, mode: 'dark' as const,
      primary: 'purple' as const, compact: true };

    const result = createDesignTokenState(config);

    expect(result.token).toMatchObject({ fontSize: 12, controlHeight: 28, colorBgContainer: '#141414' });
    expect(result.token.colorPrimary).toBe('#642ab5');
    expect(config).toEqual({ ...defaultThemeConfig, mode: 'dark', primary: 'purple', compact: true });
  });

  it('gives explicit algorithms and token overrides priority over native selectors', () => {
    const result = createDesignTokenState({ ...defaultThemeConfig,
      mode: 'dark', primary: 'purple', compact: true,
      algorithm: defaultAlgorithm, token: { colorPrimary: '#00b96b' } });

    expect(result.token).toMatchObject({ fontSize: 14, controlHeight: 32,
      colorPrimary: '#00b96b', colorBgContainer: '#ffffff' });
  });

  it('reuses a Theme for the same ordered function chain and changes it for a different chain', () => {
    const first = createDesignTokenState({ ...defaultThemeConfig,
      algorithm: [darkAlgorithm, compactAlgorithm] });
    const second = createDesignTokenState({ ...defaultThemeConfig,
      algorithm: Object.freeze([darkAlgorithm, compactAlgorithm]), token: { fontSize: 15 } });
    const reordered = createDesignTokenState({ ...defaultThemeConfig,
      algorithm: [compactAlgorithm, darkAlgorithm] });

    expect(second.theme).toBe(first.theme);
    expect(second.theme.id).toBe(first.theme.id);
    expect(reordered.theme).not.toBe(first.theme);
    expect(first.token.fontSize).toBe(12);
    expect(second.token.fontSize).toBe(12);
  });

  it('passes the original seed and previous map through a custom runtime chain', () => {
    let captured: unknown;
    const first: MappingAlgorithm = seed => {
      captured = seed;
      return defaultAlgorithm(seed);
    };
    const second: MappingAlgorithm = (seed, map) => {
      expect(seed).toBe(captured);
      return { ...map!, controlHeight: 47 };
    };

    const result = createDesignTokenState({ ...defaultThemeConfig,
      algorithm: [first, second], token: { fontSize: 15 } });

    expect(result.token.controlHeight).toBe(47);
    expect(result.token.fontSize).toBe(15);
  });

  it('keeps source cache identity and the original algorithm array reference', () => {
    const first: MappingAlgorithm = seed => defaultAlgorithm(seed);
    const later: MappingAlgorithm = (seed, map) => ({ ...map!, controlHeight: seed.controlHeight + 9 });
    const algorithms = [first];
    const theme = createDerivativeTheme(algorithms)!;

    algorithms.push(later);

    expect(createDerivativeTheme([first])).toBe(theme);
    expect(theme.getDerivativeToken({ ...defaultThemeConfig.token!,
      ...createDesignTokenState(defaultThemeConfig).token }).controlHeight).toBe(41);
  });

  it('keeps per-component algorithm output isolated from root and sibling tokens', () => {
    const result = createDesignTokenState({ ...defaultThemeConfig,
      token: { colorPrimary: '#123456' }, components: {
        Input: { colorPrimary: '#00B96B', algorithm: true },
        Button: { fontWeight: 500 }
      } });

    expect(result.token.colorPrimary).toBe('#123456');
    expect(result.token.Input).toMatchObject({ colorPrimary: '#00b96b', colorPrimaryHover: '#20c77c' });
    expect(result.token.Button).toEqual({ fontWeight: 500 });
    expect(result.cssVar).not.toHaveProperty('Input');
    expect(result.cssVar).not.toHaveProperty('Button');
  });

  it('serializes source units, preserves breakpoints and bridges a custom CSS prefix', () => {
    const result = createDesignTokenState({ ...defaultThemeConfig,
      cssVar: { prefix: 'custom', key: 'scope' },
      token: { lineHeight: 2, fontSize: 15, motion: false, screenSM: 600 } });

    expect(result.style).toContain('--custom-font-size:15px');
    expect(result.style).toContain('--custom-line-height:2;');
    expect(result.style).toContain('--custom-motion-duration-slow:0s');
    expect(result.style).toContain('--ant-font-size:var(--custom-font-size)');
    expect(result.style).not.toContain('--custom-screen-sm:');
    expect(result.style).not.toContain('--custom-motion-base:');
    expect(result.cssVar.screenSM).toBe(600);
    expect(result.cssVar.colorPrimary).toBe('var(--custom-color-primary)');
  });

  it.each([
    ['MyScope2', 'my-scope-2-'],
    ['ANT', 'ant-'],
    ['', '']
  ])('bridges normalized prefix %s without a self-referencing alias', (prefix, normalized) => {
    const result = createDesignTokenState({ ...defaultThemeConfig,
      cssVar: { prefix }, token: { fontSize: 15 } });

    expect(result.cssVar.fontSize).toBe(`var(--${normalized}font-size)`);
    expect(result.style).toContain(`--${normalized}font-size:15px`);
    expect(result.style).not.toContain('--ant-font-size:var(--ant-font-size)');
    if (normalized !== 'ant-') {
      expect(result.style).toContain(`--ant-font-size:var(--${normalized}font-size)`);
    }
  });
});
