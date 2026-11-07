import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-progress-line-reference.json';
import { progressGradient, progressLineSteps, progressSuccessPercent }
  from './progress-line.engine';
import type { ProgressGradient, ProgressLineSize } from './progress.types';

describe('Ant Design 6.6.8 UMD Progress line conformance', () => {
  it('uses the pinned archive and source revision', () => {
    expect(reference.reference).toMatchObject({
      documentMode: 'CSS1Compat',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa'
    });
  });

  for (const sample of reference.cases) {
    const color = sample.props.strokeColor;
    if (!sample.props.steps && color && typeof color === 'object' && !Array.isArray(color)) {
      it(`reproduces the declared gradient for ${sample.name}`, () => {
        expect(progressGradient(color as ProgressGradient, Boolean(sample.rtl)))
          .toBe(sample.snapshot.tracks[0].style['--progress-line-stroke-color']);
      });
    }
    const steps = sample.props.steps;
    if (steps && !sample.semantic) {
      it(`reproduces source step rounding for ${sample.name}`, () => {
        const count = typeof steps === 'number' ? steps : steps.count;
        const rounding = sample.rounding === 'floor' ? Math.floor
          : sample.rounding === 'ceil' ? Math.ceil : undefined;
        const layout = progressLineSteps(count, sample.props.percent ?? 0,
          sample.props.size as ProgressLineSize, rounding);

        const prefix = sample.props.prefixCls || 'ant-progress';
        expect(layout.items).toEqual(sample.snapshot.tracks.map(track =>
          track.classes.includes(`${prefix}-steps-item-active`)));
      });
    }
  }

  it.each([[-20, 0], [0, 0], [30.5, 30.5], [120, 100]])(
    'bounds success percent %s like the source segment',
    (percent, expected) => {
      expect(progressSuccessPercent({ percent })).toBe(expected);
    }
  );
});
