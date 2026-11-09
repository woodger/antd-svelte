import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, type CheckboxProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-checkbox-prefix-reference.json';
import CheckboxPrefixSSRFixtures from '../browser/fixtures/CheckboxPrefixSSRFixtures.svelte';

describe('Checkbox local/shared prefixes in the public package', () => {
  it('pins official source states and multiple form values across live prefix changes', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(20);
    expect(reference.transitions.every(step => step.sameGroup && step.sameInputs
      && step.sameEditor && step.focused)).toBe(true);
    expect(reference.transitions.map(step => step.checkboxValues))
      .toEqual([['a', 'b'], ['a', 'b'], ['a', 'b']]);
    const aliases = reference.cases.find(entry => entry.sample.id === 'aliases-row')!;

    expect(aliases.result.nested.row?.style['flex-grow']).toBe('0');
    expect('freshNested' in aliases && aliases.freshNested?.row?.style['flex-grow']).toBe('1');
  });

  it('renders local mixed state and raw semantic prefix without leaking props', () => {
    const props = {
      prefixCls: 'choice',
      checked: true,
      indeterminate: true,
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    } satisfies CheckboxProps;
    const rendered = render(Checkbox, { props });

    expect(rendered.body).toContain('choice-wrapper-checked');
    expect(rendered.body).toContain('choice-indeterminate');
    expect(rendered.body).toContain('choice-input');
    expect(rendered.body).toContain('semantic-choice');
    expect(rendered.body).toContain('aria-checked="mixed"');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('checkbox-prefix:choice:ant');
  });

  it('preserves native fieldsets, names and SSR without browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(CheckboxPrefixSSRFixtures);

      expect(rendered.body).toContain('<fieldset');
      expect(rendered.body).toContain('suite-checkbox-group');
      expect(rendered.body).toContain('choice-indeterminate');
      expect(rendered.body).toContain('name="nested-choice"');
      expect(rendered.head).toContain('checkbox-prefix:choice:inner');
      expect(rendered.head).toContain('.inner-row');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
