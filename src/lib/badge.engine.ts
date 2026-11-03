import type { BadgeOffset, BadgeProps } from './badge.types';

type BadgeOptions = Pick<
  BadgeProps,
  'count' | 'overflowCount' | 'showZero' | 'dot' | 'status' | 'color' | 'text'
> & {
  hasChildren?: boolean;
};

export function getBadgeState(
  {
    count: sourceCount,
    overflowCount = 99,
    showZero = false,
    dot = false,
    status,
    color,
    text,
    hasChildren = false
  }: BadgeOptions
) {
  const count = typeof sourceCount === 'number' && Number.isFinite(sourceCount)
    ? sourceCount
    : undefined;
  const customCount = typeof sourceCount === 'function';
  const scalarCount = typeof sourceCount === 'string' || typeof sourceCount === 'boolean'
    ? sourceCount : count;
  const hasCount = scalarCount !== undefined || customCount;
  const renderable = customCount || scalarCount !== undefined
    && scalarCount !== false && scalarCount !== '';
  const limit = Number.isFinite(overflowCount) && overflowCount >= 0 ? overflowCount : 99;
  const zero = scalarCount === 0 || scalarCount === '0' || text === '0' || text === 0;
  const hasText = text !== undefined && text !== null && text !== false && text !== '';
  const hasStatus = (status !== undefined
    || color !== undefined)
    && (!hasCount
      || zero
      && !showZero);
  const statusStandalone = !hasChildren && hasStatus
    && (Boolean(text) || status !== undefined || !zero);
  const showAsDot = dot && !zero;
  const hidden = (!renderable && !hasText || zero && !showZero) && !showAsDot;
  const numberedCount = Number(scalarCount) > limit ? `${limit}+` : scalarCount;

  return {
    count,
    titleCount: typeof sourceCount === 'string' ? sourceCount : count,
    descriptionCount: typeof sourceCount === 'string' ? sourceCount
      : sourceCount === true ? 'true' : count,
    customCount,
    displayValue: showAsDot || customCount ? '' : numberedCount,
    display: showAsDot || !renderable || customCount ? ''
      : String(numberedCount),
    hasStatus,
    statusStandalone,
    showAsDot,
    hidden,
    visible: statusStandalone || !hidden,
    showText: !hidden && (text === 0 ? showZero : Boolean(text) && text !== true)
  };
}

export function normalizeBadgeOffset(
  offset: BadgeOffset | undefined
): readonly [number, number | string] | undefined {
  if (!offset) return undefined;

  return [
    typeof offset[0] === 'string' ? Number.parseFloat(offset[0])
      : Number.isFinite(offset[0]) ? offset[0] : 0,
    typeof offset[1] === 'string' ? offset[1] : Number.isFinite(offset[1]) ? offset[1] : 0
  ];
}
