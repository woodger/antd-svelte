import { describe, expect, it } from 'vitest';
import {
  getTabsIndicatorStyle,
  isTabsIndicatorStyleEqual,
  type TabsIndicatorOffset
} from './tabs-indicator.engine';

const offset: TabsIndicatorOffset = { width: 100.5, height: 40.25, left: 12.5, right: 30, top: 7.5 };

describe('getTabsIndicatorStyle', () => {
  it.each([
    ['start', false, { width: 12.5, left: 12.5 }],
    ['center', false, { width: 12.5, left: 62.75, transform: 'translateX(-50%)' }],
    ['end', false, { width: 12.5, left: 113, transform: 'translateX(-100%)' }],
    ['start', true, { width: 12.5, right: 30 }],
    ['center', true, { width: 12.5, right: 80.25, transform: 'translateX(50%)' }],
    ['end', true, { width: 12.5, right: 130.5, transform: 'translateX(-100%)' }]
  ] as const)('keeps source horizontal %s alignment with rtl=%s', (align, rtl, expected) => {
    expect(getTabsIndicatorStyle(offset, false, rtl, { size: 12.5, align })).toEqual(expected);
  });

  it.each([
    ['start', { height: 20.25, top: 7.5 }],
    ['center', { height: 20.25, top: 27.625, transform: 'translateY(-50%)' }],
    ['end', { height: 20.25, top: 47.75, transform: 'translateY(-100%)' }]
  ] as const)('passes the complete vertical origin to a size function aligned at %s',
    (align, expected) => {
      expect(getTabsIndicatorStyle(offset, true, true, { size: origin => origin - 20, align }))
        .toEqual(expected);
    });

  it('defaults to the complete origin and preserves zero and negative custom sizes', () => {
    expect(getTabsIndicatorStyle(offset, false, false))
      .toEqual({ width: 100.5, left: 62.75, transform: 'translateX(-50%)' });
    expect(getTabsIndicatorStyle(offset, false, false, { size: 0 }).width).toBe(0);
    expect(getTabsIndicatorStyle(offset, true, false, { size: -3 }).height).toBe(-3);
  });

  it('does not evaluate custom size until there is a measured active header', () => {
    expect(getTabsIndicatorStyle(undefined, false, false, {
      size: () => { throw new Error('Unmeasured size'); }
    })).toEqual({});
  });
});

describe('isTabsIndicatorStyleEqual', () => {
  it('suppresses subpixel jitter within the same rounded coordinate and size', () => {
    expect(isTabsIndicatorStyleEqual({ width: 10.1, left: 20.2 }, { width: 10.4, left: 20.49 }))
      .toBe(true);
    expect(isTabsIndicatorStyleEqual({ width: 10.4 }, { width: 10.5 })).toBe(false);
  });

  it('keeps physical edges and transforms distinct and initializes empty styles only once', () => {
    expect(isTabsIndicatorStyleEqual({ left: 10 }, { right: 10 })).toBe(false);
    expect(isTabsIndicatorStyleEqual({ transform: 'translateX(50%)' }, {
      transform: 'translateX(-50%)'
    })).toBe(false);
    expect(isTabsIndicatorStyleEqual(undefined, {})).toBe(false);
    expect(isTabsIndicatorStyleEqual({}, {})).toBe(true);
  });
});
