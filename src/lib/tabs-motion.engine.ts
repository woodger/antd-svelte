import type { TabsAnimatedConfig, TabsMotionName } from './tabs-motion.types';

/** Два исходных useAnimateConfig: Ant Design wrapper, затем rc-tabs 1.13.0. */
export function getTabsAnimation(
  animated: boolean | TabsAnimatedConfig | undefined,
  prefixCls = 'ant-tabs'
) {
  let result: TabsAnimatedConfig;
  if (animated === false) result = { inkBar: false, tabPane: false };
  else if (animated === true) result = { inkBar: true, tabPane: true };
  else result = { inkBar: true, ...(animated ?? { tabPane: false }) };

  if (result.tabPane) {
    result.tabPaneMotion = {
      motionAppear: false,
      motionEnter: true,
      motionLeave: true,
      motionName: `${prefixCls}-switch`
    };
  }
  if (result.tabPaneMotion && result.tabPane === undefined)
    result.tabPane = true;
  if (!result.tabPaneMotion && result.tabPane)
    result.tabPane = false;

  return result;
}

export function getTabsMotionClassName(
  name: TabsMotionName | undefined,
  status: 'appear' | 'enter' | 'leave',
  step: 'prepare' | 'start' | 'active'
) {
  if (!name) return undefined;
  if (typeof name === 'string') return `${name}-${status} ${name}-${status}-${step} ${name}`;

  const suffix = `${status}${step[0].toUpperCase()}${step.slice(1)}` as keyof typeof name;
  return [name[status], name[suffix]].filter(Boolean).join(' ') || undefined;
}
