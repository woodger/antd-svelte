<script lang="ts">
  import { untrack } from 'svelte';
  import { Form, FormItem, Input, createForm } from 'antd-svelte';
  import {
    formRuleFormatsRule, formRuleFormatsValue, type FormRuleFormatsSample
  } from './form-rule-formats-cases';

  let { sample }: { sample: FormRuleFormatsSample } = $props();
  const model = createForm(untrack(() => ({ initialValues: { field: formRuleFormatsValue(sample) } })));
  let rules = $derived([formRuleFormatsRule(sample)]);
  let outcome = $state('ready');

  async function validate() {
    try { await model.validateFields(); outcome = 'valid'; }
    catch { outcome = 'invalid'; }
  }
</script>

<Form form={model}>
  <FormItem name="field" label="Format field" {rules}>
    <Input value={String(model.values.field)} readonly />
  </FormItem>
</Form>
<button type="button" onclick={() => { void validate(); }}>Validate format field</button>
<output aria-label="Format validation">{outcome}</output>
<output aria-label="Format errors">{JSON.stringify(model.getFieldError('field'))}</output>
