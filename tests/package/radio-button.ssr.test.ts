import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { RadioButton, type RadioButtonProps } from 'antd-svelte';
import RadioButtonFixtures from '../browser/fixtures/RadioButtonFixtures.svelte';

describe('RadioButton package SSR', () => {
  it('renders a native radio through the public export without a button element', () => {
    const props: RadioButtonProps = { value: 'a', checked: true, name: 'mode' };

    const body = render(RadioButton, { props }).body;

    expect(body).toContain('ant-radio-button-wrapper-checked');
    expect(body).toContain('type="radio"');
    expect(body).toContain('name="mode"');
    expect(body).not.toContain('<button');
  });

  it('renders explicit and group button options with independent native form names', () => {
    const body = render(RadioButtonFixtures).body;

    expect(body).toContain('id="radio-button-fixture"');
    expect(body).toContain('ant-radio-group-outline');
    expect(body).toContain('name="period"');
    expect(body).toContain('name="standalone-button"');
    expect(body).toContain('Button month');
    expect(body).toContain('ant-radio-group-small');
    expect(body).toContain('ant-badge');
  });
});
