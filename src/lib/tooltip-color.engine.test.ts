import { describe, expect, it } from 'vitest';
import { getTooltipColor } from './tooltip-color.engine';
import reference from '../../tests/browser/fixtures/ant-design-overlay-color-reference.json';

describe('Tooltip color classes and contrast from Ant Design 6.6.8', () => {
  for (const sample of reference.cases.filter(sample => sample.component === 'tooltip')) {
    it(`preserves the captured source color classification and luminance for ${sample.name}`, () => {
      for (const [step, snapshot] of sample.snapshots.entries()) {
        const values = Object.assign({}, sample, ...('frames' in sample
          ? sample.frames!.slice(0, step) : []));
        const color = getTooltipColor(values.local?.color, 'ant-tooltip');
        const foreground = color.overlayStyle.find(([name]) => name === '--ant-tooltip-overlay-color');

        expect(color.className ?? null).toBe(snapshot![0].colorClass);
        expect(foreground?.[1] ?? '').toBe(snapshot![0].foregroundVariable);
      }
    });
  }
});
