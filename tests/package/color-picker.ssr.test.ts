import { render } from 'svelte/server';
import { describe, it, expect, vi } from 'vitest';
import { ColorPicker, InputNumber, type ColorPickerProps, type Color } from 'antd-svelte';
import ColorPickerFixture from './ColorPickerFixture.svelte';

describe('ColorPicker public package', () => {
  it('renders a native trigger with source color text and no form submission value', () => {
    const body = render(ColorPicker, { props: { value: '#1677ff', showText: true } }).body;

    expect(body).toContain('type="button"');
    expect(body).toContain('aria-haspopup="dialog"');
    expect(body).toContain('#1677FF');
    expect(body).toContain('background:rgb(22,119,255)');
    expect(body).not.toContain('type="hidden"');
  });

  it.each([null, '', []])('renders a cleared value without a numeric input adapter (%j)', value => {
    const body = render(ColorPicker, { props: { value, showText: true } }).body;

    expect(body).toContain('ant-color-picker-clear');
    expect(body).toContain('Прозрачный');
    expect(body).not.toContain('ant-color-picker-color-block-inner');
  });

  it('preserves gradient point ordering in the trigger and explicit gradient mode', () => {
    const props: ColorPickerProps = { value: [{ percent: 100, color: '#f00' },
      { percent: 0, color: '#00f' }], mode: 'gradient', open: true, showText: true };
    const body = render(ColorPicker, { props }).body;

    expect(body).toContain('linear-gradient(90deg, rgb(255,0,0) 100%, rgb(0,0,255) 0%)');
    expect(body).toContain('ant-color-picker-gradient-slider');
    expect(body.match(/aria-label="Gradient stop"/g)).toHaveLength(2);
    expect(body).toContain('aria-label="Hue"');
    expect(body).toContain('aria-label="Alpha"');
  });

  it('inherits locale/config/size/RTL and applies local semantic layers in order', () => {
    const body = render(ColorPickerFixture).body;

    expect(body).toContain('provider-color');
    expect(body).toContain('provider-body');
    expect(body).toContain('provider-popup');
    expect(body).toContain('local-large');
    expect(body).toContain('local-description');
    expect(body).toContain('ant-color-picker-rtl');
    expect(body).toContain('color:blue;color:red;color:green;color:orange');
    expect(body).toContain('color:purple');
    expect(body).toContain('rgba(22,119,255,');
  });

  it('does not call color/open/container callbacks or allocate timers during SSR', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    try {
      const props: ColorPickerProps = { open: true, allowClear: true,
        onChange: (color: Color) => callback(color), onOpenChange: callback,
        onChangeComplete: callback, getPopupContainer: callback };
      const body = render(ColorPicker, { props }).body;

      expect(body).toContain('aria-label="Hex color"');
      expect(body).toContain('hidden');
      expect(callback).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders numeric InputNumber forms separately from formatted display', () => {
    const body = render(InputNumber, { props: { value: 50, name: 'rate',
      formatter: value => `${value}%`, parser: text => Number(text?.replace('%', '')) } }).body;

    expect(body).toContain('value="50%"');
    expect(body).toContain('type="hidden" name="rate" value="50"');
  });
});
