import { describe, expect, it } from 'vitest';
import {
  createDesignTokenState,
  defaultThemeConfig,
  mergeThemeConfig
} from './theme-config.engine';

describe('Theme CSS variable prefix inheritance', () => {
  it('defaults a new source theme namespace to the provider class prefix', () => {
    const config = mergeThemeConfig({ cssVar: {} }, defaultThemeConfig, 'root', 'suite');

    expect(config.cssVar).toMatchObject({ prefix: 'suite', key: 'css-var-root' });
  });

  it('preserves the inherited namespace when a child resets its theme', () => {
    const parent = mergeThemeConfig({ cssVar: {} }, defaultThemeConfig, 'parent', 'suite');
    const child = mergeThemeConfig({ inherit: false }, parent, 'child', 'inner');

    expect(child.cssVar).toMatchObject({ prefix: 'suite', key: 'css-var-child' });
  });

  it('prioritizes explicit local namespace over inherited and provider prefixes', () => {
    const parent = mergeThemeConfig({ cssVar: { prefix: 'parent-vars' } },
      defaultThemeConfig, 'parent', 'suite');
    const child = mergeThemeConfig({ cssVar: { prefix: 'local-vars' } }, parent, 'child', 'inner');

    expect(child.cssVar?.prefix).toBe('local-vars');
  });

  it('reuses the parent theme unchanged when no local theme is provided', () => {
    const parent = mergeThemeConfig({ cssVar: {} }, defaultThemeConfig, 'parent', 'suite');
    const child = mergeThemeConfig(undefined, parent, 'child', 'inner');

    expect(child).toBe(parent);
    expect(child.cssVar?.prefix).toBe('suite');
  });

  it('uses the current provider when explicit undefined removes the inherited namespace', () => {
    const parent = mergeThemeConfig({ cssVar: {} }, defaultThemeConfig, 'parent', 'suite');
    const child = mergeThemeConfig({ cssVar: { prefix: undefined } }, parent, 'child', 'inner');
    const state = createDesignTokenState(child, 'inner');

    expect(child.cssVar?.prefix).toBe(undefined);
    expect(state.cssVar.fontSize).toBe('var(--inner-font-size)');
    expect(state.prefix).toBe('inner');
  });
});
