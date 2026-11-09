import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Drawer, type DrawerProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-drawer-prefix-reference.json';
import DrawerPrefixSSRFixtures from '../browser/fixtures/DrawerPrefixSSRFixtures.svelte';

describe('Drawer local/shared prefixes', () => {
  it('pins Source panel CSS and live draft identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(18);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput && step.samePanel
      && step.focused && step.value === 'Edited')).toBe(true);
  });

  it('renders local parts in a closed native dialog without leaking prefix', () => {
    const props = { prefixCls: 'panel', title: 'Panel', forceRender: true } satisfies DrawerProps;
    const rendered = render(Drawer, { props });
    const body = rendered.body;

    expect(body).toContain('<dialog');
    expect(body).toContain('panel-content-wrapper');
    expect(body).toContain('panel-header');
    expect(body).toContain('ant-drawer-css-var');
    expect(body).not.toContain('prefixCls=');
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
    expect(rendered.head).toContain('drawer-prefix:panel');
  });

  it('keeps global/local CSS scopes independent without browser work in SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(DrawerPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-drawer');
      expect(body).toContain('panel-body');
      expect(rendered.head).toContain('drawer-prefix:panel');
      expect(rendered.head).toContain('--ant-drawer-footer-padding-block');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
