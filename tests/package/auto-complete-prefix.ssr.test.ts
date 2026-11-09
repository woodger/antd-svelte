import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { AutoComplete, type AutoCompleteProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-auto-complete-prefix-reference.json';
import AutoCompletePrefixSSRFixtures from '../browser/fixtures/AutoCompletePrefixSSRFixtures.svelte';

describe('AutoComplete local/shared prefixes', () => {
  it('pins Source styles and retained editor/popup/focus identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(28);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.samePopup && step.focused)).toBe(true);
  });

  it('renders local combobox classes without prop leaks, callbacks or an open SSR popup', () => {
    const onChange = vi.fn();
    const props = {
      prefixCls: 'choices', defaultValue: 'a', defaultOpen: true, onChange
    } satisfies AutoCompleteProps;
    const rendered = render(AutoComplete, { props });
    const body = rendered.body;

    expect(body).toContain('choices-input');
    expect(body).toContain('choices-auto-complete');
    expect(body).toContain('ant-select-css-var');
    expect(body).toContain('aria-expanded="false"');
    expect(body).not.toContain('role="listbox"');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('auto-complete-prefix:choices:ant');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('isolates nested owner/private namespaces without browser resources', () => {
    vi.useFakeTimers();

    try {
      const rendered = render(AutoCompletePrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-select-input');
      expect(body).toContain('choices-input');
      expect(body).toContain('--inner-select-height');
      expect(rendered.head).toContain('auto-complete-prefix:choices:inner');
      expect(rendered.head).toContain('--inner-select-border-color');
      expect(rendered.head).toContain('--ant-select-option-font-size');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
