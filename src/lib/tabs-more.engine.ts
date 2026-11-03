import type { TabsMorePlacements, TabsMoreProps, TabsMoreTrigger } from './tabs.types';

// Таблица placements rc-dropdown 1.0.3; MIT, vendor/LICENSE.rc-dropdown.
const targetOffset = [0, 0] as const;
const overflow = { adjustX: 1, adjustY: 1 };
const placements: TabsMorePlacements = {
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    targetOffset,
    overflow
  },
  top: {
    points: ['bc', 'tc'],
    offset: [0, -4],
    targetOffset,
    overflow
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    targetOffset,
    overflow
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    targetOffset,
    overflow
  },
  bottom: {
    points: ['tc', 'bc'],
    offset: [0, 4],
    targetOffset,
    overflow
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    targetOffset,
    overflow
  }
};

export function getTabsMorePlacements(more: TabsMoreProps | undefined) {
  return more && Object.hasOwn(more, 'builtinPlacements')
    ? more.builtinPlacements ?? {} : more?.placements ?? placements;
}

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
