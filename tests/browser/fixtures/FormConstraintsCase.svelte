<script lang="ts">
  import { untrack } from 'svelte';
  import { Form, FormItem, Input, createForm } from 'antd-svelte';
  import { formConstraintsRule, type FormConstraintsSample } from './form-constraints-cases';

  let { sample }: { sample: FormConstraintsSample } = $props();
  const model = createForm(untrack(() => ({ initialValues: { field: sample.value } })));
  let rules = $derived([formConstraintsRule(sample)]);
  let outcome = $state('ready');

  async function validate() {
    try { await model.validateFields(); outcome = 'valid'; }
    catch { outcome = 'invalid'; }
  }
</script>

<Form form={model}>
  <FormItem name="field" label="Constrained field" {rules}>
    <Input value={String(model.values.field ?? '')}
      onValueChange={value => model.setFieldValue('field', value)} />
  </FormItem>
</Form>
<button type="button" onclick={() => { void validate(); }}>Validate constrained field</button>
<button type="button" onclick={() => model.resetFields()}>Reset constrained field</button>
<output aria-label="Constraint result">{outcome}</output>
<output aria-label="Constraint metadata">{JSON.stringify({
  errors: model.getFieldError('field'), warnings: model.getFieldWarning('field'), store: model.values.field
})}</output>
