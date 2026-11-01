import { describe, expect, it } from 'vitest';
import {
  createSliderRangeOffset,
  sliderClosestHandle,
  sliderDisabledBoundaries,
  sliderDisabledState,
  sliderRangeCache,
  sliderRangeKey,
  sliderRangeMarks,
  sliderRangeSettings,
  sliderRangeValues,
  type SliderRangeOptions
} from './slider-range.engine';

const base: SliderRangeOptions = {
  min: 0, max: 100, step: 10, marks: [], allowCross: true, pushable: false, disabled: false
};

describe('Slider source range engine', () => {
  it('creates only the source default handles and preserves explicit empty and null collections', () => {
    expect(sliderRangeValues(undefined, base)).toEqual([0, 0]);
    expect(sliderRangeValues(null, base)).toEqual([]);
    expect(sliderRangeValues([], base)).toEqual([]);
    expect(sliderRangeValues([], base, 0)).toEqual([]);
    expect(sliderRangeValues(undefined, base, 0)).toEqual([0]);
    expect(sliderRangeValues([20], base, 2)).toEqual([20, 20, 20]);
  });

  it('sorts immutable owner values without changing the original order', () => {
    const value = Object.freeze([80, 19, 54]);

    expect(sliderRangeValues(value, base)).toEqual([20, 50, 80]);
    expect(value).toEqual([80, 19, 54]);
  });

  it('keeps numeric zero marks, custom metadata and the source label filter', () => {
    expect(sliderRangeMarks({ 20: { label: 'Warm', style: 'color:red' },
      0: 0, 80: false, 40: null, 60: 'Hot' }))
      .toEqual([{ value: 0, label: 0 }, { value: 20, label: 'Warm', style: 'color:red' },
        { value: 60, label: 'Hot' }]);
  });

  it('aligns mark-only values and resolves ties toward the final source endpoint', () => {
    const options = { ...base, step: null, marks: [0, 48, 100].map(value => ({ value })) };
    const engine = createSliderRangeOffset(options);

    expect(engine.format(40)).toBe(48);
    expect(engine.format(74)).toBe(100);
    expect(engine.offset([0, 48], 1, 1).values).toEqual([0, 100]);
    expect(engine.offset([0, 48], -1, 1).values).toEqual([0, 0]);
    expect(engine.offset([0, 48], 2, 0).value).toBe(100);
  });

  it('retains marks outside the regular step grid and exact decimal output', () => {
    const engine = createSliderRangeOffset({ ...base, marks: [{ value: 25 }] });
    const decimal = createSliderRangeOffset({ ...base, min: .1, max: .9, step: .1 });

    expect(engine.format(24)).toBe(25);
    expect(engine.offset([20, 80], 1, 0).value).toBe(25);
    expect(decimal.offset([.2, .8], 1, 0).value).toBe(.3);
  });

  it('keeps unsorted drag identities until the caller publishes sorted values', () => {
    expect(createSliderRangeOffset(base).offset([20, 40, 60], 60, 0, 'dist'))
      .toEqual({ value: 80, values: [80, 40, 60] });
  });

  it('prevents crossing and enforces the selected minimum gap', () => {
    expect(createSliderRangeOffset({ ...base, allowCross: false })
      .offset([20, 40, 60], 60, 0, 'dist').values).toEqual([40, 40, 60]);
    expect(createSliderRangeOffset({ ...base, allowCross: false, pushable: 10 })
      .offset([20, 40, 60], 60, 0, 'dist').values).toEqual([30, 40, 60]);
  });

  it('pushes both neighbors and reverts the group when the final endpoint cannot move', () => {
    const engine = createSliderRangeOffset({ ...base, pushable: 10 });

    expect(engine.offset([10, 30, 50], 30, 0, 'dist').values).toEqual([40, 50, 60]);
    expect(engine.offset([80, 90, 100], 20, 0, 'dist').values).toEqual([80, 90, 100]);
  });

  it('treats disabled handles as fixed anchors for pushing and nearest selection', () => {
    const options = { ...base, pushable: 10, disabled: [false, true, false] };

    expect(sliderDisabledBoundaries([20, 50, 80], 0, options)).toEqual([0, 40]);
    expect(createSliderRangeOffset(options).offset([20, 50, 80], 70, 0, 'dist').values)
      .toEqual([40, 50, 80]);
    expect(sliderClosestHandle([20, 50, 80], 45, options)).toBe(-1);
    expect(sliderClosestHandle([20, 50, 80], 60, options)).toBe(2);
  });

  it('prefers the later equally close enabled handle and ignores unused disabled flags', () => {
    expect(sliderClosestHandle([20, 80], 50, base)).toBe(1);
    expect(sliderDisabledState([false, false, true], [20, 80])).toEqual([false, false]);
    expect(sliderDisabledState([true, false], [20, 80])).toEqual([false, true]);
    expect(sliderDisabledState([true, true], [20, 80])).toEqual([true, true]);
    expect(sliderDisabledState([], [])).toEqual([false, false]);
  });

  it('keeps cache identities during crossing or one editable deletion but rejects an owner replacement', () => {
    expect(sliderRangeCache([40, 60, 80], [80, 40, 60], false)).toEqual([80, 40, 60]);
    expect(sliderRangeCache([40, 80], [40, 60, 80], true)).toEqual([40, 60, 80]);
    expect(sliderRangeCache([40, 80], [40, 60, 80], false)).toEqual([40, 80]);
    expect(sliderRangeCache([10, 80], [40, 60, 80], true)).toEqual([10, 80]);
  });

  it('prioritizes editing over track dragging and retains the source count defaults', () => {
    expect(sliderRangeSettings(true)).toEqual({
      editable: false, draggableTrack: false, minCount: 0
    });
    expect(sliderRangeSettings({ editable: true, draggableTrack: true, minCount: 2, maxCount: 5 }))
      .toEqual({ editable: true, draggableTrack: false, minCount: 2, maxCount: 5 });
  });

  it('maps physical keyboard directions, double-step pages and endpoints', () => {
    expect(sliderRangeKey('ArrowLeft', 'rtl')).toBe(1);
    expect(sliderRangeKey('ArrowUp', 'ttb')).toBe(-1);
    expect(sliderRangeKey('PageDown', 'ltr')).toBe(-2);
    expect(sliderRangeKey('Home', 'ltr')).toBe('min');
    expect(sliderRangeKey('End', 'btt')).toBe('max');
    expect(sliderRangeKey('Enter', 'ltr')).toBeUndefined();
  });
});
