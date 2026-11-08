import type {
  ConfigProviderProps, FormConfig, FormLocale, FormProps, FormRequiredMark, FormRequiredMarkInfo
} from 'antd-svelte';
import { enUS, ruRU } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-required-mark-reference.json';
import FormRequiredMarkFixtures from '../browser/fixtures/FormRequiredMarkFixtures.svelte';

describe('Form requiredMark public package', () => {
  it('pins source required classes, renderer input and component locale replacement', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'custom-colon')!.metrics.labels[0])
      .toMatchObject({ text: 'Required required', title: 'Required:', required: true });
    expect(reference.cases.find(({ sample }) => sample.id === 'locale-inherit')!.metrics.labels[1])
      .toMatchObject({ text: 'Optional(optional)' });
  });

  it('publishes modern marks and locale without changing native required during SSR', () => {
    const mark: FormRequiredMark = 'optional';
    const config: FormConfig = { requiredMark: mark };
    const provider: ConfigProviderProps['form'] = config;
    const props: Pick<FormProps<{ required: string }>, 'requiredMark'> = config;
    const locale: FormLocale = { optional: 'Optional field' };
    const info: FormRequiredMarkInfo = { required: true };
    const hidden = render(FormRequiredMarkFixtures, { props: { initialCase: 'hidden' } }).body;
    const optional = render(FormRequiredMarkFixtures, { props: { initialCase: 'optional-ru' } }).body;
    const custom = render(FormRequiredMarkFixtures, { props: { initialCase: 'custom-colon' } }).body;
    const empty = render(FormRequiredMarkFixtures, { props: { initialCase: 'empty-locale' } }).body;

    expect(provider).toBe(config);
    expect(props.requiredMark).toBe(mark);
    expect(info.required).toBe(true);
    expect(locale.optional).toBe('Optional field');
    expect(ruRU.Form.optional).toBe('(необязательно)');
    expect(enUS.Form.optional).toBe('(optional)');
    expect(hidden).toContain('ant-form-hide-required-mark');
    expect(hidden).toContain('ant-form-item-required-mark-hidden');
    expect(hidden).toMatch(/<input\b[^>]*\brequired(?:="")?[\s>]/);
    expect(optional).toContain('(необязательно)');
    expect(custom).toContain('data-custom-mark="required"');
    expect(custom).toContain(' required</b>');
    expect(empty).toContain('(optional)');
  });
});
