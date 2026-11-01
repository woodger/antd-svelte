import { describe, expect, it } from 'vitest';
import { getPopupAlignment, getPopupArrowStyle, type PopupPlacement } from './popup-position.engine';

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
