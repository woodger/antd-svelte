import { describe, expect, it } from 'vitest';
import { getSpacePrefixCss } from './space-prefix.engine';
import { getSpaceCompactPrefixCss } from './space-compact-prefix.engine';
import { getSpaceAddonPrefixCss } from './space-addon-prefix.engine';
import { spaceGap } from './space.engine';

describe('Space family prefix stylesheets', () => {
  it('keeps existing default stylesheets without generated overrides', () => {
    expect(getSpacePrefixCss('ant-space')).toBeUndefined();
    expect(getSpaceCompactPrefixCss('ant-space-compact')).toBeUndefined();
    expect(getSpaceAddonPrefixCss('ant-space-addon')).toBeUndefined();
  });

  it('uses the local prefix for preset gaps and the shared prefix for the Badge rule', () => {
    const css = getSpacePrefixCss('flow', 'suite')!;

    expect(spaceGap(['medium', 'small'], 'flow')).toEqual({
      classes: ['flow-gap-col-medium', 'flow-gap-row-small'], style: ''
    });
    expect(css).toContain('.flow-item>.suite-badge-not-a-wrapper:only-child');
    expect(css).toContain('.flow-gap-row-medium:where(');
    expect(css).toContain('.ant-space-css-var');
    expect(css).not.toContain('.ant-badge-not-a-wrapper');
  });

  it('keeps Compact and Addon local prefixes independent from private variable namespaces', () => {
    const compact = getSpaceCompactPrefixCss('group')!;
    const addon = getSpaceAddonPrefixCss('cell', 'suite.v1')!;

    expect(compact).toContain('.group-block:where([data-ant-space-compact-prefix="group"])');
    expect(compact).toContain('.ant-space-compact-css-var');
    expect(addon).toContain('.cell-compact-first-item:where(');
    expect(addon).toContain('--suitev1-space-addon-addon-border-color:');
    expect(addon).toContain('var(--suitev1-space-addon-addon-background)');
    expect(addon).toContain('var(--ant-color-error)');
    expect(addon).not.toContain('--ant-space-addon-');
  });

  it('keeps literal aliases and escapes closing style text', () => {
    expect(getSpacePrefixCss('ant-space-item')).not.toContain('item-item-item');
    expect(getSpaceAddonPrefixCss('cell-$&')).toContain('.cell-$&-status-error');
    expect(getSpacePrefixCss('flow-</style><script>')).not.toContain('</style');
    expect(getSpaceCompactPrefixCss('group-</style><script>')).not.toContain('</style');
    expect(getSpaceAddonPrefixCss('cell-</style><script>')).not.toContain('</style');
  });
});
