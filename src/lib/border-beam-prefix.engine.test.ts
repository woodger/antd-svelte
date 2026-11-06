import { describe, expect, it } from 'vitest';
import { getBorderBeamPrefixCss } from './border-beam-prefix.engine';

describe('BorderBeam prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getBorderBeamPrefixCss('ant-border-beam')).toBeUndefined();
  });

  it('scopes root selectors while preserving variables, supports, media and keyframes', () => {
    const css = getBorderBeamPrefixCss('tenant-beam')!;

    expect(css).toContain('.tenant-beam:where([data-ant-border-beam-prefix])::before');
    expect(css).toContain('[class^="tenant-beam"]');
    expect(css).toContain('[class*=" tenant-beam"]');
    expect(css).toContain('--ant-border-beam-line-width');
    expect(css).not.toContain('--tenant-beam-line-width');
    expect(css).toContain('@supports (offset-path: rect(0 auto auto 0 round 1px))');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@keyframes antBorderBeamMove');
    expect(css).not.toContain('.ant-border-beam{');
  });

  it('keeps literal replacements and escapes closing style tags', () => {
    expect(getBorderBeamPrefixCss('beam-$&')).toContain('.beam-$&:where(');
    expect(getBorderBeamPrefixCss('ant-border-beam-css-var'))
      .toContain('.ant-border-beam-css-var:where(');
    expect(getBorderBeamPrefixCss('ant-border-beam-app')).not.toContain('app-app');
    expect(getBorderBeamPrefixCss('beam-</style><script>')).not.toContain('</style');
  });
});
