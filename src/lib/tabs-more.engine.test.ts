import { describe, expect, it } from 'vitest';
import { getTabsMoreActions } from './tabs-more.engine';

describe('Tabs More source actions', () => {
  it('adds touch toggling to the default hover actions', () => {
    const { show, hide } = getTabsMoreActions({});

    expect([...show]).toEqual(['hover', 'touch']);
    expect([...hide]).toEqual(['hover', 'touch']);
  });

  it('defaults context menu dismissal to click independently from showAction', () => {
    const { show, hide } = getTabsMoreActions({ trigger: 'contextMenu', showAction: ['focus'] });

    expect([...show]).toEqual(['focus']);
    expect([...hide]).toEqual(['click']);
  });

  it('preserves empty overrides and avoids synthesizing touch when click handles the same side', () => {
    const explicit = getTabsMoreActions({
      trigger: ['hover', 'click'],
      showAction: [],
      hideAction: ['hover', 'click']
    });

    expect([...explicit.show]).toEqual([]);
    expect([...explicit.hide]).toEqual(['hover', 'click']);
    expect([...getTabsMoreActions({ trigger: 'contextMenu', hideAction: [] }).hide]).toEqual([]);
  });

  it('resolves hover touch independently for asymmetric show and hide actions', () => {
    const { show, hide } = getTabsMoreActions({ showAction: ['hover'], hideAction: ['click'] });

    expect([...show]).toEqual(['hover', 'touch']);
    expect([...hide]).toEqual(['click']);
  });
});
