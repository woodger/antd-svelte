<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Form, FormItem, Input, createForm } from 'antd-svelte';
  import {
    buildValidationMessages, buildMessagesRule, type FormValidateMessagesSample
  } from './form-validate-messages-cases';

  let { sample }: { sample: FormValidateMessagesSample } = $props();
  const form = createForm(untrack(() => ({ initialValues: { field: sample.value } })));
  const functionCalls: string[][] = [];
  let localOverride = $state(false);
  let messages = $derived(buildValidationMessages(localOverride
    ? { required: 'Updated local ${label}' } : sample.local, functionCalls));
  let config = $derived(sample.outer
    ? { validateMessages: buildValidationMessages(sample.outer, functionCalls) } : undefined);
  let innerLocale = $derived(sample.inner?.locale ? {
    Form: { defaultValidateMessages: buildValidationMessages(
      sample.inner.locale.Form?.defaultValidateMessages, functionCalls
    ) }
  } : undefined);
  let rules = $derived([buildMessagesRule(sample.rule)]);
  let report = $state('');

  async function validate() {
    functionCalls.length = 0;
    const valid = await form.validateFields().then(() => true, () => false);
    report = JSON.stringify({
      valid, errors: form.getFieldError('field'), warnings: form.getFieldWarning('field'), functionCalls
    });
  }
</script>

<section data-message-case={sample.id}>
  <ConfigProvider form={config}>
    <ConfigProvider form={sample.inner?.form} locale={innerLocale}>
      <Form {form} validateMessages={messages}>
        <FormItem name="field" label="Field label" messageVariables={sample.variables} {rules}>
          <Input value={String(form.getFieldValue('field'))} aria-label="Template field" readonly />
        </FormItem>
      </Form>
    </ConfigProvider>
  </ConfigProvider>
  <button type="button" onclick={() => { void validate(); }}>Validate templates</button>
  <button type="button" onclick={() => { localOverride = !localOverride; }}>Toggle local templates</button>
  <output aria-label="Template report">{report}</output>
</section>
