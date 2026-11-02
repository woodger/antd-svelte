import { describe, expect, it } from 'vitest';
import {
  getTabsMoreNavigationKey,
  getTabsVisibleRange,
  isTabsMobileDevice
} from './tabs-overflow.engine';

describe('Tabs visible range', () => {
  const offsets = Object.freeze([
    { key: '', start: 0, size: 50 },
    { key: 'locked', start: 60, size: 40 },
    { key: 'last', start: 110, size: 70 }
  ]);

  it('keeps the complete range, including disabled headers, while they fit', () => {
    expect(getTabsVisibleRange(offsets, 180, 0)).toEqual([0, 3]);
    expect(getTabsVisibleRange(offsets, 100, 0)).toEqual([0, 1]);
  });

  it('excludes partially hidden leading and trailing tabs after scrolling', () => {
    expect(getTabsVisibleRange(offsets, 100, 25)).toEqual([1, 1]);
    expect(getTabsVisibleRange(offsets, 100, 80)).toEqual([2, 3]);
    expect(getTabsVisibleRange(offsets, 60, 25)).toEqual([0, -1]);
  });

  it('uses the source floor tolerance only on the trailing edge', () => {
    expect(getTabsVisibleRange([{ key: 'fraction', start: 0, size: 100.9 }], 100.1, 0))
      .toEqual([0, 1]);
    expect(getTabsVisibleRange([{ key: 'fraction', start: 0, size: 101.1 }], 100.1, 0))
      .toEqual([0, -1]);
    expect(getTabsVisibleRange([{ key: 'fraction', start: 0, size: 100 }], 101, 0.1))
      .toEqual([1, 1]);
  });

  it('returns the source empty range for an empty catalog', () => {
    expect(getTabsVisibleRange([], 0, 0)).toEqual([0, 0]);
  });
});

describe('Tabs More navigation', () => {
  const items = Object.freeze([
    { key: '' },
    { key: 'locked', disabled: true },
    { key: 'middle' },
    { key: 'last' }
  ]);

  it('starts with the first enabled item on Down and the source penultimate item on Up', () => {
    expect(getTabsMoreNavigationKey(items, null, 1)).toBe('');
    expect(getTabsMoreNavigationKey(items, null, -1)).toBe('middle');
    expect(getTabsMoreNavigationKey(items, 'removed', -1)).toBe('middle');
  });

  it('wraps, preserves empty keys and skips disabled items', () => {
    expect(getTabsMoreNavigationKey(items, '', 1)).toBe('middle');
    expect(getTabsMoreNavigationKey(items, '', -1)).toBe('last');
    expect(getTabsMoreNavigationKey(items, 'last', 1)).toBe('');
  });

  it('returns no active descendant for an empty or disabled menu', () => {
    expect(getTabsMoreNavigationKey([], null, 1)).toBeNull();
    expect(getTabsMoreNavigationKey([{ key: '', disabled: true }], '', -1)).toBeNull();
  });
});

describe('Tabs is-mobile 5.0.0 default detection', () => {
  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit Safari', true],
    ['Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit Chrome Mobile Safari', true],
    ['Mozilla/5.0 (BB10; Touch) AppleWebKit Mobile Safari', true],
    ['Mozilla/5.0 (X11; CrOS armv7l) Android Mobile Safari', false],
    ['Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit Mobile Safari', false],
    ['Mozilla/5.0 (Linux; Android 15; Tablet) AppleWebKit Chrome Safari', false],
    ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit Chrome Safari', false],
    ['', false]
  ])('detects %s as mobile=%s independently of viewport width', (agent, expected) => {
    expect(isTabsMobileDevice(agent)).toBe(expected);
  });
});
