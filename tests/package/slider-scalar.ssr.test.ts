import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Slider, type SliderProps, type SliderRangeProps } from 'antd-svelte';
import SliderScalarCase from '../browser/fixtures/SliderScalarCase.svelte';
import SliderScalarTypes from './SliderScalarTypes.svelte';

describe('Slider scalar source API public package SSR', () => {
  it('keeps numeric and range callback and semantic inference distinct', () => {
    expectTypeOf<NonNullable<SliderProps['onChange']>>().parameter(0).toEqualTypeOf<number>();
    expectTypeOf<NonNullable<SliderProps<true>['onChange']>>().parameter(0)
      .toEqualTypeOf<number[]>();
    const single: SliderProps = { step: null, marks: { 0: 'Low' },
      classNames: ({ props }) => ({ root: props.value?.toFixed() }) };
    const range: SliderRangeProps = { range: true,
      classNames: ({ props }) => ({ root: props.value?.join(',') }) };

    expect(render(Slider<false>, { props: single }).body).toContain('Low');
    expect(render(Slider<SliderRangeProps['range']>, { props: range }).body).toContain('ant-slider');
    const typed = render(SliderScalarTypes).body;

    expect(typed).toContain('value-20');
    expect(typed).toContain('data-rich-mark');
    expect(typed).toContain('Rich scalar mark');
  });

  it('renders mark-aligned values, buttons and defaults without timers or callbacks', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(SliderScalarCase);

      expect(body).toContain('value="48"');
      expect(body).toContain('step="any"');
      expect(body).toContain('ant-slider-dot-active');
      expect(body).toMatch(/<button[^>]*class="[^"]*ant-slider-mark-text/);
      expect(body).toContain('Scalar changes">[]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps semantic styles and public ARIA props off native attribute spreads', () => {
    const aria = render(SliderScalarCase, { props: { preset: 'aria' } }).body;
    const semantic = render(SliderScalarCase, { props: { preset: 'semantics' } }).body;

    expect(aria).toContain('aria-label="Temperature"');
    expect(aria).toContain('aria-valuetext="Value 48"');
    expect(aria).toContain('aria-required="true"');
    expect(semantic).toContain('provider-root local-root');
    expect(semantic).toContain('local-handle');
    expect(semantic).toContain('local-track');
    expect(semantic).toContain('semantic-tracks');
    expect(semantic).toContain('height:12px;background:rgb(200,210,220);');
    expect(semantic).not.toMatch(/<(?:input|div)[^>]*\s(?:marks|classNames|styles|vertical|ariaLabelForHandle)=/);
  });

  it('uses range preset colors for new decorations while keeping the plain native root', () => {
    const { body, head } = render(SliderScalarCase, { props: { preset: 'native-dark-green' } });
    const plain = render(Slider<false>, { props: { value: 48, tooltip: false } }).body;

    expect(body).toContain('ant-slider-css-var');
    expect(body).toContain('data-ant-slider-theme="dark"');
    expect(body).toContain('data-ant-slider-primary="green"');
    expect(head).not.toContain('scalar-source-scope');
    expect(plain).not.toContain('ant-slider-css-var');
    expect(plain).not.toContain('data-ant-slider-theme');
  });
});
