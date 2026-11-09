import { describe, expect, it } from 'vitest';
import { getMenuPrefixCss } from './menu-prefix.engine';

describe('Menu prefix stylesheet', () => {
  it('keeps canonical base and scoped theme styles without an extra sheet', () => {
    expect(getMenuPrefixCss('ant-menu', 'ant')).toBeUndefined();
  });

  it('isolates owner and popup roots while preserving canonical token and link reset markers', () => {
    const css = getMenuPrefixCss('navigation', 'suite')!;

    expect(css).toContain('.navigation:where([data-ant-menu-prefix="navigation"][data-ant-menu-root-prefix="suite"])');
    expect(css).toContain('.navigation-submenu-popup:where(');
    expect(css).toContain('@scope (.ant-menu-css-var:where(');
    expect(css).toContain('.navigation-item-selected');
    expect(css).toContain('.navigation-dark');
    expect(css).toContain('.suite-typography-ellipsis-single-line');
    expect(css).toContain('--ant-menu-item-selected-bg');
    expect(css).not.toContain('.ant-menu-submenu-title');
    expect(getMenuPrefixCss('ant-menu', 'suite')).toContain('.suite-typography');
  });

  it('uses literal replacement text and escapes closing style tags', () => {
    expect(getMenuPrefixCss('navigation-$&', 'suite')).toContain('.navigation-$&-item');
    expect(getMenuPrefixCss('navigation-</style><script>', 'suite')).not.toContain('</style');
  });
});
