import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Radio, RadioGroup, type RadioChangeEvent, type RadioGroupProps } from 'antd-svelte';
import RadioFeaturesFixture from './RadioFeaturesFixture.svelte';

describe('Radio source package features', () => {
  it('merges all semantic slots and keeps the source four-layer root style priority', () => {
    const body = render(RadioFeaturesFixture).body;

    expect(body).toContain('config-radio');
    expect(body).toContain('config-root');
    expect(body).toContain('config-icon');
    expect(body).toContain('config-label');
    expect(body).toContain('checked-true');
    expect(body).toContain('local-label');
    expect(body).toContain('color:blue;color:red;color:green;color:orange');
    expect(body).toContain('outline:1px solid red;opacity:.5');
  });

  it('renders option snippets and metadata without coercing typed native values', () => {
    const body = render(RadioFeaturesFixture).body;
    const input = body.match(/<input[^>]*id="rich-option"[^>]*>/)?.[0];

    expect(body).toContain('<strong>Rich option</strong>');
    expect(body).toMatch(/<label[^>]*class="[^"]*rich-class[^>]*title="Rich title"/);
    expect(input).toContain('value="false"');
    expect(input).toMatch(/\srequired(?:[\s=>])/);
    expect(input).not.toContain('title=');
    expect(body).toContain('aria-checked="true"');
  });

  it.each([
    [true, undefined, 'vertical'],
    [true, 'horizontal', 'horizontal'],
    [false, 'vertical', 'vertical']
  ] as const)('resolves vertical=%s and orientation=%s to %s', (vertical, orientation, expected) => {
    const body = render(RadioGroup, { props: { options: ['A'], vertical, orientation } }).body;

    expect(body).toContain(`aria-orientation="${expected}"`);
    expect(body.includes('ant-radio-group-vertical')).toBe(expected === 'vertical');
  });

  it('passes a custom prefix to generated options and preserves native group roles', () => {
    const body = render(RadioGroup, {
      props: { options: ['A'], prefixCls: 'custom-radio', role: 'group' }
    }).body;

    expect(body).toContain('custom-radio-group');
    expect(body).toContain('custom-radio-wrapper');
    expect(body).toContain('custom-radio-input');
    expect(body).toContain('role="group"');
    expect(body).not.toContain('role="radiogroup"');
  });

  it('keeps semantic icon styles on the holder and title on the native label', () => {
    const body = render(Radio, { props: { title: 'Radio title',
      styles: { icon: 'color:red' }, children: createRawSnippet(() => ({ render: () => '<b>Label</b>' })) }
    }).body;

    expect(body).toMatch(/<label[^>]*title="Radio title"/);
    expect(body).toMatch(/<span[^>]*class="ant-radio[^>]*style="color:red"/);
    expect(body).not.toMatch(/<input[^>]*title=/);
    expect(body).not.toMatch(/<input[^>]*style="color:red"/);
  });

  it('renders without DOM or callbacks and retains typed group change events', () => {
    const onChange = vi.fn();
    const body = render(RadioGroup<number>, {
      props: { options: [0, 1], value: 0, onChange }
    }).body;

    expectTypeOf<NonNullable<RadioGroupProps<number>['onChange']>>().parameter(0)
      .toEqualTypeOf<RadioChangeEvent<number>>();
    expect(onChange).not.toHaveBeenCalled();
    expect(body).toContain('aria-checked="true"');
    expect(body).not.toMatch(/(?:classNames|onChange|prefixCls)=/);
  });
});
