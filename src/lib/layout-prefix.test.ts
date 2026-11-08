import { describe, expect, it } from 'vitest';
import { getLayoutPrefixCss } from './layout-prefix.engine';

describe('Layout local prefix boundary', () => {
  it('uses the shared sheet by default and keeps independent Layout and Sider namespaces', () => {
    expect(getLayoutPrefixCss('ant-layout', 'layout')).toBeUndefined();
    expect(getLayoutPrefixCss('ant-layout-sider', 'sider')).toBeUndefined();
    const layout = getLayoutPrefixCss('frame', 'layout')!;
    const sider = getLayoutPrefixCss('sidebar', 'sider')!;

    expect(layout).toContain('.frame:where([data-ant-layout-prefix="layout"])');
    expect(layout).not.toContain('.frame-sider');
    expect(sider).toContain('.sidebar-children');
    expect(sider).toContain('.sidebar-zero-width:where([data-ant-layout-prefix="sider"])');
    expect(sider).toContain('.ant-menu.ant-menu-inline-collapsed');
  });

  it('keeps token names and low-specificity defaults on their owning root', () => {
    for (const part of ['layout', 'sider'] as const) {
      const css = getLayoutPrefixCss('ant-layout-css-var', part)!;

      expect(css).toContain(`:where(.ant-layout-css-var[data-ant-layout-prefix="${part}"])`);
      expect(css).toContain('--ant-layout-header-height');
      expect(css).not.toContain('--ant-layout-css-var-header-height');
    }
  });

  it('keeps literal replacement text and escapes closing style tags', () => {
    const css = getLayoutPrefixCss('frame-$&</STYLE><script>', 'layout')!;

    expect(css).toContain('frame-$&<\\/style><script>-header');
    expect(css).not.toMatch(/<\/style/i);
  });
});
