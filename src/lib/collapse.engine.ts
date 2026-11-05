import type { CollapseActiveKey, CollapseItem, CollapseTrigger } from './collapse.types';

export function normalizeCollapseItems(items: readonly CollapseItem[]) {
  const seen = new Set<string>();

  return items.flatMap((item, index) => {
    const key = String(item.key ?? index);
    if (seen.has(key)) return [];

    seen.add(key);
    return [{ ...item, key }];
  });
}

export function getCollapseKeys(value: CollapseActiveKey | undefined, accordion = false): string[] {
  const source = typeof value === 'string' || typeof value === 'number' ? [value] : value ?? [];
  const keys = [...new Set(source.map(String))];
  return accordion ? keys.slice(0, 1) : keys;
}

export function getCollapseTrigger(
  item: CollapseItem,
  fallback: CollapseTrigger = 'header'
): CollapseTrigger {
  const trigger = item.collapsible ?? fallback;
  return trigger === 'icon' && item.showArrow === false ? 'header' : trigger;
}

export function toggleCollapseKey(
  value: CollapseActiveKey | undefined,
  key: string,
  accordion = false
): string[] {
  const keys = getCollapseKeys(value, accordion);
  if (accordion) return keys[0] === key ? [] : [key];

  return keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key];
}

export function getCollapseFocusKey(
  items: readonly CollapseItem[],
  requested: string | undefined,
  open: readonly string[],
  collapsible: CollapseTrigger = 'header'
): string | undefined {
  const available = normalizeCollapseItems(items).filter(
    (item) => getCollapseTrigger(item, collapsible) !== 'disabled'
  );

  return available.find((item) => item.key === requested)?.key
    ?? available.find(
      (item) => open.includes(item.key)
    )?.key
    ?? available[0]?.key;
}
