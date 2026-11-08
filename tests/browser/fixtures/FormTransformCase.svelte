<script lang="ts">
  import { untrack } from 'svelte';
  import { Button, Form, FormItem, Input, createForm } from 'antd-svelte';
  import {
    formTransformRules, type FormTransformCall, type FormTransformSample
  } from './form-transform-cases';

  let { sample }: { sample: FormTransformSample } = $props();
  const model = createForm(untrack(() => ({ initialValues: { field: sample.value } })));
  let calls: FormTransformCall[] = $state.raw([]);
  let outcome = $state('ready');
  let submitted = $state('');
  let rules = $derived(formTransformRules(sample, call => { calls = [...calls, call]; }));

  async function validate() {
    try {
      await model.validateFields();
      outcome = 'valid';
    } catch { outcome = 'invalid'; }
  }
</script>

<Form form={model} onFinish={values => { submitted = JSON.stringify(values); }}>
  <FormItem name="field" label="Transformed field" {rules} validateFirst={sample.first}>
    <Input value={String(model.values.field ?? '')}
      onValueChange={value => model.setFieldValue('field', value)} />
  </FormItem>
  <Button htmlType="submit">Submit transformed field</Button>
</Form>
<button type="button" onclick={() => { void validate(); }}>Validate transformed field</button>
<button type="button" onclick={() => model.resetFields()}>Reset transformed field</button>
<output aria-label="Transform validation">{outcome}</output>
<output aria-label="Transform submission">{submitted}</output>
<output aria-label="Transform metadata">{JSON.stringify({
  errors: model.getFieldError('field'), warnings: model.getFieldWarning('field'),
  store: model.values.field ?? null, calls
})}</output>
