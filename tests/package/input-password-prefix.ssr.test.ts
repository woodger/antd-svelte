import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { InputPassword, type InputPasswordProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-input-password-prefix-reference.json';
import InputPasswordPrefixSSRFixtures from '../browser/fixtures/InputPasswordPrefixSSRFixtures.svelte';

describe('InputPassword independent prefixes in the public package', () => {
  it('pins raw source results and the public paired-prefix counterpart', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(29);
    const independent = reference.cases.find(entry => entry.sample.id === 'independent')!;

    expect(independent.result.normal.toggle!.style.cursor).toBe('auto');
    expect(independent.expectedNative.normal.toggle!.style.cursor).toBe('pointer');
    expect(reference.transitions.every(step => step.sameInput && step.sameRoot
      && step.sameToggle && step.focused)).toBe(true);
  });

  it('renders independent root and icon prefixes and supplies raw props to semantics', () => {
    const props = {
      prefixCls: 'secret', inputPrefixCls: 'field', defaultValue: 'Draft',
      classNames: ({ props }) => ({ root: `${props.prefixCls}-${props.inputPrefixCls}` })
    } satisfies InputPasswordProps;
    const rendered = render(InputPassword, { props });

    expect(rendered.body).toContain('field-affix-wrapper');
    expect(rendered.body).toContain('secret-icon');
    expect(rendered.body).toContain('secret-field');
    expect(rendered.body).not.toMatch(/(?:inputPrefixCls|prefixCls)=/);
    expect(rendered.head).toContain('input-password-prefix:field:secret');
    expect(rendered.head).toContain('.field-affix-wrapper:where(.secret) .secret-icon');
  });

  it('keeps native password semantics without scheduling cleanup timers during SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(InputPasswordPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-input-password-icon');
      expect(rendered.body).toContain('field-affix-wrapper');
      expect(rendered.body).toContain('type="password"');
      expect(rendered.body).toContain('name="password"');
      expect(rendered.head).toContain('input-password-prefix:field:secret');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
