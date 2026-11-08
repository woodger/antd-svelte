import { describe, expect, it } from 'vitest';
import { getBadgeRibbonPrefixCss } from './badge-ribbon-prefix.engine';

describe('Ribbon global prefix stylesheet', () => {
  it('uses the original vendor stylesheet for the default prefix', () => {
    expect(getBadgeRibbonPrefixCss('ant')).toBeUndefined();
  });

  it('changes geometry and shared resets while preserving token markers and namespace', () => {
    const css = getBadgeRibbonPrefixCss('suite')!;

    expect(css).toContain('.suite-ribbon-wrapper:where(.ant-ribbon-wrapper-css-var)');
    expect(css).toContain('.suite-ribbon:where(.ant-ribbon-css-var)');
    expect(css).toContain('.suite-ribbon-placement-end');
    expect(css).toContain('.suite-ribbon-corner');
    expect(css).toContain('var(--ant-color-primary)');
    expect(css).toContain('[class^="suite-ribbon"]');
    expect(css).not.toContain('.ant-ribbon-placement-end');
    expect(css).not.toContain('.suite-ribbon-css-var');
  });

  it('keeps aliases literal and escapes a closing style tag', () => {
    expect(getBadgeRibbonPrefixCss('ant-ribbon')).toContain('.ant-ribbon-ribbon-corner');
    expect(getBadgeRibbonPrefixCss('suite-$&')).toContain('.suite-$&-ribbon-corner');
    expect(getBadgeRibbonPrefixCss('</style><script>')).not.toContain('</style');
  });
});
