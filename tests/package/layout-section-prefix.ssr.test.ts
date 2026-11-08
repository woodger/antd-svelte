import { type LayoutSectionProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-layout-section-prefix-reference.json';
import LayoutSectionPrefixFixtures from '../browser/fixtures/LayoutSectionPrefixFixtures.svelte';
import type { LayoutSectionPrefixSample } from '../browser/fixtures/layout-section-prefix-cases';

describe('Layout sections local prefix public package', () => {
  it('pins raw custom prefix behavior and independent default role baselines', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(24);
    const custom = reference.cases.find(entry => entry.sample.id === 'custom-ltr')!;

    expect(custom.raw.normal.header.display).toBe('flex');
    expect(custom.expectedRoles.normal.header.display).toBe('block');
    expect(custom.raw.normal.header.background).not.toBe(custom.expectedRoles.normal.header.background);
  });

  it('publishes literal section prefixes while preserving native tags and token namespace', () => {
    const props: Pick<LayoutSectionProps, 'prefixCls'> = { prefixCls: 'region' };
    const sample = reference.cases.find(entry => entry.sample.id === 'custom-ltr')!
      .sample as LayoutSectionPrefixSample;
    const rendered = render(LayoutSectionPrefixFixtures, { props: { sample } });

    expect(props.prefixCls).toBe('region');
    for (const name of ['region-header', 'region-content', 'region-footer']) {
      expect(rendered.body).toContain(name);
    }
    for (const tag of ['header', 'main', 'footer']) expect(rendered.body).toContain(`<${tag}`);
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('--ant-layout-header-height');
  });

  it('provides standalone default variables before hydration without changing wrapped inheritance', () => {
    const rendered = render(LayoutSectionPrefixFixtures);

    expect(rendered.head).toContain('layout-header-prefix:ant-layout-header');
    expect(rendered.head).toContain('layout-footer-prefix:ant-layout-footer');
    expect(rendered.head).toContain('[data-ant-layout-standalone]');
    expect(rendered.body).toContain('data-ant-layout-standalone=""');
  });
});
