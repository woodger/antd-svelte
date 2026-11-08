import { describe, expect, it } from 'vitest';
import { getAnchorPrefixCss } from './anchor-prefix.engine';

describe('Anchor prefix stylesheet', () => {
  it('keeps the default stylesheet unchanged', () => {
    expect(getAnchorPrefixCss('ant-anchor')).toBeUndefined();
  });

  it('keeps nested spacing and horizontal rules in the owner token scope', () => {
    const css = getAnchorPrefixCss('nav')!;

    expect(css).toContain('.nav-wrapper:where(.ant-anchor-css-var:where([data-ant-anchor-prefix="nav"]))');
    expect(css).toContain('.nav .nav-link .nav-link');
    expect(css).toContain('.nav-link-active>.nav-link-title');
    expect(css).toContain('.nav-wrapper-horizontal');
    expect(css).toContain('var(--ant-anchor-link-padding-inline-start)');
    expect(css).not.toContain('.ant-anchor-link');
  });

  it('keeps literal aliases and escapes closing style text', () => {
    expect(getAnchorPrefixCss('ant-anchor-link')).not.toContain('link-link-link');
    expect(getAnchorPrefixCss('nav-$&')).toContain('.nav-$&-ink');
    expect(getAnchorPrefixCss('nav-</style><script>')).not.toContain('</style');
  });
});
