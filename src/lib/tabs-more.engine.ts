import type { TabsMoreProps, TabsMoreTrigger } from './tabs.types';

/** Dropdown/useAction: независимые действия, contextMenu hide fallback и touch для hover. */
export function getTabsMoreActions(more: Pick<TabsMoreProps, 'trigger' | 'showAction' | 'hideAction'>) {
  const trigger = more.trigger ?? 'hover';
  const defaults = typeof trigger === 'string' ? [trigger] : trigger;
  const show = new Set<TabsMoreTrigger | 'touch'>(more.showAction ?? defaults);
  const hide = new Set<TabsMoreTrigger | 'touch'>(more.hideAction
    ?? (defaults.includes('contextMenu') ? ['click'] : defaults));
  if (show.has('hover') && !show.has('click')) show.add('touch');
  if (hide.has('hover') && !hide.has('click')) hide.add('touch');

  return { show, hide };
}
