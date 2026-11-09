import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown, type DropdownProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-dropdown-prefix-reference.json';
import DropdownPrefixSSRFixtures from '../browser/fixtures/DropdownPrefixSSRFixtures.svelte';

describe('Dropdown local/shared prefixes', () => {
  it('pins Source popup/arrow CSS and live identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(19);
    for (const entry of reference.cases) {
      for (const scope of ['normal', 'nested', 'sibling'] as const) {
        const raw = entry.result[scope];
        const counterpart = entry.nativeLayout[scope];

        expect(raw.title).toEqual({ flex: '1 1 auto', 'min-width': 'auto' });
        expect(counterpart.title).toEqual({ flex: '0 1 auto', 'min-width': '0px' });
        expect(raw.popup?.direction).toBe('ltr');
        expect(counterpart.popup?.direction).toBe('rtl' in entry.sample && entry.sample.rtl
          && scope !== 'sibling' ? 'rtl' : 'ltr');
      }
    }
    expect(reference.transitions.every(step => step.sameTrigger && step.samePopup && step.sameMenu
      && step.sameCommand && step.focused)).toBe(true);
  });

  it('renders local parts and native commands without leaking prefix or adding leading text', () => {
    const props = {
      prefixCls: 'commands', children: createRawSnippet(() => ({ render: () => '<button>Actions</button>' })),
      menu: { items: [{ key: 'normal', label: 'Normal' }] }
    } satisfies DropdownProps;
    const rendered = render(Dropdown, { props });
    const body = rendered.body;

    expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/^<span/);
    expect(body).toContain('commands-trigger');
    expect(body).toContain('commands-menu-item');
    expect(body).toContain('popover="manual"');
    expect(body).toContain('hidden');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('dropdown-prefix:commands:ant');
  });

  it('isolates local/shared Button namespaces without invoking container or timers in SSR', () => {
    const getPopupContainer = vi.fn<() => HTMLElement>();
    vi.useFakeTimers();
    try {
      const rendered = render(DropdownPrefixSSRFixtures, { props: { getPopupContainer } });
      const body = rendered.body;

      expect(body).toContain('suite-dropdown-menu');
      expect(body).toContain('commands-menu');
      expect(rendered.head).toContain('.inner-btn-icon');
      expect(rendered.head).toContain('--ant-dropdown-padding-block');
      expect(getPopupContainer).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
