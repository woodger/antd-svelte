import { type StepsProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-steps-prefix-reference.json';
import StepsPrefixFixtures from '../browser/fixtures/StepsPrefixFixtures.svelte';
import type { StepsConfigSample } from '../browser/fixtures/steps-config-cases';

describe('Steps local prefix public package', () => {
  it('pins source variants, token layering and reactive root identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(30);
    expect(reference.transitions.map(({ sameRoot }) => sameRoot)).toEqual([true, true, true, true]);
  });

  it('publishes prefixCls while retaining native lists and the token namespace in SSR', () => {
    const props: Pick<StepsProps, 'prefixCls'> = { prefixCls: 'pathway' };
    const rendered = render(StepsPrefixFixtures);

    expect(props.prefixCls).toBe('pathway');
    expect(rendered.body).toContain('<ol');
    expect(rendered.body).toContain('pathway-item-title');
    expect(rendered.body).toContain('ant-steps-css-var');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('data-ant-svelte-theme="steps-prefix:pathway"');
  });

  it('restores the shared stylesheet for an empty prefix', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'empty-prefix-ltr')!
      .sample as StepsConfigSample;
    const rendered = render(StepsPrefixFixtures, { props: { sample } });

    expect(rendered.body).toContain('ant-steps-item-title');
    expect(rendered.head).not.toContain('data-ant-svelte-theme="steps-prefix:');
  });

  it('prefixes progress graphics without changing their accessible values', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'percent-ltr')!
      .sample as StepsConfigSample;
    const body = render(StepsPrefixFixtures, { props: { sample } }).body;

    expect(body).toContain('pathway-item-progress-icon-svg');
    expect(body).toContain('role="progressbar"');
    expect(body).toContain('aria-valuenow="75"');
  });
});
