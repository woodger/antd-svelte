import {
  createForm, type FormConfig, type FormProps, type FormLocale, type ValidateMessages
} from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-validate-messages-reference.json';
import FormValidateMessagesFixtures from '../browser/fixtures/FormValidateMessagesFixtures.svelte';

describe('Form validateMessages public package', () => {
  it('pins source templates, function arguments and the two source diagnostic failures', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'function-range')?.functionCalls)
      .toEqual([['field', '4', '8']]);
    expect(reference.diagnostics.map(({ sample }) => sample))
      .toEqual(['function-throws', 'function-throws', 'undefined-template', 'undefined-template']);
  });

  it('publishes Form, ConfigProvider and locale templates without forwarding config to SSR elements', () => {
    const messages: ValidateMessages = Object.freeze({
      required: () => 'Required ${label}', number: Object.freeze({ range: '${min}/${max}' })
    });
    const form: Pick<FormProps<{ field: string }>, 'validateMessages'> = { validateMessages: messages };
    const config: FormConfig = { validateMessages: messages };
    const locale: FormLocale = { defaultValidateMessages: messages };
    const body = render(FormValidateMessagesFixtures).body;

    expect(form.validateMessages).toBe(messages);
    expect(config.validateMessages).toBe(messages);
    expect(locale.defaultValidateMessages).toBe(messages);
    expect(body).not.toContain('validateMessages=');
    expect(body).not.toContain('ant-form-item-explain-error');
  });

  it('retains native Russian defaults for standalone model validation without a mounted Form', async () => {
    const form = createForm({ initialValues: { field: '' }, rules: { field: [{ required: true }] } });

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ errors: ['Заполните это поле.'] }]
    });
  });
});
