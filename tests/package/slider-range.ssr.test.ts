import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Slider, type SliderRangeProps, type SliderProps } from 'antd-svelte';
import SliderRangeFixture from './SliderRangeFixture.svelte';

describe('Slider range public package', () => {
  it('preserves scalar Props defaults and infers the range value contract', () => {
    const single: SliderProps = { value: 0, onValueChange: value => value.toFixed() };
    const range: SliderProps<true> = { range: true, value: [20, 80],
      onValueChange: value => value.map(entry => entry.toFixed()) };

    expect(render(Slider<false>, { props: single }).body).toContain('value="0"');
    expect(render(Slider<true>, { props: range }).body).toContain('value="80"');
  });

  it('renders sorted numeric inputs and all segments without mutating defaults', () => {
    const defaults = [80, 20, 50];
    const props: SliderRangeProps = { range: true, defaultValue: defaults, name: 'interval' };
    const body = render(Slider<SliderRangeProps['range']>, { props }).body;

    expect(body.match(/type="range"/g)).toHaveLength(3);
    expect(body.match(/name="interval"/g)).toHaveLength(3);
    expect(body).toContain('left:20%;width:30%');
    expect(body).toContain('left:50%;width:30%');
    expect(defaults).toEqual([80, 20, 50]);
  });

  it('renders native per-handle disabled and semantic configuration in RTL', () => {
    const body = render(SliderRangeFixture).body;

    expect(body).toContain('provider-range');
    expect(body).toContain('semantic-root');
    expect(body).toContain('semantic-tracks');
    expect(body).toContain('semantic-handle');
    expect(body).toContain('provider-rail');
    expect(body).toContain('provider-track');
    expect(body).toContain('color:red;color:green');
    expect(body).toContain('right:20%;width:30%');
    expect(body).toMatch(/aria-label="Middle"/);
    expect(body.match(/\sdisabled(?:[\s=>])/g)).toHaveLength(1);
  });

  it.each([null, []])('keeps an explicit empty collection empty (%j)', value => {
    const props: SliderRangeProps = { range: true, value };
    const body = render(Slider<SliderRangeProps['range']>, { props }).body;

    expect(body).not.toContain('type="range"');
    expect(body).not.toContain('ant-slider-track-1');
  });

  it('creates two source default points at min and preserves mark-only alignment', () => {
    const props: SliderRangeProps = { range: true, min: 5, step: null,
      marks: { 5: 'Cold', 48: 'Warm', 100: 'Hot' } };
    const body = render(Slider<SliderRangeProps['range']>, { props }).body;

    expect(body.match(/value="5"/g)).toHaveLength(2);
    expect(body.replace(/<!--.*?-->/g, '')).toContain('>Warm</button>');
    expect(body).toContain('ant-slider-with-marks');
  });

  it('does not call callbacks, focus DOM or allocate timers during SSR', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    try {
      const props: SliderRangeProps = { range: { editable: true }, autoFocus: true,
        onBeforeChange: callback, onChange: callback, onChangeComplete: callback,
        tooltip: { open: true } };
      const body = render(Slider<SliderRangeProps['range']>, { props }).body;

      expect(body).toContain('ant-slider-handle-1');
      expect(callback).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps unspecified per-handle tab stops out of the source tab sequence', () => {
    const props: SliderRangeProps = { range: true, value: [20, 80], tabIndex: [0] };
    const body = render(Slider<SliderRangeProps['range']>, { props }).body;

    const stops = [...body.matchAll(/<input\b[^>]*\btabindex="([^"]*)"/g)]
      .map(match => match[1]);
    expect(stops).toEqual(['0', '-1']);
  });
});
