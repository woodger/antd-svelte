import { describe, expect, it } from 'vitest';
import { getGridColPrefixCss, getGridColPrefixScope } from './grid-col-prefix.engine';
import { createDesignTokenState, defaultThemeConfig } from './theme-config.engine';

const token = createDesignTokenState(defaultThemeConfig).token;

describe('Col prefix stylesheet', () => {
  it('leaves the default prefix and existing custom media renderer unchanged', () => {
    expect(getGridColPrefixCss('ant-col', 'ant', token)).toBeUndefined();
    expect(getGridColPrefixScope('ant-col', 'ant', { ...token, screenMDMin: 850 }))
      .toBeUndefined();
  });

  it('separates local classes and global private variables while retaining Grid markers', () => {
    const css = getGridColPrefixCss('column', 'suite', token)!;

    expect(css).toContain('.column-xs-24:where(');
    expect(css).toContain('.column-md-0:where(');
    expect(css).toContain('--suite-col-xs-flex');
    expect(css).toContain('--suite-grid-display');
    expect(css).toContain('.ant-grid-css-var');
    expect(css).not.toContain('.ant-col');
    expect(css).not.toContain('__ANT_GRID_MEDIA_SCOPE__');
  });

  it('isolates identical local classes across global namespaces and responsive thresholds', () => {
    const first = getGridColPrefixScope('column', 'suite', token);
    const second = getGridColPrefixScope('column', 'inner', token);
    const media = { ...token, screenMDMin: 850 };

    expect(first).not.toBe(second);
    expect(first).not.toBe(getGridColPrefixScope('column', 'suite', media));
    expect(getGridColPrefixScope('column', 'suite', { ...token, fontSize: 20 })).toBe(first);
    expect(getGridColPrefixCss('column', 'suite', media)).toContain('@media (min-width: 850px)');
    expect(getGridColPrefixCss('ant-col', 'suite', token)).toContain('--suite-grid-display');
  });

  it('preserves literal prefixes and escapes style syntax', () => {
    expect(getGridColPrefixCss('column-$&', 'suite.custom', token))
      .toContain('--suitecustom-col-xs-flex');
    expect(getGridColPrefixCss('column-</style><script>', 'suite', token))
      .not.toContain('</style');
  });
});
