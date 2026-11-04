import { describe, expect, it } from 'vitest';
import { getDividerPrefixCss } from './divider-prefix.engine';

describe('Divider prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getDividerPrefixCss('ant-divider')).toBeUndefined();
  });

  it('changes roots, variants and descendants without changing variables or the shared marker', () => {
    const css = getDividerPrefixCss('tenant-divider')!;

    expect(css).toContain('.tenant-divider:where([data-ant-divider-prefix])');
    expect(css).toContain('.tenant-divider-vertical:where([data-ant-divider-prefix])');
    expect(css).toContain('.tenant-divider-with-text-start:where([data-ant-divider-prefix])');
    expect(css).toContain('.tenant-divider-rail-start');
    expect(css).toContain('.tenant-divider-inner-text');
    expect(css).toContain('[class^="tenant-divider"]');
    expect(css).toContain('--ant-divider-text-padding-inline');
    expect(css).toContain('.ant-divider-css-var');
    expect(css).not.toContain('\n.ant-divider-css-var{');
    expect(css).not.toContain('--tenant-divider-text-padding-inline');
  });

  it('keeps replacements literal and isolates a prefix that matches the shared marker', () => {
    expect(getDividerPrefixCss('divider-$&')).toContain('.divider-$&-rail');
    expect(getDividerPrefixCss('ant-divider-business')).not.toContain('business-business');
    expect(getDividerPrefixCss('ant-divider-css-var'))
      .toContain('.ant-divider-css-var:where([data-ant-divider-prefix])');
    expect(getDividerPrefixCss('divider-</style><script>')).not.toContain('</style');
  });
});
