import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Menu, type MenuProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-menu-prefix-reference.json';
import MenuPrefixSSRFixtures from '../browser/fixtures/MenuPrefixSSRFixtures.svelte';

describe('Menu local/shared prefixes', () => {
  it('pins Source modes, themes and live identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(14);
    expect(reference.transitions).toHaveLength(9);
    const local = reference.cases.find(entry => entry.sample.id === 'local')!;

    expect(local.result.inline.normal.nested?.divider?.['border-style']).toBe('solid');
    expect(local.matchedDivider).toBeDefined();
    expect(local.matchedDivider!.inline.normal.nested?.divider?.['border-style']).toBe('dashed');
    expect(reference.transitions.every(step => step.sameRoot && step.sameItem && step.sameTitle
      && step.focused)).toBe(true);
  });

  it('renders local items, selection and canonical token markers without leaking prefix or leading text', () => {
    const props = {
      prefixCls: 'navigation', defaultSelectedKeys: ['normal'], items: [{ key: 'normal', label: 'Normal' }]
    } satisfies MenuProps;
    const rendered = render(Menu, { props });
    const body = rendered.body;

    expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/^<ul/);
    expect(body).toContain('navigation-root');
    expect(body).toContain('navigation-item-selected');
    expect(body).toContain('ant-menu-css-var');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('menu-prefix:navigation:ant');
    expect(rendered.head).toContain('--ant-menu-item-selected-bg');
  });

  it('isolates nested theme scopes and shared Typography namespace without browser work in SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(MenuPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-menu');
      expect(body).toContain('navigation-sub');
      expect(rendered.head).toContain('.inner-typography-ellipsis-single-line');
      expect(rendered.head).toContain('@scope (.ant-menu-css-var:where(');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
