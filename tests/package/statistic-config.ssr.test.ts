import { type ConfigProviderProps, type StatisticConfig } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-statistic-config-reference.json';
import StatisticConfigFixtures from '../browser/fixtures/StatisticConfigFixtures.svelte';
import type { StatisticConfigSample } from '../browser/fixtures/statistic-config-cases';

describe('Statistic component config public package', () => {
  it('pins unmodified source slots, reactive roots and the known RTL direction observation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'classes-rtl')?.metrics.normal.direction)
      .toBe('ltr');
    expect(reference.transitions.map(({ sameRoot }) => sameRoot)).toEqual([true, true, true, true]);
  });

  it('publishes config callbacks with resolved defaults and readonly records', () => {
    const config: StatisticConfig = Object.freeze({
      class: 'configured', classNames: ({ props }) => ({ root: `${props.value}/${props.loading}` })
    });
    const props: Pick<ConfigProviderProps, 'statistic'> = { statistic: config };

    expect(props.statistic).toBe(config);
  });

  it('retains context and local classes without forwarding configuration to SSR elements', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'classes-ltr')!
      .sample as StatisticConfigSample;
    const body = render(StatisticConfigFixtures, { props: { sample } }).body;

    for (const name of ['ctx-host', 'ctx-root', 'local-host', 'local-root', 'local-root-extra']) {
      expect(body).toContain(name);
    }
    expect(body).not.toContain('statistic=');
    expect(body).not.toContain('classNames=');
  });

  it('resolves callback defaults without clocks while Timer still renders its SSR placeholder', () => {
    const defaults = reference.cases.find(({ sample }) => sample.id === 'default-props-ltr')!
      .sample as StatisticConfigSample;
    const timer = reference.cases.find(({ sample }) => sample.id === 'timer-ltr')!
      .sample as StatisticConfigSample;
    const first = render(StatisticConfigFixtures, { props: { sample: defaults } }).body;
    const second = render(StatisticConfigFixtures, { props: { sample: timer } }).body;

    expect(first).toContain('ctx-state-0-false-.,-root');
    expect(first).toContain('local-state-0-false-root');
    expect(second).toContain('ctx-state-2100000000000-false-.,-root');
    expect(second).toContain('>-<');
  });
});
