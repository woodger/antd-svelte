import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { theme, type AliasToken, type MappingAlgorithm, type SeedToken } from 'antd-svelte';
import ThemeTokensFixture from './ThemeTokensFixture.svelte';

describe('theme design-token package API', () => {
  it('calculates source dark compact tokens during SSR without a document', () => {
    const body = render(ThemeTokensFixture).body;

    expect(body).toMatch(/color:\s*#1668dc/);
    expect(body).toMatch(/font-size:\s*12px/);
    expect(body).toContain('data-height="28"');
    expect(body).toContain('data-motion="0s"');
  });

  it('exposes typed algorithms, current seed and alias output through the public entry point', () => {
    const map = theme.defaultAlgorithm(theme.defaultSeed);
    const token = theme.getDesignToken();

    expect(Object.keys(token)).toHaveLength(404);
    expect(map.fontSize).toBe(14);
    expect(token.colorPrimary).toBe('#1677ff');
    expectTypeOf(theme.defaultSeed).toEqualTypeOf<SeedToken>();
    expectTypeOf(theme.getDesignToken()).toEqualTypeOf<AliasToken>();
    expectTypeOf<MappingAlgorithm>().parameter(0).toEqualTypeOf<SeedToken>();
  });

  it('uses consumer callbacks and final alias overrides without mutating caller data', () => {
    const override = Object.freeze({ colorPrimaryHover: '#123456' });
    const algorithm: MappingAlgorithm = seed => ({
      ...theme.defaultAlgorithm(seed),
      colorPrimaryHover: '#fedcba'
    });
    const token = theme.getDesignToken({ algorithm, token: override });

    expect(token.colorPrimaryHover).toBe('#123456');
    expect(override).toEqual({ colorPrimaryHover: '#123456' });
  });
});
