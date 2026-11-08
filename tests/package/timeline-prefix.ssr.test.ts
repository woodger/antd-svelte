import { type TimelineProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-timeline-prefix-reference.json';
import TimelinePrefixFixtures from '../browser/fixtures/TimelinePrefixFixtures.svelte';
import type { TimelineConfigSample } from '../browser/fixtures/timeline-config-cases';

describe('Timeline local prefix public package', () => {
  it('pins source prefixes, responsive boundaries and reactive root identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(28);
    expect(reference.transitions.map(({ sameRoot }) => sameRoot)).toEqual([true, true, true, true]);
  });

  it('publishes prefixCls and preserves Steps namespace with local Timeline classes in SSR', () => {
    const props: Pick<TimelineProps, 'prefixCls'> = { prefixCls: 'history' };
    const rendered = render(TimelinePrefixFixtures);

    expect(props.prefixCls).toBe('history');
    expect(rendered.body).toContain('ant-steps');
    expect(rendered.body).toContain('history-item-color-green');
    expect(rendered.body).toContain('history-item-title');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('data-ant-svelte-theme="timeline-prefix:history"');
  });

  it('restores the shared stylesheet for an empty prefix', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'empty-prefix-ltr')!
      .sample as TimelineConfigSample;
    const rendered = render(TimelinePrefixFixtures, { props: { sample } });

    expect(rendered.body).toContain('ant-timeline-item-title');
    expect(rendered.head).not.toContain('data-ant-svelte-theme="timeline-prefix:');
  });
});
