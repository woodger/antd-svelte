import { describe, expect, it } from 'vitest';
import { theme } from './theme.engine';
import type { DesignTokenConfig, MappingAlgorithm } from './theme-token.types';

describe('theme.getDesignToken', () => {
  it('returns the source light and dark compact defaults', () => {
    const light = theme.getDesignToken();
    const dark = theme.getDesignToken({
      algorithm: [theme.darkAlgorithm, theme.compactAlgorithm]
    });

    expect(light.colorPrimary).toBe('#1677ff');
    expect(light.colorBgContainer).toBe('#ffffff');
    expect(light.fontSize).toBe(14);
    expect(light.controlHeight).toBe(32);
    expect(dark.colorPrimary).toBe('#1668dc');
    expect(dark.fontSize).toBe(12);
    expect(dark.controlHeight).toBe(28);
  });

  it('applies non-seed overrides before computing aliases and preserves final alias overrides', () => {
    const token = theme.getDesignToken({
      token: {
        fontSize: 14,
        lineHeight: 2,
        fontSizeSM: 12,
        lineHeightSM: 1.5,
        fontSizeLG: 20,
        lineHeightLG: 1.6,
        controlItemBgActive: 'custom-active'
      }
    });

    expect(token.fontHeight).toBe(28);
    expect(token.fontHeightSM).toBe(18);
    expect(token.fontHeightLG).toBe(32);
    expect(token.controlItemBgActive).toBe('custom-active');
  });

  it('passes the original seed and previous map to custom algorithms in order', () => {
    let input: Parameters<MappingAlgorithm>[0] | undefined;
    let previous: ReturnType<MappingAlgorithm> | undefined;
    const first: MappingAlgorithm = (seed, map) => {
      expect(map).toBeUndefined();
      input = seed;
      previous = theme.defaultAlgorithm(seed);
      return previous;
    };
    const second: MappingAlgorithm = (seed, map) => {
      expect(seed).toBe(input);
      expect(map).toBe(previous);
      return { ...map!, colorPrimary: '#123456', colorPrimaryHover: '#456789' };
    };

    const token = theme.getDesignToken({
      algorithm: Object.freeze([first, second]),
      token: { colorPrimary: '#abcdef', colorPrimaryHover: '#fedcba' }
    });

    expect(input?.colorPrimary).toBe('#abcdef');
    expect(token.colorPrimary).toBe('#123456');
    expect(token.colorPrimaryHover).toBe('#fedcba');
  });

  it('copies seed and caller overrides and returns independent objects', () => {
    const before = { ...theme.defaultSeed };
    const override = Object.freeze({ colorPrimary: '#12ab34', fontSize: 15 });
    const first = theme.getDesignToken({ token: override });
    const second = theme.getDesignToken({ token: override });

    first.colorPrimary = '#000000';

    expect(second).not.toBe(first);
    expect(second.colorPrimary).toBe('#12ab34');
    expect(override).toEqual({ colorPrimary: '#12ab34', fontSize: 15 });
    expect(theme.defaultSeed).toEqual(before);
  });

  it('captures the override reference before a custom mapper can replace the config', () => {
    const config: DesignTokenConfig = { token: { colorPrimaryHover: '#112233' } };
    config.algorithm = seed => {
      config.token = { colorPrimaryHover: '#ffffff' };
      return theme.defaultAlgorithm(seed);
    };

    const token = theme.getDesignToken(config);

    expect(token.colorPrimaryHover).toBe('#112233');
    expect(config.token?.colorPrimaryHover).toBe('#ffffff');
  });

  it('uses the source reduce semantics when a mapper appends an algorithm to its array', () => {
    const algorithms: MappingAlgorithm[] = [];
    const skipped: MappingAlgorithm = () => { throw new Error('Unexpected appended mapper'); };
    algorithms.push(seed => {
      algorithms.push(skipped);
      return theme.defaultAlgorithm(seed);
    });

    const token = theme.getDesignToken({ algorithm: algorithms });

    expect(token.colorPrimary).toBe('#1677ff');
    expect(algorithms).toHaveLength(2);
  });

  it('propagates a custom algorithm error without a fallback or changed exception', () => {
    const failure = new Error('custom mapper failed');
    const algorithm: MappingAlgorithm = () => { throw failure; };
    let caught: unknown;

    try {
      theme.getDesignToken({ algorithm });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
  });

  it.each([
    [1.9, 1.9, 1.9, 1.9, 1.9],
    [2, 1, 2, 2, 2],
    [4, 1, 4, 4, 4],
    [4.9, 1, 4.9, 4.9, 4],
    [5, 1, 4, 6, 4],
    [5.9, 1, 4, 6.9, 4],
    [6, 2, 4, 8, 4],
    [6.9, 2, 4, 8.9, 4],
    [7, 2, 5, 9, 4],
    [7.9, 2, 5, 9.9, 4],
    [8, 2, 6, 10, 6],
    [13.9, 2, 6, 15.9, 6],
    [14, 2, 7, 16, 6],
    [15.9, 2, 7, 17.9, 6],
    [16, 2, 8, 16, 6],
    [24, 2, 8, 16, 6]
  ])('preserves source radius thresholds at %s', (borderRadius, xs, sm, lg, outer) => {
    const token = theme.getDesignToken({ token: { borderRadius } });

    expect(token).toMatchObject({
      borderRadius,
      borderRadiusXS: xs,
      borderRadiusSM: sm,
      borderRadiusLG: lg,
      borderRadiusOuter: outer
    });
  });
});
