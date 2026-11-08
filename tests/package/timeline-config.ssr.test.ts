import { type ConfigProviderProps, type TimelineConfig } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-timeline-config-reference.json';
import TimelineConfigFixtures from '../browser/fixtures/TimelineConfigFixtures.svelte';
import type { TimelineConfigSample } from '../browser/fixtures/timeline-config-cases';

describe('Timeline component config public package', () => {
  it('pins unmodified source context/local/item priorities and reactive root identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(24);
    expect(reference.transitions.map(({ sameRoot }) => sameRoot)).toEqual([true, true, true, true]);
  });

  it('publishes readonly context configuration with Timeline callback props', () => {
    const context: TimelineConfig = Object.freeze({
      class: 'timeline-context', styles: ({ props }) => ({ root: props.reverse ? 'color:red' : '' })
    });
    const provider: Pick<ConfigProviderProps, 'timeline'> = { timeline: context };

    expect(provider.timeline).toBe(context);
  });

  it('merges context and local classes while retaining passive ol/li SSR semantics', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'classes-ltr')!
      .sample as TimelineConfigSample;
    const body = render(TimelineConfigFixtures, { props: { sample } }).body;

    for (const name of ['ctx-host', 'ctx-root', 'local-host', 'local-root', 'local-extra']) {
      expect(body).toContain(name);
    }
    expect(body).toContain('<ol');
    expect(body).toContain('<li');
    expect(body).not.toContain('timeline=');
    expect(body).not.toContain('classNames=');
  });

  it('resolves callback defaults with native reverse=false and transformed item count in SSR', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'callbacks-ltr')!
      .sample as TimelineConfigSample;
    const body = render(TimelineConfigFixtures, { props: { sample } }).body;

    expect(body).toContain('ctx-state-start-vertical-false-2-root');
    expect(body).toContain('local-state-start-vertical-false-root');
  });
});
