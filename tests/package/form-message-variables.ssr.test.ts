import { createForm, type FormItemProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-message-variables-reference.json';
import FormMessageVariablesFixtures from '../browser/fixtures/FormMessageVariablesFixtures.svelte';

describe('Form message variables public package', () => {
  it('pins source zero-label, prototype and object-child variable observations', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'zero-name')?.errors)
      .toEqual(['undefined/0']);
    expect(reference.cases.find(({ sample }) => sample.id === 'prototype-name')?.errors[0])
      .toContain('function Object');
    expect(reference.cases.find(({ sample }) => sample.id === 'object-child-context')?.errors)
      .toEqual(['Field label/field/99']);
  });

  it('publishes readonly variables without forwarding them to native SSR elements', () => {
    const props: Pick<FormItemProps, 'messageVariables'> = {
      messageVariables: Object.freeze({ label: 'Custom' })
    };
    const body = render(FormMessageVariablesFixtures).body;

    expect(props.messageVariables?.label).toBe('Custom');
    expect(body).not.toContain('messageVariables=');
    expect(body).not.toContain('ant-form-item-explain-error');
  });

  it('formats standalone model message names while preserving native default messages', async () => {
    const form = createForm({ initialValues: { name: '' }, rules: { name: [
      { required: true }, { required: true, message: '${name}' }
    ] } });

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ errors: ['Заполните это поле.', 'name'] }]
    });
  });
});
