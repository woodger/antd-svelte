<script lang="ts">
  import { untrack } from 'svelte';
  import { Form, FormItem, Input, createForm } from 'antd-svelte';
  import {
    nestedRule, nestedRuleValue, createNestedRuleController, type NestedRuleSample
  } from './form-nested-rules-cases';

  let { sample }: { sample: NestedRuleSample } = $props();
  const model = createForm(untrack(() => ({ initialValues: { field: nestedRuleValue(sample) } })));
  let pending = $state(0);
  const controller = createNestedRuleController(count => { pending = count; });
  let rules = $derived([nestedRule(sample.rule, controller)]);
  let report = $state('');

  async function validate() {
    let valid = true;
    try { await model.validateFields(); } catch { valid = false; }
    report = JSON.stringify({
      valid, errors: model.getFieldError('field'), warnings: model.getFieldWarning('field'),
      validating: model.isFieldValidating('field')
    });
  }
</script>

<Form form={model}>
  <FormItem name="field" label="Nested rule field" {rules}>
    <Input value={String(model.values.field)} readonly />
  </FormItem>
</Form>
<button type="button" onclick={() => { void validate(); }}>Validate nested rule</button>
<button type="button" onclick={() => controller.release()}>Release nested rule</button>
<output aria-label="Nested rule pending">{pending}</output>
<output aria-label="Nested rule report">{report}</output>
