import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-progress-circle-reference.json';
import { progressCircleLayout, progressGapPosition } from './progress-circle.engine';
import { getProgressCircleGeometry, resolveProgressCircleSize } from './progress.engine';
import type { ProgressProps } from './progress.types';

describe('Ant Design 6.6.8 UMD circular Progress conformance', () => {
  it('pins source rendering to the official archive in standards mode', () => {
    expect(reference.reference).toMatchObject({
      documentMode: 'CSS1Compat', version: '6.6.8',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa'
    });
  });

  for (const sample of reference.cases.filter(item => !item.semantic)) {
    it(`reproduces captured circular geometry for ${sample.name}`, () => {
      const props = sample.props as Extract<ProgressProps, { type: 'circle' | 'dashboard' }>;
      const percent = props.percent ?? 0;
      const diameter = resolveProgressCircleSize(props.size ?? props.width);
      const native = getProgressCircleGeometry(percent, diameter, props.strokeWidth);
      const color = Array.isArray(props.strokeColor) ? props.strokeColor[0] : props.strokeColor;
      const result = progressCircleLayout({
        percent, success: props.success, strokeWidth: native.strokeWidth,
        color, railColor: props.railColor ?? props.trailColor,
        cap: props.strokeLinecap ?? 'round', steps: props.steps,
        gap: props.gapDegree ?? (props.type === 'dashboard' ? 75 : 0),
        position: progressGapPosition(props.type, sample.rtl ? 'rtl' : 'ltr',
          props.gapPlacement, props.gapPosition)
      });
      const paths = result.rail ? [result.rail, ...result.paths] : result.paths;

      expect(paths).toHaveLength(sample.snapshot.paths.length);
      for (const [index, path] of paths.entries()) {
        const expected = sample.snapshot.paths[index];
        expect(result.radius).toBe(Number(expected.radius));
        // CSSOM округляет исходные числа; browser conformance сравнивает его строки точно.
        expect(path.dashOffset).toBeCloseTo(Number.parseFloat(expected.style['stroke-dashoffset']), 3);
      }
    });
  }

  it.each([-1, 1.5, Number.POSITIVE_INFINITY, 2 ** 32])(
    'rejects invalid circular step count %s like the source array constructor',
    steps => {
      expect(() => progressCircleLayout({ percent: 40, strokeWidth: 6,
        cap: 'round', gap: 0, steps })).toThrow(RangeError);
    }
  );
});
