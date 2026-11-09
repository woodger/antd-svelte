import { describe, expect, it } from 'vitest';
import { getDropdownPrefixCss } from './dropdown-prefix.engine';

describe('Dropdown prefix stylesheet', () => {
  it('keeps the default stylesheet for canonical Dropdown and Button namespaces', () => {
    expect(getDropdownPrefixCss('ant-dropdown', 'ant')).toBeUndefined();
  });

  it('isolates popup/menu/placement roots and uses the shared Button namespace', () => {
    const css = getDropdownPrefixCss('commands', 'suite')!;

    expect(css).toContain('.commands:where([data-ant-dropdown-prefix="commands"][data-ant-dropdown-root-prefix="suite"])');
    expect(css).toContain('.commands-menu-vertical:where(');
    expect(css).toContain('.commands-placement-bottomLeft:where(');
    expect(css).toContain('.commands-trigger:where(');
    expect(css).toContain('.suite-btn-icon');
    expect(css).toContain('--ant-dropdown-padding-block');
    expect(css).not.toContain('.ant-dropdown-arrow');
    expect(css).not.toContain('.ant-btn');
    expect(getDropdownPrefixCss('ant-dropdown', 'suite')).toContain('.suite-btn');
  });

  it('preserves literal replacement text and escapes closing style tags', () => {
    expect(getDropdownPrefixCss('commands-$&', 'suite')).toContain('.commands-$&-menu-item');
    expect(getDropdownPrefixCss('commands-</style><script>', 'suite')).not.toContain('</style');
  });
});
