import { type ConfigProviderProps, type LayoutConfig } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-layout-config-reference.json';
import LayoutConfigFixtures from '../browser/fixtures/LayoutConfigFixtures.svelte';
import type { LayoutConfigSample } from '../browser/fixtures/layout-config-cases';

describe('Layout component config public package', () => {
  it('pins source config, section exclusions and reactive root identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(22);
    expect(reference.transitions.map(({ sameRoot }) => sameRoot)).toEqual([true, true, true, true]);
    expect(reference.observations.shorthandRemoval.reused.paddingTop).toBe('0px');
    expect(reference.observations.shorthandRemoval.fresh.paddingTop).toBe('13px');
  });

  it('publishes readonly class/style config through ConfigProvider', () => {
    const config: LayoutConfig = Object.freeze({ class: 'configured-layout', style: 'padding:7px' });
    const provider: Pick<ConfigProviderProps, 'layout'> = { layout: config };

    expect(provider.layout).toBe(config);
  });

  it('keeps root priority and native sections without forwarding config attributes', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'local-class-ltr')!
      .sample as LayoutConfigSample;
    const body = render(LayoutConfigFixtures, { props: { sample } }).body;

    expect(body).toContain('ctx-host');
    expect(body).toContain('local-host');
    expect(body).toContain('local-extra');
    expect(body).toContain('<header');
    expect(body).toContain('<main');
    expect(body).toContain('<footer');
    expect(body).toContain('<aside');
    expect(body).not.toContain('layout=');
  });
});
