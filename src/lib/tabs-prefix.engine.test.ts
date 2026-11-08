import { describe, expect, it } from 'vitest';
import { getTabsPrefixCss } from './tabs-prefix.engine';
import { getTabsAnimation } from './tabs-motion.engine';

describe('Tabs prefix styles and motion names', () => {
  it('keeps the default stylesheet and default motion contract', () => {
    expect(getTabsPrefixCss('ant-tabs')).toBeUndefined();
    expect(getTabsAnimation(true).tabPaneMotion?.motionName).toBe('ant-tabs-switch');
  });

  it('isolates local root states, content and More from the shared slide prefix', () => {
    const css = getTabsPrefixCss('work-tabs', 'suite')!;

    expect(css).toContain(
      '.work-tabs-card:where([data-ant-tabs-prefix="work-tabs"][data-ant-tabs-global="suite"])'
    );
    expect(css).toContain('.work-tabs-tab-remove');
    expect(css).toContain('.work-tabs-switch-enter-active');
    expect(css).toContain('.work-tabs-dropdown.suite-slide-up');
    expect(css).toContain('@keyframes antSlideUpIn');
    expect(css).toContain('--ant-tabs-item-selected-color');
    expect(css).not.toContain('.ant-tabs-tab');
    expect(getTabsAnimation(true, 'work-tabs').tabPaneMotion?.motionName).toBe('work-tabs-switch');
  });

  it('supports a canonical local prefix with a different global prefix and literal replacements', () => {
    expect(getTabsPrefixCss('ant-tabs', 'suite')).toContain('.suite-slide-down');
    expect(getTabsPrefixCss('ant-tabs-card')).not.toContain('card-card-card');
    expect(getTabsPrefixCss('work-$&')).toContain('.work-$&-tab');
    expect(getTabsPrefixCss('work-</style><script>')).not.toContain('</style');
  });
});
