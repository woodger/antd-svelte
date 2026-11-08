import { describe, expect, it } from 'vitest';
import { getBreadcrumbPrefixCss } from './breadcrumb-prefix.engine';

describe('Breadcrumb prefix stylesheet', () => {
  it('keeps the existing default stylesheet', () => {
    expect(getBreadcrumbPrefixCss('ant-breadcrumb')).toBeUndefined();
  });

  it('rewrites item, separator and overlay rules without changing the token or icon namespaces', () => {
    const css = getBreadcrumbPrefixCss('trail')!;

    expect(css).toContain('.trail:where(.ant-breadcrumb-css-var:where([data-ant-breadcrumb-prefix="trail"]))');
    expect(css).toContain('.trail-separator');
    expect(css).toContain('.trail-overlay-link');
    expect(css).toContain('.trail-link >svg');
    expect(css).toContain('.anticon');
    expect(css).toContain('var(--ant-breadcrumb-link-color)');
    expect(css).not.toContain('.ant-breadcrumb-item');
  });

  it('keeps literal aliases and escapes closing style text', () => {
    expect(getBreadcrumbPrefixCss('ant-breadcrumb-link')).not.toContain('link-link-link');
    expect(getBreadcrumbPrefixCss('trail-$&')).toContain('.trail-$&-separator');
    expect(getBreadcrumbPrefixCss('trail-</style><script>')).not.toContain('</style');
  });
});
