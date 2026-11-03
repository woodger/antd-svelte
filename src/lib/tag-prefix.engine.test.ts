import { describe, expect, it } from 'vitest';
import { getTagPrefixCss } from './tag-prefix.engine';

describe('Tag prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getTagPrefixCss('ant-tag')).toBeUndefined();
  });

  it('changes Tag, CheckableTag and Group selectors while preserving variables and icons', () => {
    const css = getTagPrefixCss('tenant-tag')!;

    expect(css).toContain('.tenant-tag:where(.ant-tag-css-var)');
    expect(css).toContain('.tenant-tag-close-icon');
    expect(css).toContain('.tenant-tag-checkable-checked');
    expect(css).toContain('.tenant-tag-checkable-group');
    expect(css).toContain('.tenant-tag-blue');
    expect(css).toContain('[class^="tenant-tag"]');
    expect(css).toContain('[class*=" tenant-tag"]');
    expect(css).toContain('--ant-tag-default-bg');
    expect(css).toContain('.anticon');
    expect(css).not.toContain('--tenant-tag-default-bg');
    expect(css).not.toContain('.ant-tag-checkable');
    expect(css).not.toContain('ant-picker-tag');
    expect(css).not.toContain('@keyframes');
  });

  it('keeps replacement characters literal and prevents a closing HTML style tag', () => {
    expect(getTagPrefixCss('tag-$&')).toContain('.tag-$&-close-icon');
    expect(getTagPrefixCss('tag-</style><script>')).not.toContain('</style');
  });
});
