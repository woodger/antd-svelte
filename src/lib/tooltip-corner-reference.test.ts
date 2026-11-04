import { describe, expect, it } from 'vitest';
import { getTooltipPosition } from './tooltip.engine';
import type { PopupFlipCache } from './popup-position.engine';
import reference from '../../tests/browser/fixtures/ant-design-overlay-corner-reference.json';
import type { TooltipPlacement } from './tooltip.types';

describe('Tooltip corner positioning against official UMD', () => {
  it('pins geometry to the studied Ant Design revision', () => {
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
      for (const snapshot of sample.snapshots) {
        if (!snapshot) {
          flips = undefined;
          continue;
        }
        const previous = flips && Object.freeze({ ...flips });
        const result = getTooltipPosition(
          snapshot.anchor,
          snapshot.popup,
          reference.viewport,
          sample.placement as TooltipPlacement,
          sample.adjust ?? true,
          undefined,
          sample.gap,
          { flips: previous }
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
