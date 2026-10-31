import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import RadioButton from './RadioButton.svelte';
import RadioGroup from './RadioGroup.svelte';

describe('RadioButton SSR', () => {
  it('renders a native radio with source button classes and the standalone default state', () => {
    const body = render(RadioButton, { props: {
      value: 0,
      defaultChecked: true,
      name: 'choice',
      rootClassName: 'owner',
      children: createRawSnippet(() => ({ render: () => '<span>Zero</span>' }))
    } }).body;

    expect(body).toContain('ant-radio-button-wrapper ant-radio-css-var ant-radio-button-css-var');
    expect(body).toContain('ant-radio-button-wrapper-checked');
    expect(body).toContain('ant-radio-button-label');
    expect(body).toMatch(/class="ant-radio-button-input(?:\s|"|$)/);
    expect(body).toContain('type="radio"');
    expect(body).toContain('name="choice"');
    expect(body).toContain('value="0"');
    expect(body).toContain('checked');
    expect(body).not.toContain('type="button"');
  });

  it('applies group appearance and uses nonempty options before children', () => {
    const body = render(RadioGroup, { props: {
      options: [{ value: false, label: 'False' }, { value: 0, label: 'Zero', disabled: true }],
      defaultValue: false,
      optionType: 'button',
      size: 'small',
      buttonStyle: 'solid',
      block: true,
      children: createRawSnippet(() => ({ render: () => '<p>Ignored</p>' }))
    } }).body;

    expect(body).toContain('ant-radio-group-solid ant-radio-group-small ant-radio-group-block');
    expect(body).toContain('ant-radio-button-wrapper-block');
    expect(body).toContain('ant-radio-button-wrapper-disabled');
    expect(body).toContain('value="false"');
    expect(body).not.toContain('Ignored');
  });

  it('renders children for an empty option list while keeping the existing fieldset contract', () => {
    const body = render(RadioGroup, { props: {
      options: [],
      children: createRawSnippet(() => ({ render: () => '<p>Custom options</p>' }))
    } }).body;

    expect(body).toContain('<fieldset');
    expect(body).toContain('role="radiogroup"');
    expect(body).toContain('ant-radio-group-outline');
    expect(body).toContain('Custom options');
  });
});
