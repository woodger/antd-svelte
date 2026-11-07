<script lang="ts">
  import { Button, Form, FormItem, Input, createForm, type FieldError } from 'antd-svelte';
  import FormValuesView from './FormValuesView.svelte';

  const form = createForm({
    initialValues: {
      user: { name: 'Anna', role: 'developer' },
      rows: [{ title: 'First' }, { title: 'Second' }],
      'user.name': 'Literal'
    },
    rules: { 'user.name': [{ required: true, message: 'Literal required' }] }
  });
  const values = form.values;
  const dynamic = createForm({
    initialValues: { first: '', second: 'Ready' },
    rules: { first: [{ required: true, message: 'First required' }] }
  });
  let second = $state(false);
  let errors = $state<readonly FieldError[]>([]);
  let outOfDate = $state(false);
  let failure = $state('');
  let submitted = $state('');
  let show = $state(true);
  let showLiteral = $state(true);
  let alternate = $state(false);
  let asyncValidation = $state(false);
  let pending: ((message: string) => void)[] = [];
  let validationCount = $state(0);
  let observedError = $state('');

  function validateTitle(value: unknown) {
    if (!asyncValidation) return;

    return new Promise<string>((resolve) => {
      pending.push(resolve);
      validationCount = pending.length;
      observedError = String(value);
    });
  }

  function completeValidation() {
    const validations = pending;
    pending = [];
    validationCount = 0;
    for (const complete of validations) complete('Title rejected');
  }
</script>

<section id="form-paths-fixture" aria-label="Nested form">
  <Form
    id="form-paths-model"
    {form}
    onFinish={(values) => { submitted = JSON.stringify(values); }}
    onError={(error) => { failure = String(error); }}
    onFinishFailed={(error) => {
      errors = error.errorFields;
      outOfDate = error.outOfDate;
    }}
  >
    <FormItem name={['user', 'name']} label="Nested name" rules={[{ required: true }]}>
      <Input
        value={form.values.user.name}
        onValueChange={(value) => form.setFieldValue(['user', 'name'], value)}
      />
    </FormItem>
    {#if showLiteral}<FormItem name="user.name" label="Literal name">
      <Input
        value={form.getFieldValue('user.name')}
        onValueChange={(value) => form.setFieldValue('user.name', value)}
      />
    </FormItem>{/if}
    {#if show}
      <FormItem
        name={['rows', alternate ? 1 : 0, 'title']}
        label="Row title"
        rules={[
          { required: true, message: 'Title required' },
          { validator: validateTitle }
        ]}
      >
        <Input
          value={form.values.rows[alternate ? 1 : 0]?.title ?? ''}
          onValueChange={(value) => form.setFieldValue(['rows', alternate ? 1 : 0, 'title'], value)}
        />
      </FormItem>
    {/if}
    <Button htmlType="submit">Submit nested form</Button>
    <Button htmlType="reset">Reset nested form</Button>
  </Form>
  <button onclick={() => form.setFieldValue(['user', 'name'], 'Alice')}>Set nested name</button>
  <button onclick={() => form.setFieldsValue({
    user: { role: 'reviewer' }, rows: [{ title: 'Replacement' }]
  })}>Merge nested values</button>
  <button onclick={() => {
    form.setFieldValue(['numeric', 0, 'title'], 'Array row');
    form.setFieldValue(['stringNumeric', '0', 'title'], 'Object row');
  }}>Create numeric paths</button>
  <button onclick={() => {
    form.setFieldValue(['__proto__', 'formStorePolluted'], true);
    form.setFieldValue(['constructor', 'prototype', 'polluted'], true);
  }}>Create reserved paths</button>
  <button onclick={() => { alternate = !alternate; }}>Change field path</button>
  <button onclick={() => { show = !show; }}>Toggle row field</button>
  <button onclick={() => { showLiteral = !showLiteral; }}>Toggle literal field</button>
  <label><input type="checkbox" bind:checked={asyncValidation} /> Hold title validation</label>
  <button onclick={completeValidation}>Reject pending title</button>
  <output aria-label="Nested values">{JSON.stringify(form.values)}</output>
  <FormValuesView {values} />
  <output aria-label="Nested errors">{JSON.stringify(errors)}</output>
  <output aria-label="Validation out of date">{String(outOfDate)}</output>
  <output aria-label="Submission failure">{failure}</output>
  <output aria-label="Submitted nested values">{submitted}</output>
  <output aria-label="Title touched">{String(form.isFieldTouched(['rows', 0, 'title']))}</output>
  <output aria-label="Pending title validations">{validationCount}</output>
  <output aria-label="Validated title">{observedError}</output>
  <Form form={dynamic}>
    <FormItem name={second ? 'second' : 'first'} label="Dynamic model field">
      <Input
        value={dynamic.values[second ? 'second' : 'first']}
        onValueChange={(value) => dynamic.setFieldValue(second ? 'second' : 'first', value)}
      />
    </FormItem>
  </Form>
  <button onclick={() => { second = !second; }}>Switch model field</button>
  <output aria-label="First model errors">{JSON.stringify(dynamic.getFieldError('first'))}</output>
</section>
