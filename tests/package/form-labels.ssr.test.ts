import type { ConfigProviderProps, FormConfig, FormItemProps, FormProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-labels-reference.json';
import FormLabelsFixtures from '../browser/fixtures/FormLabelsFixtures.svelte';

describe('Form labels public package', () => {
  it('pins source config replacement, field precedence, RTL and trailing punctuation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'config-reset-ltr')!.metrics)
      .toMatchObject({ text: 'Name', noColon: false, left: false, wrap: false });
    expect(reference.cases.find(({ sample }) => sample.id === 'item-priority-ltr')!.metrics)
      .toMatchObject({ noColon: false, left: false, wrap: true });
  });

  it('publishes label defaults and renders inherited settings without browser work', () => {
    const defaults: FormConfig = { colon: false, labelAlign: 'left', labelWrap: true };
    const provider: ConfigProviderProps['form'] = defaults;
    const form: Pick<FormProps<{ name: string }>, keyof FormConfig> = defaults;
    const field: Pick<FormItemProps, 'colon' | 'labelAlign'> = { colon: true, labelAlign: 'right' };
    const inherited = render(FormLabelsFixtures, { props: { initialCase: 'config-inherit-ltr' } }).body;
    const reset = render(FormLabelsFixtures, { props: { initialCase: 'config-reset-ltr' } }).body;

    expect(provider).toBe(defaults);
    expect(form.labelWrap).toBe(true);
    expect(field.colon).toBe(true);
    expect(inherited).toContain('ant-form-item-no-colon');
    expect(inherited).toContain('ant-form-item-label-left');
    expect(inherited).toContain('ant-form-item-label-wrap');
    expect(reset).not.toContain('ant-form-item-no-colon');
    expect(reset).not.toContain('ant-form-item-label-left');
    expect(reset).not.toContain('ant-form-item-label-wrap');
  });
});
