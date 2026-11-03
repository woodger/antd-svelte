import { describe, expect, it } from 'vitest';
import {
  getPopupAlignment,
  getPopupArrowStyle,
  getPopupPosition,
  type PopupPlacement,
  type PopupRect,
  type PopupSourceAlign
} from './popup-position.engine';

function align(placement: PopupPlacement, autoAdjustOverflow = true, pointAtCenter = false) {
  return getPopupAlignment({
    target: { left: 40, top: 40, width: 100, height: 32 },
    popup: { left: 0, top: 0, width: 258, height: 292 },
    mirror: { right: 1200, bottom: 1000 },
    visible: { left: 0, top: 0, right: 1200, bottom: 1000 },
    scaleX: 1, scaleY: 1, placement, pointAtCenter, autoAdjustOverflow
  });
}

describe('getPopupAlignment', () => {
  it('flips a corner and shifts a centered popup at the source viewport edge', () => {
    const corner = align('bottomRight');
    const centered = align('top');

    expect(corner.placement).toBe('bottomLeft');
    expect(corner.x).toBe(40);
    expect(centered.placement).toBe('bottom');
    expect(centered.x).toBe(0);
    expect(centered.y).toBe(84);
  });

  it('preserves unclamped positions when source overflow adjustment is disabled', () => {
    const result = align('bottomRight', false);

    expect(result.placement).toBe('bottomRight');
    expect(result.x).toBe(-118);
    expect(result.y).toBe(84);
    expect(result.flips).toEqual({});
  });

  it('uses the source center-arrow offset and keeps corner arrow styling in CSS', () => {
    const result = align('bottomLeft', true, true);

    expect(result.x).toBe(70);
    expect(result.y).toBe(84);
    expect(getPopupArrowStyle(result)).toBe('');
    expect(getPopupArrowStyle(align('bottom'))).toContain('top:0');
  });
});

function position(align: PopupSourceAlign, target: PopupRect = {
  left: 100, top: 100, width: 80, height: 40
}) {
  return getPopupPosition({
    target,
    popup: { left: 0, top: 0, width: 200, height: 100 },
    mirror: { right: 1000, bottom: 1000 },
    visible: { left: 0, top: 0, right: 1000, bottom: 250 },
    scroll: { left: 0, top: 0, right: 1000, bottom: 500 },
    scaleX: 1,
    scaleY: 1,
    placements: { below: { points: ['tl', 'bl'] }, above: { points: ['bl', 'tl'] } },
    align: { points: ['tl', 'bl'], offset: [0, 4], ...align }
  });
}

describe('rc-trigger raw popup alignment', () => {
  it('uses the first two point characters in the source callback and placement lookup', () => {
    const result = position({ points: ['tl-extra', 'bl-extra'] });

    expect([result.x, result.y]).toEqual([100, 144]);
    expect(result.align.points).toEqual(['tl', 'bl']);
    expect(result.placement).toBe('below');
  });

  it('resolves percentages against the popup and target independently', () => {
    const result = position({ offset: ['25%', '-10%'], targetOffset: ['50%', '25%'] });

    expect([result.x, result.y]).toEqual([110, 120]);
    expect(result.align.offset).toEqual(['25%', '-10%']);
    expect(result.align.targetOffset).toEqual(['50%', '25%']);
  });

  it('reads DOMRect-compatible geometry from prototype accessors', () => {
    const target = Object.create({ left: 100, top: 100, width: 80, height: 40 }) as PopupRect;
    const result = position({}, target);

    expect([result.x, result.y]).toEqual([100, 144]);
  });

  it('treats zero adjust as enabled and a negative adjust as disabled', () => {
    const target = { left: 100, top: 180, width: 80, height: 40 };
    const enabled = position({ overflow: { adjustY: 0 } }, target);
    const disabled = position({ overflow: { adjustY: -1 } }, target);

    expect([enabled.y, enabled.placement]).toEqual([76, 'above']);
    expect([disabled.y, disabled.placement]).toEqual([224, 'below']);
  });

  it('uses visible area to break a scroll-area tie for visibleFirst', () => {
    const target = { left: 100, top: 180, width: 80, height: 40 };
    const align = { overflow: { adjustY: true } };
    const scroll = position({ ...align, htmlRegion: 'scroll' }, target);
    const first = position({ ...align, htmlRegion: 'visibleFirst' }, target);

    expect([scroll.y, scroll.placement]).toEqual([224, 'below']);
    expect([first.y, first.placement]).toEqual([76, 'above']);
  });

  it('shifts without inventing a flip or clamping the arrow to a tooltip inset', () => {
    const result = position({ overflow: { shiftX: true } }, {
      left: 940, top: 100, width: 80, height: 40
    });

    expect([result.x, result.y]).toEqual([800, 144]);
    expect(result.placement).toBe('below');
    expect(result.arrowX).toBe(170);
  });

  it('keeps missing points centered and selects placement by the source point in point mode', () => {
    const centered = position({ points: [] });
    const point = getPopupPosition({
      target: { left: 100, top: 100, width: 0, height: 0 },
      popup: { left: 0, top: 0, width: 200, height: 100 },
      mirror: { right: 1000, bottom: 1000 },
      visible: { left: 0, top: 0, right: 1000, bottom: 1000 },
      scaleX: 1,
      scaleY: 1,
      alignPoint: true,
      placements: { first: { points: ['tl', 'bl'] }, second: { points: ['tl', 'tc'] } },
      align: { points: ['tl', 'tc'] }
    });

    expect([centered.x, centered.y]).toEqual([40, 74]);
    expect(centered.placement).toBeUndefined();
    expect(point.placement).toBe('first');
  });
});
