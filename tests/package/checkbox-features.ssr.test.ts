import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Checkbox,
  CheckboxGroup,
  type CheckboxGroupProps,
  type CheckboxProps
} from 'antd-svelte';
import CheckboxFeaturesFixture from './CheckboxFeaturesFixture.svelte';

describe('Checkbox source package features', () => {
  it('merges semantic slots and four-layer root styles using checked and mixed state', () => {
    const body = render(CheckboxFeaturesFixture).body;

    expect(body).toContain('checkbox-context');
    expect(body).toContain('context-root');
    expect(body).toContain('context-icon');
    expect(body).toContain('context-label');
    expect(body).toContain('local-true-true');
    expect(body).toContain('color:blue;color:red;color:green;color:orange');
    expect(body).toContain('outline:1px solid red;opacity:.5');
    expect(body).toContain('aria-checked="mixed"');
  });

  it('keeps typed group state through Grid and isolates skipped and nested names', () => {
    const body = render(CheckboxFeaturesFixture).body;
    const inputs = body.match(/<input\b[^>]*>/g) ?? [];
    const children = inputs.filter(input => input.includes('name="children"'));

    expect(children).toHaveLength(2);
    expect(children.find(input => input.includes('value="false"')))
      .toContain('aria-checked="true"');
    expect(children.find(input => input.includes('value="0"'))).toContain('aria-checked="false"');
    expect(inputs.find(input => input.includes('name="independent"')))
      .toContain('aria-checked="true"');
    expect(inputs.find(input => input.includes('name="nested"'))).toContain('aria-checked="true"');
    expect(body).toContain('ant-row');
  });

  it('renders rich metadata with title on the holder and id on the input', () => {
    const body = render(CheckboxFeaturesFixture).body;
    const input = body.match(/<input[^>]*id="rich-checkbox"[^>]*>/)?.[0];

    expect(body).toContain('<strong>Rich option</strong>');
    expect(body).toContain('ant-checkbox-group-item rich-class');
    expect(body).toMatch(/<span[^>]*title="Rich title"/);
    expect(input).not.toContain('title=');
    expect(input).toMatch(/\srequired(?:[\s=>])/);
  });

  it('gives normalized options priority and falls back to children when options are empty', () => {
    const children = createRawSnippet(() => ({ render: () => '<strong>Fallback child</strong>' }));
    const body = render(CheckboxGroup, {
      props: { options: [null, undefined], 'aria-label': 'Empty', children }
    }).body;
    const options = render(CheckboxGroup, {
      props: { options: ['Option'], value: ['Option'], children }
    }).body;

    expect(body).toContain('role="group"');
    expect(body).not.toContain('<input');
    expect(body).toContain('Fallback child');
    expect(options).toContain('aria-checked="true"');
    expect(options).toContain('Option');
    expect(options).not.toContain('Fallback child');
  });

  it('passes custom prefixes to options and supports an explicit group role', () => {
    const body = render(CheckboxGroup, {
      props: {
        options: ['A'],
        prefixCls: 'custom-checkbox',
        role: 'region',
        'aria-label': 'Custom'
      }
    }).body;

    expect(body).toContain('custom-checkbox-group');
    expect(body).toContain('custom-checkbox-input');
    expect(body).toContain('role="region"');
    expect(body).not.toContain('role="group"');
  });

  it('keeps native defaults and aliases without forwarding source handlers to attributes', () => {
    const body = render(Checkbox, {
      props: { defaultChecked: true, autoFocus: true, tabIndex: 3, name: 'accepted' }
    }).body;

    expect(body).toContain('value="on"');
    expect(body).toContain('autofocus');
    expect(body).toContain('tabindex="3"');
    expect(body).not.toMatch(/(?:autoFocus|tabIndex|classNames|onChange)=/);
  });

  it('renders without DOM or callbacks and preserves typed value callback boundaries', () => {
    const onChange = vi.fn();
    const props: CheckboxProps = { value: false, onChange };
    const body = render(Checkbox, { props }).body;

    expectTypeOf<NonNullable<CheckboxGroupProps<number>['onChange']>>().parameter(0)
      .toEqualTypeOf<number[]>();
    expect(onChange).not.toHaveBeenCalled();
    expect(body).toContain('value="false"');
    expect(body).not.toContain('type="hidden"');
  });
});
