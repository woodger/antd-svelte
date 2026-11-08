<script lang="ts">
  import { untrack } from 'svelte';
  import { Form, FormItem, Input, createForm, type FormInstance, type FormValues } from 'antd-svelte';
  import { formRuleFactoriesRules, type FormRuleFactoriesSample } from './form-rule-factories-cases';

  let { sample }: { sample: FormRuleFactoriesSample } = $props();
  const model = createForm(untrack(() => ({ initialValues: {
    field: sample.value, enabled: sample.enabled, minimum: sample.minimum,
    other: sample.other, choices: [0, false, 'abc']
  } })));
  let received: FormInstance<FormValues> | undefined;
  let rules = $derived(formRuleFactoriesRules(sample, form => { received = form; }));
  let report = $state('');

  async function validate() {
    let valid = true;
    try { await model.validateFields(); } catch { valid = false; }
    report = JSON.stringify({
      valid, errors: model.getFieldError('field'), warnings: model.getFieldWarning('field'),
      store: model.values.field,
      factory: {
        sameInstance: received === model,
        hasGetFieldValue: typeof received?.getFieldValue === 'function',
        hasValidateFields: typeof received?.validateFields === 'function',
        hasScrollToField: typeof received?.scrollToField === 'function',
        minimum: received?.getFieldValue('minimum')
      }
    });
  }
</script>

<Form form={model}>
  <FormItem name="field" label="Factory field" {rules} validateFirst={sample.first}>
    <Input value={String(model.values.field)} readonly />
  </FormItem>
</Form>
<button type="button" onclick={() => { void validate(); }}>Validate factory field</button>
<button type="button" onclick={() => model.setFieldsValue({ minimum: 3 })}>Increase factory minimum</button>
<output aria-label="Factory report">{report}</output>
