import { describe, expect, it } from 'vitest';
import { getBadgeState, normalizeBadgeOffset } from './badge.engine';

describe('Badge display state', () => {
  it('hides absent and zero values without inventing a count', () => {
    for (const count of [undefined, 0, -0, NaN, Infinity, -Infinity])
      expect(getBadgeState({ count }).visible).toBe(false);

    expect(getBadgeState({ count: NaN, showZero: true }).count).toBeUndefined();
    expect(getBadgeState({ count: NaN, showZero: true }).visible).toBe(false);
  });
  it.each([[98, '98'], [99, '99'], [100, '99+'], [2.5, '2.5'], [-4, '-4']])(
    'formats %s as %s while retaining the full finite value',
    (count, display) => {
      const state = getBadgeState({ count });

      expect(state.display).toBe(display);
      expect(state.count).toBe(count);
      expect(state.visible).toBe(true);
    }
  );
  it('supports explicit limits including zero and fractional values', () => {
    expect(getBadgeState({ count: 1, overflowCount: 0 }).display).toBe('0+');
    expect(getBadgeState({ count: 3, overflowCount: 2.5 }).display).toBe('2.5+');
    expect(getBadgeState({ count: 0, overflowCount: 0, showZero: true }).display).toBe('0');
  });
  it.each([NaN, Infinity, -Infinity, -1])(
    'uses the default overflow limit for %s',
    overflowCount => {
      expect(getBadgeState({ count: 120, overflowCount }).display).toBe('99+');
    }
  );
  it(
    'shows an empty dot without count but gives numeric zero priority when showZero is true',
    () => {
      expect(getBadgeState({ dot: true })).toMatchObject(
        { visible: true, showAsDot: true, display: '' }
      );
      expect(getBadgeState({ count: 0, dot: true })).toMatchObject(
        { visible: false, showAsDot: false }
      );
      expect(getBadgeState({ count: 0, dot: true, showZero: true })).toMatchObject(
        { visible: true, showAsDot: false, display: '0' }
      );
      expect(getBadgeState({ count: 120, dot: true })).toMatchObject(
        { visible: true, showAsDot: true, count: 120, display: '' }
      );
    }
  );
  it('renders standalone statuses and colors when count is absent or a hidden zero', () => {
    expect(getBadgeState({ status: 'success' })).toMatchObject(
      { hasStatus: true, statusStandalone: true, visible: true }
    );
    expect(getBadgeState({ status: 'success', count: 0 })).toMatchObject(
      { hasStatus: true, statusStandalone: true, visible: true }
    );
    expect(getBadgeState({ color: 'blue' })).toMatchObject(
      { hasStatus: true, statusStandalone: true, visible: true }
    );
    expect(getBadgeState({ color: 'blue', count: 0 })).toMatchObject(
      { statusStandalone: false, visible: false }
    );
  });
  it('gives visible numeric counts priority over standalone status styling', () => {
    expect(getBadgeState({ status: 'error', count: 5 })).toMatchObject(
      { hasStatus: false, statusStandalone: false, display: '5' }
    );
    expect(getBadgeState({ status: 'error', count: 0, showZero: true })).toMatchObject(
      { hasStatus: false, statusStandalone: false, display: '0' }
    );
  });
  it('keeps wrapped status badges consistent with explicit dot mode', () => {
    expect(getBadgeState({ hasChildren: true, status: 'success' })).toMatchObject(
      { statusStandalone: false, visible: false }
    );
    expect(getBadgeState({ hasChildren: true, status: 'success', dot: true })).toMatchObject(
      { statusStandalone: false, visible: true, showAsDot: true }
    );
  });
  it('preserves upstream text visibility including a literal zero label', () => {
    expect(getBadgeState({ status: 'success', text: 'Online' }).showText).toBe(true);
    expect(getBadgeState({ status: 'success', text: '0' }).showText).toBe(false);
    expect(getBadgeState({ status: 'success', text: '0', showZero: true }).showText).toBe(true);
    expect(getBadgeState({ count: 0, text: 'Zero' }).showText).toBe(false);
  });

  it('keeps numeric text separate from the decorative count', () => {
    expect(getBadgeState({ text: 12 })).toMatchObject({
      visible: true, showText: true, display: '', count: undefined
    });
    expect(getBadgeState({ count: 5, text: -3.5 })).toMatchObject({
      visible: true, showText: true, display: '5', count: 5
    });
  });

  it('applies numeric text zero to count visibility and explicit showZero', () => {
    expect(getBadgeState({ text: 0 })).toMatchObject({ visible: false, showText: false });
    expect(getBadgeState({ count: 5, text: 0, dot: true })).toMatchObject({
      visible: false, showText: false, showAsDot: false
    });
    expect(getBadgeState({ count: 5, text: 0, showZero: true, dot: true })).toMatchObject({
      visible: true, showText: true, showAsDot: false, display: '5'
    });
    expect(getBadgeState({ status: 'success', text: 0 })).toMatchObject({
      visible: true, statusStandalone: true, showText: false
    });
  });

  it('keeps true text present without rendering its boolean value', () => {
    expect(getBadgeState({ text: true })).toMatchObject({
      visible: true, showText: false, display: ''
    });
    expect(getBadgeState({ count: 0, color: 'blue', text: true })).toMatchObject({
      visible: true, statusStandalone: true, showText: false
    });
    for (const text of [false, null]) {
      expect(getBadgeState({ text })).toMatchObject({ visible: false, showText: false });
    }
  });
});

describe('Badge offsets', () => {
  it(
    'preserves signed fractional coordinates and replaces invalid coordinates independently',
    () => {
      const source = [12.5, -4] as const;

      expect(normalizeBadgeOffset(source)).toEqual(source);
      expect(normalizeBadgeOffset(source)).not.toBe(source);
      expect(normalizeBadgeOffset([Infinity, 6])).toEqual([0, 6]);
      expect(normalizeBadgeOffset([3, NaN])).toEqual([3, 0]);
      expect(normalizeBadgeOffset(undefined)).toBeUndefined();
    }
  );

  it('parses horizontal prefixes while retaining CSS vertical units', () => {
    expect(normalizeBadgeOffset(['10.5px', '2em'])).toEqual([10.5, '2em']);
    expect(normalizeBadgeOffset([' -2.5rem ', '25%'])).toEqual([-2.5, '25%']);
    expect(normalizeBadgeOffset(['1e2', 'calc(2px + 1em)'])).toEqual([100, 'calc(2px + 1em)']);
  });

  it('leaves invalid string coordinates for CSS instead of applying numeric normalization', () => {
    expect(normalizeBadgeOffset(['var(--x)', 'invalid'])).toEqual([NaN, 'invalid']);
    expect(normalizeBadgeOffset(['Infinity', '20'])).toEqual([Infinity, '20']);
    expect(normalizeBadgeOffset(['', ''])).toEqual([NaN, '']);
    expect(normalizeBadgeOffset([Infinity, '3px'])).toEqual([0, '3px']);
    expect(normalizeBadgeOffset(['12', NaN])).toEqual([12, 0]);
  });
});
