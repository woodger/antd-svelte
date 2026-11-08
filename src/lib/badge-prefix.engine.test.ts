import { describe, expect, it } from 'vitest';
import { getBadgePrefixCss } from './badge-prefix.engine';

describe('Badge prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getBadgePrefixCss('ant-badge')).toBeUndefined();
  });

  it('changes badge selectors and shared resets while preserving global number selectors', () => {
    const css = getBadgePrefixCss('tenant-badge')!;

    expect(css).toContain('.tenant-badge:where(.ant-badge-css-var)');
    expect(css).toContain('.tenant-badge-count');
    expect(css).toContain('.tenant-badge-zoom-enter');
    expect(css).toContain('[class^="tenant-badge"]');
    expect(css).toContain('[class*=" tenant-badge"]');
    expect(css).toContain('.ant-scroll-number-only');
    expect(css).toContain('.ant-scroll-number-custom-component');
    expect(css).not.toContain('.tenant-scroll-number');
    expect(css).not.toContain('.ant-badge-count');
    expect(css).toContain('@keyframes antZoomBadgeIn');
  });

  it('keeps replacement characters literal and prevents a closing HTML style tag', () => {
    expect(getBadgePrefixCss('badge-$&')).toContain('.badge-$&-count');
    expect(getBadgePrefixCss('badge-</style><script>')).not.toContain('</style');
  });

  it('keeps global number selectors independent of a local Badge prefix', () => {
    const css = getBadgePrefixCss('local-badge', 'suite')!;

    expect(css).toContain('.local-badge:where(.ant-badge-css-var) .suite-scroll-number');
    expect(css).toContain('.suite-scroll-number-only');
    expect(css).not.toContain('.ant-scroll-number');
    expect(getBadgePrefixCss('ant-badge', 'suite')).toContain('.suite-scroll-number');
  });

  it('does not rewrite an inserted Badge alias as a number selector', () => {
    const css = getBadgePrefixCss('ant-scroll-number', 'suite')!;

    expect(css).toContain('.ant-scroll-number:where(.ant-badge-css-var)');
    expect(css).toContain('.ant-scroll-number-count');
    expect(css).toContain('.suite-scroll-number-only');
    expect(getBadgePrefixCss('badge', 'root-$&')).toContain('.root-$&-scroll-number-only');
    expect(getBadgePrefixCss('badge', '</style><script>')).not.toContain('</style');
  });
});
