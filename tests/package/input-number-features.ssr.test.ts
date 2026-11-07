import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { InputNumber, type InputNumberProps } from 'antd-svelte';
import InputNumberFeaturesFixture from './InputNumberFeaturesFixture.svelte';

describe('InputNumber source package features', () => {
  it('preserves precise strings in displayed values, ARIA and one native field', () => {
    const value = '9007199254740993.00000000000001';
    const body = render(InputNumber, { props: { value, stringMode: true, name: 'amount',
      step: '0.00000000000001' } }).body;

    expect(body).toContain(`aria-valuenow="${value}"`);
    expect(body).toContain(`value="${value}"`);
    expect(body.match(/name="amount"/g)).toHaveLength(1);
    expect(body).toMatch(new RegExp(`<input[^>]*type="hidden"[^>]*value="${value}"`));
  });

  it('keeps numeric props and their callback parameter compatible by default', () => {
    const props: InputNumberProps = { value: 0 };
    const body = render(InputNumber<number>, { props }).body;

    expectTypeOf<NonNullable<InputNumberProps['onValueChange']>>().parameter(0)
      .toEqualTypeOf<number | null>();
    expect(body).toContain('aria-valuenow="0"');
    expect(body).toContain('value="0"');
  });

  it('inherits config, semantic layers, spinner, size and RTL', () => {
    const body = render(InputNumberFeaturesFixture).body;

    expect(body).toContain('number-config');
    expect(body).toContain('number-config-prefix');
    expect(body).toContain('number-config-input');
    expect(body).toContain('number-local-small');
    expect(body).toContain('ant-input-number-filled');
    expect(body).toContain('ant-input-number-mode-spinner');
    expect(body).toContain('ant-input-number-rtl');
    expect(body).toContain('color:blue;color:red;color:green;color:orange');
    expect(body).toContain('color:purple');
    expect(body.indexOf('ant-input-number-action-down')).toBeLessThan(body.indexOf('<input'));
    expect(body.indexOf('ant-input-number-action-up')).toBeGreaterThan(body.indexOf('<input'));
  });

  it.each(['filled', 'underlined', 'borderless'] as const)('renders the %s variant', variant => {
    const body = render(InputNumber, { props: { variant, controls: false } }).body;

    expect(body).toContain(`ant-input-number-${variant}`);
    expect(body).toContain('ant-input-number-without-controls');
    expect(body).not.toContain('<button');
  });

  it('keeps formatted display and numeric form data separate with a decimal separator', () => {
    const body = render(InputNumber, { props: { value: 1.25, name: 'amount',
      decimalSeparator: ',', precision: 2 } }).body;

    expect(body).toContain('value="1,25"');
    expect(body).toMatch(/<input[^>]*type="hidden"[^>]*value="1.25"/);
  });

  it('keeps spinner SSR free of callbacks and step timers', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    try {
      const body = render(InputNumber, { props: { defaultValue: 1, mode: 'spinner', onChange: callback, onStep: callback } }).body;

      expect(body).toContain('ant-input-number-mode-spinner');
      expect(callback).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
