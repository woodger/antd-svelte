import { describe, expect, it } from 'vitest';
import { getTabsMoreActions, getTabsMorePlacements } from './tabs-more.engine';

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

describe('Tabs More placement precedence', () => {
  it('keeps the rc-dropdown defaults when placements is absent or undefined', () => {
    const defaults = getTabsMorePlacements(undefined);

    expect(Object.keys(defaults))
      .toEqual(['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight']);
    expect(defaults.bottomLeft).toEqual({
      points: ['tl', 'bl'], offset: [0, 4], targetOffset: [0, 0],
      overflow: { adjustX: 1, adjustY: 1 }
    });
    expect(getTabsMorePlacements({ placements: undefined })).toBe(defaults);
  });

  it('replaces the table without merging missing placements', () => {
    const placements = { bottomLeft: { points: ['cc', 'tc'] } };

    expect(getTabsMorePlacements({ placements })).toBe(placements);
    expect(getTabsMorePlacements({ placements: {} })).toEqual({});
  });

  it('lets own builtinPlacements override placements including explicit undefined', () => {
    const placements = { bottomLeft: { offset: [0, 7] } };
    const builtinPlacements = { bottomLeft: { offset: [0, 15] } };

    expect(getTabsMorePlacements({ placements, builtinPlacements })).toBe(builtinPlacements);
    expect(getTabsMorePlacements({ placements, builtinPlacements: undefined })).toEqual({});
  });
});
