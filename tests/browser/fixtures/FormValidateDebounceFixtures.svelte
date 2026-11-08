<script lang="ts">
  import {
    ConfigProvider, Form, FormItem, Input, createForm, FormValidationError
  } from 'antd-svelte';

  const model = createForm({ initialValues: { name: 'Alpha', other: 'Beta' } });
  let delay = $state(300);
  let shown = $state(true);
  let calls = $state<unknown[]>([]);
  let outcomes = $state<unknown[]>([]);

  function change(value: string) {
    model.setFieldValue('name', value);
    model.touchField('name');
  }

  async function validate(silent = false) {
    try {
      await model.validateFields({ validateOnly: silent });
      outcomes.push({ status: 'success' });
    } catch (error) {
      if (!(error instanceof FormValidationError)) throw error;

      outcomes.push({ status: 'invalid', outOfDate: error.outOfDate, errorFields: error.errorFields });
    }
  }
</script>

<section id="form-validate-debounce-fixture" aria-label="Form delayed validation">
  <button type="button" onclick={() => change('bad-first')}>Debounce first value</button>
  <button type="button" onclick={() => change('bad-old')}>Debounce old value</button>
  <button type="button" onclick={() => change('Good new')}>Debounce new value</button>
  <button type="button" onclick={() => validate()}>Debounce validate</button>
  <button type="button" onclick={() => validate(true)}>Debounce validate silently</button>
  <button type="button" onclick={() => model.submit((values) => {
    outcomes.push({ status: 'submitted', values });
  })}>Debounce submit</button>
  <button type="button" onclick={() => model.resetFields()}>Debounce reset</button>
  <button type="button" onclick={() => { shown = false; }}>Debounce remove</button>
  <button type="button" onclick={() => { shown = true; }}>Debounce restore</button>
  <button type="button" onclick={() => { delay = 10; }}>Debounce shorten</button>
  <button type="button" onclick={() => { delay = 0; }}>Debounce disable</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Form form={model}>
      {#if shown}
        <FormItem name="name" label="Name" validateDebounce={delay} rules={[{
          validator: (value) => {
            calls.push(value);
            return String(value).startsWith('bad') ? `Invalid ${value}` : undefined;
          }
        }]}>
          <Input value={model.values.name}
            onValueChange={(value) => model.setFieldValue('name', value)} />
        </FormItem>
      {/if}
    </Form>
  </ConfigProvider>
  <output aria-label="Debounce snapshot">{JSON.stringify({
    calls, outcomes, value: model.getFieldValue('name'), errors: model.getFieldError('name'),
    warnings: model.getFieldWarning('name'), touched: model.isFieldTouched('name'),
    validating: model.isFieldValidating('name')
  })}</output>
</section>
