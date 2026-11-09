import { describe, expect, it } from 'vitest';
import { getInputSearchPrefixCss } from './input-search-prefix.engine';

describe('InputSearch prefix stylesheet', () => {
  it('retains the default stylesheet for the default local and global prefixes', () => {
    expect(getInputSearchPrefixCss('ant-input-search')).toBeUndefined();
  });

  it('separates Search classes, global Button classes and private height variables', () => {
    const css = getInputSearchPrefixCss('finder', 'suite')!;

    expect(css).toContain('.finder-btn.suite-btn-icon-only');
    expect(css).toContain('--suite-input-search-btn-height');
    expect(css).toContain('--ant-input-padding-block-sm');
    expect(css).toContain('data-ant-input-search-prefix="finder"');
    expect(css).not.toContain('.ant-input-search-btn');
    expect(css).not.toContain('.css-var-_R_0_');
  });

  it('preserves literal prefix text, strips dots only in private variables and escapes style', () => {
    const css = getInputSearchPrefixCss('finder-$&', 'suite.custom')!;

    expect(css).toContain('.finder-$&-btn');
    expect(css).toContain('--suitecustom-input-search-btn-height');
    expect(getInputSearchPrefixCss('finder-</style><script>')).not.toContain('</style');
  });
});
