import { describe, expect, it } from 'vitest';
import reference from '../../tools/fixtures/ant-design-spin-percent-reference.json';
import { advanceSpinPercent, spinProgress } from './spin-percent.engine';

describe('Ant Design 6.6.8 Spin auto percentage', () => {
  it('reproduces the official UMD clock trace across all three buckets and the plateau', () => {
    expect(reference.reference.revision).toBe('984592267de88fbf9cdaecc96a56629e721c709d');
    let value = 0;
    let tick = 0;

    for (const sample of reference.auto) {
      while ((tick + 1) * 200 <= sample.time) {
        value = advanceSpinPercent(value);
        tick++;
      }
      expect(value, `at ${sample.time}ms`).toBe(sample.value);
    }
  });

  it.each([[30, 33.5], [31, 33.07], [70, 70.9], [71, 71.29], [96, 96.04], [96.01, 96.01]])(
    'uses inclusive source bucket boundaries for %s',
    (input, expected) => {
      expect(advanceSpinPercent(input)).toBe(expected);
    }
  );

  it.each([[-50, 0], [0, 0], [25, 25], [33.333, 33.333], [100, 100], [150, 100]])(
    'clamps circle value %s without rounding fractional progress',
    (input, expected) => {
      expect(spinProgress(input).value).toBe(expected);
    }
  );
});
