import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Radio, RadioButton, type RadioProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-radio-prefix-reference.json';
import RadioPrefixSSRFixtures from '../browser/fixtures/RadioPrefixSSRFixtures.svelte';

describe('Radio local/shared prefixes in the public package', () => {
  it('pins official source styles and selected form values across live prefix changes', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(23);
    expect(reference.transitions.every(step => step.sameGroup && step.sameInputs
      && step.sameEditor && step.focused && step.radioValue === 'b')).toBe(true);
    const defaults = reference.cases.find(entry => entry.sample.id === 'default')!;

    expect(defaults.result.normal.button.checked).toBe(true);
    expect(defaults.result.normal.button.classes).not.toContain('ant-radio-button-wrapper-checked');
    expect(defaults.matched.normal.button.classes).toContain('ant-radio-button-wrapper-checked');
    expect(reference.cases.find(entry => entry.sample.id === 'badge')!.result.normal.group[1]
      .root['border-inline-start-width']).toBe('1px');
  });

  it('uses the base prefix for ordinary and button classes without leaking prefix props', () => {
    const props = {
      prefixCls: 'choice',
      defaultChecked: true,
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    } satisfies RadioProps;
    const rendered = render(Radio, { props });

    expect(rendered.body).toContain('choice-wrapper-checked');
    expect(rendered.body).toContain('choice-input');
    expect(rendered.body).toContain('semantic-choice');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('radio-prefix:choice:ant');
    expect(render(RadioButton, { props }).body).toContain('choice-button-wrapper-checked');
  });

  it('keeps native fieldsets, values and SSR free from browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(RadioPrefixSSRFixtures);

      expect(rendered.body).toContain('<fieldset');
      expect(rendered.body).toContain('suite-radio-group');
      expect(rendered.body).toContain('choice-button-wrapper');
      expect(rendered.body).toContain('name="nested-choice"');
      expect(rendered.head).toContain('radio-prefix:choice:inner');
      expect(rendered.head).toContain('.inner-badge');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
