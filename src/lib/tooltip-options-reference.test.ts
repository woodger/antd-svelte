import { describe, expect, it } from 'vitest';
import { getTooltipPlacementConfig, getTooltipPosition } from './tooltip.engine';
import type { PopupFlipCache } from './popup-position.engine';
import type { AdjustOverflow, TooltipArrow, TooltipPlacement } from './tooltip.types';
import reference from '../../tests/browser/fixtures/ant-design-overlay-options-reference.json';

interface Values {
  placement: TooltipPlacement;
  arrow?: TooltipArrow;
  adjust?: boolean | AdjustOverflow;
}

describe('Tooltip arrow and overflow against official UMD', () => {
  it('pins the local options oracle to the studied source archive', () => {
    expect(reference.reference).toMatchObject({
      version: '6.6.8',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa',
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases.filter(sample => sample.geometry)) {
    it(`preserves source coordinates and flip history for ${sample.name}`, () => {
      let flips: PopupFlipCache | undefined;

      for (const [index, snapshot] of sample.snapshots.entries()) {
        if (!snapshot) {
          flips = undefined;
          continue;
        }
        const values = Object.assign({}, sample, ...(sample.frames?.slice(0, index) ?? [])) as Values;
        const previous = flips && Object.freeze({ ...flips });
        const result = getTooltipPosition(
          snapshot.anchor,
          snapshot.popup,
          reference.viewport,
          values.placement,
          values.adjust ?? true,
          undefined,
          sample.gap,
          { flips: previous, source: getTooltipPlacementConfig(values.arrow ?? true, sample.tokens) }
        );

        expect(result.placement).toBe(snapshot.placement);
        expect(result.left).toBeCloseTo(snapshot.popup.x, 2);
        expect(result.top).toBeCloseTo(snapshot.popup.y, 2);
        expect(result.arrowX).toBeCloseTo(snapshot.arrowX, 2);
        expect(result.arrowY).toBeCloseTo(snapshot.arrowY, 2);
        flips = result.flips;
      }
    });
  }
});
