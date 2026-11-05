import { describe, expect, it } from 'vitest';
import { getTooltipPosition } from './tooltip.engine';
import registry from '../../docs/reference/ant-design-porting/registry.json';
import reference from '../../tests/browser/fixtures/ant-design-tooltip-align-reference.json';
import type { TooltipAlignmentCase } from '../../tests/browser/fixtures/tooltip-align.types';

describe('Tooltip source align and placements', () => {
  it('pins geometry and callback payloads to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js',
      documentMode: 'CSS1Compat',
      delegated: { tooltip: '1.5.2', trigger: '3.10.1' }
    });
  });

  for (const sample of reference.cases as readonly TooltipAlignmentCase[]) {
    it(`matches measured UMD geometry and final align metadata for ${sample.name}`, () => {
      const expected = sample.initial;
      const result = getTooltipPosition(expected.anchor, expected.popup,
        { x: 0, y: 0, width: 1024, height: 800 }, sample.options.placement ?? 'top',
        true, undefined, 12, {
          source: { arrowWidth: 16, offset: 4, radius: 6 },
          align: sample.options.align,
          builtinPlacements: sample.options.builtinPlacements,
          scrollRegion: { x: 0, y: 0, width: 1024, height: 1600 }
        });

      // Semantic root left is applied after geometry by both renderers.
      if (sample.rootStyle?.left === undefined) expect(result.left).toBe(expected.popup.x);
      expect(result.top).toBe(expected.popup.y);
      expect(result.arrowX).toBe(expected.arrowX);
      expect(result.arrowY).toBe(expected.arrowY);
      expect(result.alignedPlacement ?? null).toBe(expected.placement);
      expect(result.sourceAlign).toEqual(expected.callback.align);
    });
  }
});
