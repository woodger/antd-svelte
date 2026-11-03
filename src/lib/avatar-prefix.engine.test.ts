import { describe, expect, it } from 'vitest';
import { getAvatarPrefixCss } from './avatar-prefix.engine';

describe('Avatar prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getAvatarPrefixCss('ant-avatar')).toBeUndefined();
  });

  it('changes Avatar and Group selectors while preserving global integrations', () => {
    const css = getAvatarPrefixCss('tenant-avatar')!;

    expect(css).toContain('.tenant-avatar:where(.ant-avatar-css-var)');
    expect(css).toContain(':is(.tenant-avatar,.tenant-avatar-group):where(.ant-avatar-css-var)');
    expect(css).not.toMatch(/(?:^|\n|,)\.ant-avatar-css-var[\s:{]/);
    expect(css).toContain('.tenant-avatar-square');
    expect(css).toContain('.tenant-avatar-lg');
    expect(css).toContain('.tenant-avatar-group');
    expect(css).toContain('.tenant-avatar-group-popover');
    expect(css).toContain('[class^="tenant-avatar"]');
    expect(css).toContain('[class*=" tenant-avatar"]');
    expect(css).toContain('--ant-avatar-container-size');
    expect(css).toContain('.ant-image-img');
    expect(css).toContain('.anticon');
    expect(css).not.toContain('.tenant-image-img');
    expect(css).not.toContain('--tenant-avatar-container-size');
    expect(css).not.toContain('@keyframes');
  });

  it('keeps replacement characters literal and prevents a closing HTML style tag', () => {
    expect(getAvatarPrefixCss('avatar-$&')).toContain('.avatar-$&-group');
    expect(getAvatarPrefixCss('avatar-</style><script>')).not.toContain('</style');
  });
});
