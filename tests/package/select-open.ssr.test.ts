import { Select, type SelectProps } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-open-reference.json';

describe('Select popup visibility public package', () => {
  it('pins source default and controlled visibility and its hidden numeric empty content', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcSelectStudyVersion).toBe('1.10.1');
    expect(reference.reference.rcUtilStudyVersion).toBe('1.14.0');
    expect(reference.cases).toHaveLength(25);
    expect(reference.cases.every(entry => entry.ssr.expanded === 'false' && !entry.ssr.listbox))
      .toBe(true);
    const zero = reference.cases.find(entry => entry.sample.id === 'default-zero-empty')!;

    expect(zero.initial.expanded).toBe('false');
    expect(zero.initial.popup).toBe(false);
  });

  for (const mode of [undefined, 'multiple', 'tags'] as const) {
    it(`keeps ${mode ?? 'single'} SSR closed even with open and defaultOpen`, () => {
      const onOpenChange = vi.fn();
      const props: SelectProps<number, typeof mode> = {
        mode, open: true, defaultOpen: true, options: [{ value: 0, label: 'Zero' }], onOpenChange
      };
      const body = render(Select<number, typeof mode>, { props }).body;

      expect(body).toContain('aria-expanded="false"');
      expect(body).not.toContain('role="listbox"');
      expect(body).not.toContain('defaultOpen=');
      expect(body).not.toMatch(/<input[^>]*\sopen=/);
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  }

  it('accepts common empty content and omits reserved visibility props from the input', () => {
    const props: SelectProps<number> = {
      open: false, defaultOpen: true, notFoundContent: Object.freeze([0, false, 'Unavailable'])
    };
    const body = render(Select<number>, { props }).body;

    expect(body).toContain('aria-expanded="false"');
    expect(body).not.toContain('notFoundContent=');
    expect(body).not.toContain('Unavailable');
  });
});
