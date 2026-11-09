import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Input, TextArea, type InputProps, type TextAreaProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-input-prefix-reference.json';
import InputPrefixSSRFixtures from '../browser/fixtures/InputPrefixSSRFixtures.svelte';

describe('Input/TextArea local/shared prefixes in the public package', () => {
  it('pins source metrics and live wrapper, leaf and selection identities', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(27);
    expect(reference.transitions.every(step => step.sameInput && step.sameTextarea
      && step.sameRoots && step.focused)).toBe(true);
    expect(reference.transitions.map(step => step.formValues)).toEqual([
      [['single', 'kept draft'], ['multiline', 'kept draft']],
      [['single', 'kept draft'], ['multiline', 'kept draft']],
      [['single', 'kept draft'], ['multiline', 'kept draft']]
    ]);
  });

  it('renders local parts and raw semantic prefix without leaking prefix props', () => {
    const props = {
      prefixCls: 'field',
      defaultValue: 'Draft',
      allowClear: true,
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    } satisfies InputProps;
    const rendered = render(Input, { props });

    expect(rendered.body).toContain('field-affix-wrapper');
    expect(rendered.body).toContain('field-clear-icon');
    expect(rendered.body).toContain('semantic-field');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('input-prefix:field');
    const textareaProps = {
      prefixCls: 'field', allowClear: true, defaultValue: 'Draft'
    } satisfies TextAreaProps;

    expect(render(TextArea, { props: textareaProps }).body)
      .toContain('field-textarea-affix-wrapper');
  });

  it('preserves native fields and names without starting measurement or browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(InputPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-input-affix-wrapper');
      expect(rendered.body).toContain('field-textarea-show-count');
      expect(rendered.body).toContain('name="multiline"');
      expect(rendered.body).toContain('<textarea');
      expect(rendered.head).toContain('input-prefix:field');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
