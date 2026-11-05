import { describe, expect, it } from 'vitest';
import { getSegmentedPrefixCss } from './segmented-prefix.engine';

describe('Segmented prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getSegmentedPrefixCss('ant-segmented')).toBeUndefined();
  });

  it('scopes defaults and root states while preserving variables and the shared marker', () => {
    const css = getSegmentedPrefixCss('tenant-segmented')!;

    expect(css).toContain('.tenant-segmented:where([data-ant-segmented-prefix])');
    expect(css).toContain('.tenant-segmented-vertical:where([data-ant-segmented-prefix])');
    expect(css).toContain('.tenant-segmented-disabled:where([data-ant-segmented-prefix])');
    expect(css).toContain('.tenant-segmented-item-icon+*');
    expect(css).toContain('.tenant-segmented-thumb');
    expect(css).toContain('[class^="tenant-segmented"]');
    expect(css).toContain('.ant-segmented-css-var:where([data-ant-segmented-prefix]){');
    expect(css).toContain('--ant-segmented-track-padding');
    expect(css).not.toContain('--tenant-segmented-track-padding');
    expect(css).not.toContain('.ant-segmented-item');
    expect(css).not.toContain('\n.ant-segmented-css-var{');
  });

  it('keeps literal replacements and isolates prefixes overlapping the shared marker', () => {
    expect(getSegmentedPrefixCss('segmented-$&')).toContain('.segmented-$&-item');
    expect(getSegmentedPrefixCss('ant-segmented-business')).not.toContain('business-business');
    expect(getSegmentedPrefixCss('ant-segmented-css-var'))
      .toContain('.ant-segmented-css-var:where([data-ant-segmented-prefix])');
    expect(getSegmentedPrefixCss('segmented-</style><script>')).not.toContain('</style');
  });
});
