import { describe, expect, it } from 'vitest';
import { getDrawerPrefixCss } from './drawer-prefix.engine';

describe('Drawer prefix stylesheet', () => {
  it('keeps the canonical stylesheet for ant-drawer', () => {
    expect(getDrawerPrefixCss('ant-drawer')).toBeUndefined();
  });

  it('isolates drawer/placement roots while retaining canonical token variables', () => {
    const css = getDrawerPrefixCss('panel')!;

    expect(css).toContain('.panel:where([data-ant-drawer-prefix="panel"])');
    expect(css).toContain('.panel-left:where([data-ant-drawer-prefix="panel"])');
    expect(css).toContain('.panel-mask-blur');
    expect(css).toContain('.panel-content-wrapper');
    expect(css).toContain('[class^="panel"]');
    expect(css).toContain('--ant-drawer-footer-padding-block');
    expect(css).not.toContain('.ant-drawer-body');
  });

  it('preserves literal prefix text and escapes closing style tags', () => {
    expect(getDrawerPrefixCss('panel-$&')).toContain('.panel-$&-close');
    expect(getDrawerPrefixCss('panel-</style><script>')).not.toContain('</style');
  });
});
