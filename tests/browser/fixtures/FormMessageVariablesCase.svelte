<script lang="ts">
  import { untrack } from 'svelte';
  import { Form, FormItem, Input, createForm } from 'antd-svelte';
  import {
    messageVariablesInitialValues, messageVariablesRule, type FormMessageVariablesSample
  } from './form-message-variables-cases';

  let { sample }: { sample: FormMessageVariablesSample } = $props();
  const model = createForm(untrack(() => ({ initialValues: messageVariablesInitialValues(sample) })));
  let name = $derived(sample.name ?? 'field');
  let rules = $derived([messageVariablesRule(sample)]);
  let label = $derived(Object.hasOwn(sample, 'label') ? sample.label : 'Field label');
  let report = $state('');
  let overrideLabel = $state(false);
  let variables = $derived(overrideLabel ? { label: 'Updated label' } : sample.variables);

  async function validate() {
    try { await model.validateFields(); } catch {}
    report = JSON.stringify(model.getFieldError(name));
  }
</script>

{#snippet richLabel()}<span>Rich label</span>{/snippet}

<Form form={model}>
  <FormItem {name} label={sample.rich ? richLabel : label}
    messageVariables={variables} {rules}>
    <Input value={String(model.getFieldValue(name))} aria-label="Message variable field" readonly />
  </FormItem>
</Form>
<button type="button" onclick={() => { void validate(); }}>Validate message variables</button>
<button type="button" onclick={() => { overrideLabel = !overrideLabel; }}>Toggle message label</button>
<output aria-label="Message variable report">{report}</output>
