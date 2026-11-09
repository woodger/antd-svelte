import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { InputNumber, type InputNumberProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-input-number-prefix-reference.json';
import InputNumberPrefixSSRFixtures from '../browser/fixtures/InputNumberPrefixSSRFixtures.svelte';

describe('InputNumber local/shared prefixes in the public package', () => {
  it('pins Source metrics and distinguishes edited Source form text from canonical Native values', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(29);
    expect(reference.transitions.every(step => step.sameInput && step.sameRoot && step.focused))
      .toBe(true);
    expect(reference.transitions[0].result.normal.actions!.opacity).toBe('0');
    expect(reference.transitions[0].expectedNative.normal.actions!.opacity).toBe('1');
    expect(reference.transitions.map(step => step.formValues)).toEqual([
      [['amount', '2.50']], [['amount', '2.50']], [['amount', '2.50']]
    ]);
  });

  it('renders local states, affixes and actions without leaking prefix props', () => {
    const props = {
      prefixCls: 'meter', defaultValue: 1.25, prefix: '$', suffix: 'kg',
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    } satisfies InputNumberProps;
    const rendered = render(InputNumber, { props });

    expect(rendered.body).toContain('meter-mode-input');
    expect(rendered.body).toContain('meter-prefix');
    expect(rendered.body).toContain('meter-suffix');
    expect(rendered.body).toContain('meter-actions');
    expect(rendered.body).toContain('semantic-meter');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('input-number-prefix:meter');
  });

  it('retains native hidden fields and Source spinner classes without starting browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(InputNumberPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-input-number-prefix');
      expect(rendered.body).toContain('meter-mode-spinner');
      expect(rendered.body).toContain('role="spinbutton"');
      expect(rendered.body).toContain('type="hidden" name="amount" value="1.25"');
      expect(rendered.head).toContain('input-number-prefix:meter');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
