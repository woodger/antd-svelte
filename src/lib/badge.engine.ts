import type { BadgeProps } from './badge.types';

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
  const zero = scalarCount === 0 || scalarCount === '0' || text === '0';
  const hasText = typeof text === 'function' || Boolean(text);
  const hasStatus = (status !== undefined
    || color !== undefined)
    && (!hasCount
      || zero
      && !showZero);
  const statusStandalone = !hasChildren && hasStatus && (hasText || status !== undefined || !zero);
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
    showText: !hidden && hasText && (text !== '0' || showZero)
  };
}

export function normalizeBadgeOffset(offset:
  readonly [number, number]
  | undefined):
  readonly [number, number]
  | undefined {
  return offset
    ? [Number.isFinite(offset[0]) ? offset[0] : 0, Number.isFinite(offset[1]) ? offset[1] : 0]
    : undefined;
}
