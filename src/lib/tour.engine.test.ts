import { describe, expect, it } from 'vitest';
import {
  getTourClosable,
  getTourCloseAttributes,
  getTourHighlight,
  getTourSemantics
} from './tour.engine';
import { getTourAlignment, getTourPlacements } from './tour-position.engine';
import type { TourPlacement } from './tour.types';

describe('Tour highlight and closable', () => {
  it('expands the target on each axis and retains the source radius rules', () => {
    const rect = { left: 100, top: 200, width: 80, height: 40 };

    expect(getTourHighlight(rect))
      .toEqual({ left: 94, top: 194, width: 92, height: 52, radius: 2 });
    expect(getTourHighlight(rect, { offset: [2, 10], radius: 0 }))
      .toEqual({ left: 98, top: 190, width: 84, height: 60, radius: 0 });
    expect(getTourHighlight(rect, { offset: -2, radius: NaN }))
      .toEqual({ left: 102, top: 202, width: 76, height: 36, radius: 2 });
  });

  it('keeps direct false overrides and permits a step to restore default closing', () => {
    expect(getTourClosable(undefined, undefined, undefined, undefined))
      .toEqual({ closeIcon: undefined });
    expect(getTourClosable(undefined, undefined, false, undefined)).toBeNull();
    expect(getTourClosable(undefined, undefined, undefined, false)).toBeNull();
    expect(getTourClosable(true, undefined, undefined, false)).toEqual({ closeIcon: undefined });
    expect(getTourClosable(undefined, false, true, 'Root icon')).toBeNull();
    expect(getTourClosable(undefined, null, undefined, 'Root icon'))
      .toEqual({ closeIcon: 'Root icon' });
  });

  it('retains the distinction between direct closeIcon false and a config icon false', () => {
    expect(getTourClosable({ closeIcon: false }, undefined, false, false))
      .toEqual({ closeIcon: false });
    expect(getTourClosable(undefined, undefined, { closeIcon: false }, false)).toBeNull();
    expect(getTourCloseAttributes({
      closeIcon: 'X',
      'aria-label': 'Dismiss',
      'data-action': 'exit',
      role: 'button'
    })).toEqual({ 'aria-label': 'Dismiss', 'data-action': 'exit', role: 'button' });
  });
});

describe('Tour semantic styles', () => {
  it('applies root style priority to mask while retaining independent panel slots', () => {
    const result = getTourSemantics({
      style: 'color:pink',
      classNames: { root: 'context-root', title: 'context-title' },
      styles: { root: 'color:red', mask: 'color:orange', title: 'font-size:18px' }
    }, {
      style: 'color:green',
      classNames: { title: 'local-title' },
      styles: { root: 'color:blue', mask: 'color:yellow', title: 'font-size:20px' }
    });

    expect(result.classes.title).toBe('context-title local-title');
    expect(result.styles.mask)
      .toBe('color:red;color:orange;color:pink;color:blue;color:yellow;color:green');
    expect(result.styles.title).toBe('font-size:18px;font-size:20px');
    expect(result.styles.root).toBe('color:red;color:blue');
  });
});

const input = {
  target: { left: 400, top: 300, width: 100, height: 40 },
  popup: { left: 0, top: 0, width: 200, height: 100 },
  mirror: { right: 1280, bottom: 900 },
  visible: { left: 0, top: 0, right: 1280, bottom: 900 },
  scaleX: 1,
  scaleY: 1,
  pointAtCenter: false
};

describe('Tour source placements', () => {
  it.each<[TourPlacement, number, number]>([
    ['center', 350, 270], ['top', 350, 188], ['bottom', 350, 352],
    ['left', 188, 270], ['right', 512, 270], ['topLeft', 400, 188],
    ['topRight', 300, 188], ['bottomLeft', 400, 352], ['bottomRight', 300, 352],
    ['leftTop', 188, 300], ['leftBottom', 188, 240],
    ['rightTop', 512, 300], ['rightBottom', 512, 240]
  ])('positions %s with the source half-arrow plus margin offset', (placement, x, y) => {
    const result = getTourAlignment({ ...input, placement });

    expect([result.x, result.y]).toEqual([x, y]);
    expect(result.placement).toBe(placement === 'center' ? undefined : placement);
  });

  it.each<[TourPlacement, number, number]>([
    ['topLeft', 430, 188], ['topRight', 270, 188],
    ['bottomLeft', 430, 352], ['bottomRight', 270, 352],
    ['leftTop', 188, 304], ['leftBottom', 188, 236],
    ['rightTop', 512, 304], ['rightBottom', 512, 236]
  ])('points corner arrow %s at the target center', (placement, x, y) => {
    const result = getTourAlignment({ ...input, placement, pointAtCenter: true });

    expect([result.x, result.y]).toEqual([x, y]);
    expect(result.align.autoArrow).toBe(false);
  });

  it('retains a useful flip after the target moves back into available space', () => {
    const first = getTourAlignment({
      ...input,
      placement: 'bottom',
      target: { left: 400, top: 850, width: 100, height: 20 }
    });
    const second = getTourAlignment({ ...input, placement: 'bottom', flips: first.flips });

    expect([first.x, first.y, first.placement]).toEqual([350, 738, 'top']);
    expect([second.x, second.y, second.placement]).toEqual([350, 188, 'top']);
    expect(first.flips).toEqual({ bt: true });
  });

  it('flips corner alignment on both axes using the original visible area comparison', () => {
    const result = getTourAlignment({
      ...input,
      placement: 'rightTop',
      target: { left: 1200, top: 850, width: 40, height: 20 }
    });

    expect([result.x, result.y, result.placement]).toEqual([988, 770, 'leftBottom']);
    expect(result.align.points).toEqual(['br', 'bl']);
  });

  it('shifts centered placements without flipping them and keeps the overlap arrow center', () => {
    const result = getTourAlignment({
      ...input,
      placement: 'top',
      target: { left: 0, top: 300, width: 40, height: 40 }
    });

    expect([result.x, result.y, result.arrowX, result.placement]).toEqual([0, 188, 20, 'top']);
    expect(getTourPlacements(false).top.overflow)
      .toEqual({ shiftX: 40, shiftY: true, adjustY: true });
  });

  it('keeps fractional scaled offsets and rounds only an unscaled axis', () => {
    const result = getTourAlignment({
      ...input,
      placement: 'bottom',
      target: { left: 400.5, top: 300.5, width: 100, height: 40 },
      popup: { left: 20.5, top: 30.5, width: 200, height: 100 },
      scaleX: 2,
      scaleY: 2
    });

    expect([result.x, result.y]).toEqual([165, 161]);
    expect(result.align.offset).toEqual([0, 12]);
  });
});
