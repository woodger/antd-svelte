import { type LayoutProps, type LayoutSiderProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-layout-prefix-reference.json';
import sections from '../browser/fixtures/ant-design-layout-section-prefix-observation.json';
import LayoutPrefixFixtures from '../browser/fixtures/LayoutPrefixFixtures.svelte';
import type { LayoutConfigSample } from '../browser/fixtures/layout-config-cases';

describe('Layout and Sider local prefix public package', () => {
  it('pins source namespaces, variants and reactive root/Sider identities', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(32);
    expect(reference.transitions.map(entry => entry.sameRoot && entry.sameSider))
      .toEqual([true, true, true, true]);
    expect(reference.observations.sequentialStyleCache.warm.root.position).toBe('relative');
    expect(reference.observations.sequentialStyleCache.isolated.root.position).toBe('static');
  });

  it('keeps raw source section prefix failures for the separate section migration', () => {
    expect(sections.reference.revision).toBe(registry.upstream.revision);
    for (const part of ['Header', 'Content', 'Footer']) {
      const normal = sections.cases.find(entry => entry.part === part && !entry.custom)!;
      const custom = sections.cases.find(entry => entry.part === part && entry.custom)!;

      expect(normal.display).toBe('block');
      expect(custom.display).toBe('flex');
      expect(custom.direction).toBe('column');
    }
  });

  it('publishes independent prefixes while retaining native sections and token names in SSR', () => {
    const root: Pick<LayoutProps, 'prefixCls'> = { prefixCls: 'frame' };
    const sider: Pick<LayoutSiderProps, 'prefixCls'> = { prefixCls: 'sidebar' };
    const rendered = render(LayoutPrefixFixtures);

    expect(root.prefixCls).toBe('frame');
    expect(sider.prefixCls).toBe('sidebar');
    expect(rendered.body).toContain('sidebar-children');
    expect(rendered.body).toContain('sidebar-trigger');
    expect(rendered.body).toContain('ant-layout-header');
    expect(rendered.body).toContain('data-ant-layout-root=""');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('data-ant-svelte-theme="layout-prefix:frame"');
    expect(rendered.head).toContain('data-ant-svelte-theme="layout-sider-prefix:sidebar"');
  });

  it('uses the shared stylesheet for empty prefixes and keeps zero-width content inert', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'empty-ltr')!
      .sample as LayoutConfigSample;
    const rendered = render(LayoutPrefixFixtures, { props: { sample } });
    const zero = reference.cases.find(({ sample }) => sample.id === 'zero-ltr')!
      .sample as LayoutConfigSample;
    const body = render(LayoutPrefixFixtures, { props: { sample: zero } }).body;

    expect(rendered.head).not.toContain('data-ant-svelte-theme="layout-prefix:');
    expect(rendered.head).not.toContain('data-ant-svelte-theme="layout-sider-prefix:');
    expect(body).toContain('sidebar-zero-width-trigger');
    expect(body).toMatch(/sidebar-children[^>]* inert/);
    expect(body).toContain('aria-expanded="false"');
  });
});
