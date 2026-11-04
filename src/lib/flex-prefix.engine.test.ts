import { describe, expect, it } from 'vitest';
import { getFlexPrefixCss } from './flex-prefix.engine';

describe('Flex prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getFlexPrefixCss('ant-flex')).toBeUndefined();
  });

  it('changes root modifiers while preserving aliases and the shared marker', () => {
    const css = getFlexPrefixCss('tenant-flex')!;

    expect(css).toContain('.tenant-flex:where([data-ant-flex-prefix])');
    expect(css).toContain('.tenant-flex-gap-small:where([data-ant-flex-prefix])');
    expect(css).toContain('.tenant-flex-align-stretch:where([data-ant-flex-prefix])');
    expect(css).toContain('.tenant-flex-wrap-wrap-reverse:where([data-ant-flex-prefix])');
    expect(css).toContain('.ant-flex-css-var');
    expect(css).toContain('--ant-padding-xs');
    expect(css).not.toContain('--tenant-flex-padding-xs');
  });

  it('keeps replacement characters literal and avoids rescanning inserted prefixes', () => {
    expect(getFlexPrefixCss('flex-$&')).toContain('.flex-$&-vertical');
    expect(getFlexPrefixCss('ant-flex-business')).not.toContain('business-business');
    expect(getFlexPrefixCss('ant-flex-css-var'))
      .toContain('.ant-flex-css-var:where([data-ant-flex-prefix])');
    expect(getFlexPrefixCss('flex-</style><script>')).not.toContain('</style');
  });
});
