import { type ConfigProviderProps, type StepsConfig } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-steps-config-reference.json';
import StepsConfigFixtures from '../browser/fixtures/StepsConfigFixtures.svelte';
import type { StepsConfigSample } from '../browser/fixtures/steps-config-cases';

describe('Steps component config public package', () => {
  it('pins source slots, composition exclusions and reactive root identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(36);
    expect(reference.transitions.map(({ sameRoot }) => sameRoot)).toEqual([true, true, true, true]);
  });

  it('publishes readonly config with typed Steps callbacks', () => {
    const context: StepsConfig = Object.freeze({
      class: 'configured-steps', styles: ({ props }) => ({ root: props.current ? 'color:red' : '' })
    });
    const provider: Pick<ConfigProviderProps, 'steps'> = { steps: context };

    expect(provider.steps).toBe(context);
  });

  it('retains context and local classes in native list SSR without forwarding config attributes', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'classes-ltr')!
      .sample as StepsConfigSample;
    const body = render(StepsConfigFixtures, { props: { sample } }).body;

    for (const name of ['ctx-host', 'ctx-root', 'local-host', 'local-root', 'local-extra']) {
      expect(body).toContain(name);
    }
    expect(body).toContain('<ol');
    expect(body).not.toContain('steps=');
    expect(body).not.toContain('classNames=');
  });

  it('does not invoke Steps semantic callbacks in Timeline composition while keeping class and plain style', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'timeline-callbacks-ltr')!
      .sample as StepsConfigSample;
    const body = render(StepsConfigFixtures, { props: { sample } }).body;

    expect(body).toContain('ant-timeline');
    expect(body).toContain('ctx-host');
    expect(body).toContain('padding:6px');
    expect(body).not.toContain('ctx-state');
  });
});
