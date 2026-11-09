import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { InputSearch, type InputSearchProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-input-search-prefix-reference.json';
import InputSearchPrefixSSRFixtures from '../browser/fixtures/InputSearchPrefixSSRFixtures.svelte';

describe('InputSearch independent prefixes in the public package', () => {
  it('pins Source metrics, private height namespaces and live identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(29);
    const small = reference.cases.find(entry => entry.sample.id === 'small-aliases')!;

    expect(small.result.normal.button['min-height']).toBe('36.2857px');
    const aliases = reference.cases.find(entry => entry.sample.id === 'aliases')!;

    expect(aliases.result.nested.root['--inner-input-search-btn-height']).toBe('');
    expect(aliases.expectedNative.nested.root['--inner-input-search-btn-height']).toBe('32px');
    expect(reference.transitions.every(step => !step.sameInput && step.sameRoot
      && step.sameButton && !step.focused)).toBe(true);
  });

  it('renders independent Search, Input and Button classes without leaking prefix props', () => {
    const props = {
      prefixCls: 'finder', inputPrefixCls: 'field', defaultValue: 'Draft',
      classNames: ({ props }) => ({ root: `${props.prefixCls}-${props.inputPrefixCls}` })
    } satisfies InputSearchProps;
    const rendered = render(InputSearch, { props });

    expect(rendered.body).toContain('finder-btn');
    expect(rendered.body).toContain('finder-field');
    expect(rendered.body).toContain('ant-btn');
    expect(rendered.body).toContain('class="field');
    expect(rendered.body).not.toMatch(/(?:inputPrefixCls|prefixCls)=/);
    expect(rendered.head).toContain('input-search-prefix:finder:ant');
  });

  it('retains native form fields and starts no browser resources or callbacks on SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(InputSearchPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-input-search');
      expect(rendered.body).toContain('inner-btn');
      expect(rendered.body).toContain('name="search"');
      expect(rendered.body).toContain('type="search"');
      expect(rendered.head).toContain('--inner-input-search-btn-height');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
