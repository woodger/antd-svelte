import { describe, expect, it } from 'vitest';
import { getTabsAnimation, getTabsMotionClassName } from './tabs-motion.engine';

describe('Tabs source animation config', () => {
  it('keeps the default ink bar, disables both for false and enables switch panes for true', () => {
    expect(getTabsAnimation(undefined)).toEqual({ inkBar: true, tabPane: false });
    expect(getTabsAnimation(false)).toEqual({ inkBar: false, tabPane: false });
    expect(getTabsAnimation(true)).toEqual({
      inkBar: true,
      tabPane: true,
      tabPaneMotion: {
        motionAppear: false,
        motionEnter: true,
        motionLeave: true,
        motionName: 'ant-tabs-switch'
      }
    });
  });

  it('preserves explicit undefined inkBar and does not enable panes for an empty record', () => {
    expect(getTabsAnimation({})).toEqual({ inkBar: true });
    expect(getTabsAnimation({ inkBar: undefined, tabPane: false }))
      .toEqual({ inkBar: undefined, tabPane: false });
  });

  it('replaces custom motion only for an explicitly enabled tabPane without changing the input', () => {
    const custom = Object.freeze({ motionName: 'custom', motionDeadline: 80 });
    const source = Object.freeze({ inkBar: false, tabPane: true, tabPaneMotion: custom });
    const result = getTabsAnimation(source);

    expect(result.inkBar).toBe(false);
    expect(result.tabPaneMotion).toEqual(getTabsAnimation(true).tabPaneMotion);
    expect(source.tabPaneMotion).toBe(custom);
    expect(getTabsAnimation({ tabPaneMotion: custom }))
      .toEqual({ inkBar: true, tabPane: true, tabPaneMotion: custom });
    expect(getTabsAnimation({ tabPane: false, tabPaneMotion: custom }))
      .toEqual({ inkBar: true, tabPane: false, tabPaneMotion: custom });
  });

  it('maps string and object motion names to the source phase classes', () => {
    expect(getTabsMotionClassName('tabs-switch', 'enter', 'start'))
      .toBe('tabs-switch-enter tabs-switch-enter-start tabs-switch');
    expect(getTabsMotionClassName({ leave: 'leaving', leaveActive: 'leaving-now' }, 'leave', 'active'))
      .toBe('leaving leaving-now');
    expect(getTabsMotionClassName({ enter: 'entering' }, 'enter', 'start')).toBe('entering');
    expect(getTabsMotionClassName(undefined, 'appear', 'prepare')).toBeUndefined();
  });
});
