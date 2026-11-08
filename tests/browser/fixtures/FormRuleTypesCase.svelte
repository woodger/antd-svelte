<script lang="ts">
  import { untrack } from 'svelte';
  import { Form, FormItem, Input, createForm } from 'antd-svelte';
  import {
    formRuleTypesRule, formRuleTypesValue, type FormRuleTypesSample
  } from './form-rule-types-cases';

  let { sample }: { sample: FormRuleTypesSample } = $props();
  const model = createForm(untrack(() => ({
    initialValues: { field: formRuleTypesValue(sample.kind) }
  })));
  let rules = $derived([formRuleTypesRule(sample)]);
  let outcome = $state('ready');

  async function validate() {
    try { await model.validateFields(); outcome = 'valid'; }
    catch { outcome = 'invalid'; }
  }
</script>

<Form form={model}>
  <FormItem name="field" label="Typed field" {rules}>
    <Input value={String(model.values.field)} readonly />
  </FormItem>
</Form>
<button type="button" onclick={() => { void validate(); }}>Validate typed field</button>
<output aria-label="Typed validation">{outcome}</output>
<output aria-label="Typed errors">{JSON.stringify(model.getFieldError('field'))}</output>
