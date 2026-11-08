import { type StatisticProps, type StatisticTimerProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-statistic-prefix-reference.json';
import StatisticPrefixFixtures from '../browser/fixtures/StatisticPrefixFixtures.svelte';
import type { StatisticConfigSample } from '../browser/fixtures/statistic-config-cases';

describe('Statistic local prefix public package', () => {
  it('pins source normal/loading/Timer themes and reactive root identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(22);
    expect(reference.transitions.map(({ sameRoot }) => sameRoot)).toEqual([true, true, true, true]);
  });

  it('publishes prefix on Statistic and Timer without forwarding it to native elements', () => {
    const props: Pick<StatisticProps, 'prefixCls'> = { prefixCls: 'metric' };
    const timer: Pick<StatisticTimerProps, 'prefixCls' | 'type'> = {
      prefixCls: props.prefixCls, type: 'countup'
    };
    const rendered = render(StatisticPrefixFixtures);

    expect(timer.prefixCls).toBe('metric');
    expect(rendered.body).toContain('class="metric ant-statistic-css-var');
    expect(rendered.body).toContain('metric-content-value-int');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('data-ant-svelte-theme="statistic-prefix:metric"');
  });

  it('uses the shared default stylesheet for an empty prefix', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'empty-prefix-ltr')!
      .sample as StatisticConfigSample;
    const rendered = render(StatisticPrefixFixtures, { props: { sample } });

    expect(rendered.body).toContain('class="ant-statistic ant-statistic-css-var');
    expect(rendered.head).not.toContain('data-ant-svelte-theme="statistic-prefix:');
  });
});
