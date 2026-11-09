import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Select, type SelectProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-select-prefix-reference.json';
import SelectPrefixSSRFixtures from '../browser/fixtures/SelectPrefixSSRFixtures.svelte';

describe('Select local/shared prefixes', () => {
  it('pins Source styles and retained search/popup/focus identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(26);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.samePopup && step.focused)).toBe(true);
  });

  for (const mode of [undefined, 'multiple', 'tags'] as const) {
    it(`renders local ${mode ?? 'single'} parts with a closed SSR popup and no prop leak`, () => {
      const onOpenChange = vi.fn();
      const props = {
        prefixCls: 'choices', mode, options: [{ value: 'a', label: 'Alpha' }],
        open: true, defaultOpen: true, onOpenChange
      } satisfies SelectProps<string, typeof mode>;
      const rendered = render(Select<string, typeof mode>, { props });
      const body = rendered.body;

      expect(body).toContain('choices-input');
      expect(body).toContain(mode ? 'choices-multiple' : 'choices-single');
      expect(body).toContain('ant-select-css-var');
      expect(body).toContain('aria-expanded="false"');
      expect(body).not.toContain('role="listbox"');
      expect(body).not.toContain('prefixCls=');
      expect(rendered.head).toContain('select-prefix:choices:ant');
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  }

  it('isolates nested owner/private namespaces without browser callbacks or timers', () => {
    vi.useFakeTimers();

    try {
      const rendered = render(SelectPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-select-input');
      expect(body).toContain('choices-selection-item');
      expect(body).toContain('--inner-select-height');
      expect(body).not.toContain('role="listbox"');
      expect(rendered.head).toContain('select-prefix:choices:inner');
      expect(rendered.head).toContain('--inner-select-multi-item-height');
      expect(rendered.head).toContain('--ant-select-multiple-item-height');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
