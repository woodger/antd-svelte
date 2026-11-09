import { describe, expect, it } from 'vitest';
import { getTourPrefixCss } from './tour-prefix.engine';

describe('Tour prefix stylesheet', () => {
  it('keeps default CSS when component and global prefixes are default', () => {
    expect(getTourPrefixCss('ant-tour', 'ant')).toBeUndefined();
  });

  it('separates Tour parts, global Button selectors and private Tooltip namespace', () => {
    const css = getTourPrefixCss('guide', 'suite')!;

    expect(css).toContain('.guide:where([data-ant-tour-prefix="guide"][data-ant-tour-global="suite"])');
    expect(css).toContain('.guide-placement-top:where(');
    expect(css).toContain('.guide-mask:where(');
    expect(css).toContain('.guide-actions .suite-btn');
    expect(css).toContain('--suite-tooltip-arrow-background-color');
    expect(css).toContain('--ant-tour-close-btn-size');
    expect(css).not.toContain('.ant-tour-section');
  });

  it('keeps canonical local classes separate from global private names and literal replacements', () => {
    expect(getTourPrefixCss('ant-tour', 'suite.custom')).toContain('--suitecustom-tooltip-arrow-');
    expect(getTourPrefixCss('guide-$&', 'suite')).toContain('.guide-$&-section');
    expect(getTourPrefixCss('guide-</style><script>', 'suite')).not.toContain('</style');
  });
});
