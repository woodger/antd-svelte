import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { getBadgeState } from './badge.engine';
import type { BadgeCountContext } from './badge.types';

describe('Badge count values', () => {
  it.each([
    ['new', 'new'], ['5', '5'], ['100', '99+'], ['001', '001'],
    ['0x10', '0x10'], ['1e2', '99+'], ['-4', '-4'], ['2.5', '2.5'],
    ['Infinity', '99+'], ['-Infinity', '-Infinity'], ['NaN', 'NaN']
  ])('renders %s while retaining its full title and description', (count, display) => {
    const state = getBadgeState({ count });

    expect(state).toMatchObject({
      count: undefined,
      titleCount: count,
      descriptionCount: count,
      display,
      visible: true,
      customCount: false
    });
  });

  it('distinguishes a literal zero from numeric strings with other spellings', () => {
    expect(getBadgeState({ count: '0' }).visible).toBe(false);
    expect(getBadgeState({ count: '0', dot: true }).visible).toBe(false);
    expect(getBadgeState({ count: '0', dot: true, showZero: true })).toMatchObject({
      visible: true, display: '0', showAsDot: false
    });
    for (const count of ['00', ' 0 ', '0.0', '0x0']) {
      expect(getBadgeState({ count })).toMatchObject({ visible: true, display: count });
      expect(getBadgeState({ count, dot: true })).toMatchObject({
        visible: true, display: '', showAsDot: true
      });
    }
  });

  it('does not turn empty strings or false into an absent status count', () => {
    for (const count of ['', false] as const) {
      expect(getBadgeState({ count, status: 'success' })).toMatchObject({
        visible: false, hasStatus: false, statusStandalone: false
      });
      expect(getBadgeState({ count, text: 'Label' })).toMatchObject({
        visible: true, display: '', showText: true
      });
    }
    expect(getBadgeState({ count: null, status: 'success' })).toMatchObject({
      visible: true, hasStatus: true, statusStandalone: true
    });
  });

  it('keeps the source boolean true display and numeric coercion', () => {
    expect(getBadgeState({ count: true })).toMatchObject({
      visible: true, display: 'true', titleCount: undefined, descriptionCount: 'true'
    });
    expect(getBadgeState({ count: true, overflowCount: 0 }).display).toBe('0+');
  });

  it('keeps a custom count even in dot mode and applies the shared text-zero rule', () => {
    const count = createRawSnippet<[BadgeCountContext]>(() => ({ render: () => '<span></span>' }));

    expect(getBadgeState({ count, dot: true, status: 'error' })).toMatchObject({
      visible: true, display: '', customCount: true, showAsDot: true,
      hasStatus: false, statusStandalone: false, count: undefined
    });
    expect(getBadgeState({ count, text: '0' }).visible).toBe(false);
    expect(getBadgeState({ count, text: '0', showZero: true }).visible).toBe(true);
  });
});
