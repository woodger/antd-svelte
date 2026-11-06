import { describe, expect, it } from 'vitest';
import { getAffixPrefixCss } from './affix-prefix.engine';

describe('Affix prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getAffixPrefixCss('ant-affix')).toBeUndefined();
  });

  it('scopes fixed selectors and defaults while preserving variables and the marker', () => {
    const css = getAffixPrefixCss('tenant-affix')!;

    expect(css).toContain('.tenant-affix:where([data-ant-affix-prefix])');
    expect(css).toContain('[class^="tenant-affix"]');
    expect(css).toContain('[class*=" tenant-affix"]');
    expect(css).toContain('.ant-affix-css-var:where([data-ant-affix-prefix]){');
    expect(css).toContain('--ant-affix-z-index-popup:10');
    expect(css).not.toContain('--tenant-affix-z-index-popup');
    expect(css).not.toContain('\n.ant-affix-css-var{');
  });

  it('keeps literal replacements and isolates overlapping prefixes', () => {
    expect(getAffixPrefixCss('affix-$&')).toContain('.affix-$&:where(');
    expect(getAffixPrefixCss('ant-affix-css-var')).toContain('.ant-affix-css-var:where(');
    expect(getAffixPrefixCss('ant-affix-business')).not.toContain('business-business');
    expect(getAffixPrefixCss('affix-</style><script>')).not.toContain('</style');
  });
});
