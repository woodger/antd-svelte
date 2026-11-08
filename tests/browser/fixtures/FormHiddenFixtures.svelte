<script lang="ts">
  import { tick, untrack } from 'svelte';
  import {
    Form, FormItem, Input, createForm, FormValidationError,
    type FormProps, type FieldError
  } from 'antd-svelte';

  let { initialHidden = false }: { initialHidden?: boolean } = $props();
  const form = createForm({ initialValues: { concealed: 'Alpha', sibling: 'Beta' } });
  let hidden = $state(untrack(() => initialHidden));
  let layout = $state<FormProps<typeof form.values>['layout']>('vertical');
  let control = $state<HTMLInputElement>();
  let sibling = $state<HTMLInputElement>();
  let local = $state<HTMLInputElement>();
  let host = $state<HTMLElement>();
  let previousInput: HTMLInputElement | undefined;
  let previousRef: unknown;
  let snapshot = $state('');
  let failed = $state<readonly FieldError[]>([]);
  let submitted = $state(0);

  async function inspect(id: string, outcome?: unknown) {
    await tick();
    const element = control;
    const item = element?.closest('.ant-form-item');
    const ref = form.getFieldInstance('concealed');
    const nativeForm = host?.querySelector('form');
    const active = element?.ownerDocument.activeElement;
    snapshot = JSON.stringify({
      id, hidden, display: item ? getComputedStyle(item).display : null,
      retained: previousInput ? element === previousInput : null,
      stableRef: previousRef ? ref === previousRef : null,
      sameRef: ref === element, instance: ref != null, local: local?.value,
      value: element?.value, values: form.getFieldsValue(true),
      field: form.getFieldsError(['concealed'])[0], touched: form.isFieldTouched('concealed'),
      formData: nativeForm ? Object.fromEntries(new FormData(nativeForm)) : null,
      active: active === sibling ? 'sibling' : active === element ? 'concealed' : null,
      ...(outcome ? { outcome } : {})
    });
    previousInput = element;
    previousRef = ref;
  }

  function seed() {
    form.setFields([{
      name: 'concealed', value: 'Changed', errors: ['Concealed error'],
      warnings: ['Concealed note'], touched: true
    }]);
    if (local) local.value = 'Scratch';
    sibling?.focus();
    void inspect('seeded');
  }

  async function conceal() {
    hidden = true;
    await tick();
    form.focusField('concealed');
    await inspect('hidden');
  }

  async function validateHidden() {
    hidden = true;
    form.setFields([{
      name: 'concealed', value: '', errors: [], warnings: [], touched: true
    }]);
    let outcome: unknown = { status: 'success' };
    try {
      await form.validateFields(['concealed']);
    } catch (error) {
      if (!(error instanceof FormValidationError)) throw error;
      outcome = { status: 'invalid', outOfDate: error.outOfDate, errorFields: error.errorFields };
    }
    await inspect('hidden-invalid', outcome);
  }

  async function revealInvalid() {
    hidden = false;
    await tick();
    form.focusField('concealed');
    await inspect('revealed-invalid');
  }
</script>

<section bind:this={host} id="form-hidden-fixture" aria-label="Form hidden fields">
  <button type="button" onclick={() => inspect('initial')}>Inspect hidden field</button>
  <button type="button" onclick={seed}>Seed hidden field</button>
  <button type="button" onclick={conceal}>Conceal field</button>
  <button type="button" onclick={() => {
    form.resetFields(['concealed']);
    void inspect('reset-hidden');
  }}>Reset hidden field</button>
  <button type="button" onclick={() => { hidden = false; void inspect('shown'); }}>Show hidden field</button>
  <button type="button" onclick={validateHidden}>Validate hidden field</button>
  <button type="button" onclick={revealInvalid}>Reveal invalid field</button>
  <label>Hidden layout
    <select bind:value={layout}>
      {#each ['vertical', 'horizontal', 'inline'] as value}<option {value}>{value}</option>{/each}
    </select>
  </label>
  <button type="button">Before hidden controls</button>
  <Form {form} {layout} onFinish={() => { submitted++; }} onFinishFailed={(error) => {
    failed = error.errorFields;
  }}>
    <FormItem name="concealed" label="Concealed" {hidden} controlRef={control}
      rules={[{ required: true, message: 'Concealed required' }]}>
      <Input bind:inputElement={control} value={form.values.concealed}
        onValueChange={(value) => form.setFieldValue('concealed', value)} />
      <input bind:this={local} aria-label="Local draft" value="Local" />
    </FormItem>
    <FormItem name="sibling" label="Sibling">
      <Input bind:inputElement={sibling} value={form.values.sibling}
        onValueChange={(value) => form.setFieldValue('sibling', value)} />
    </FormItem>
  </Form>
  <output aria-label="Hidden snapshot">{snapshot}</output>
  <output aria-label="Hidden submission errors">{JSON.stringify(failed)}</output>
  <output aria-label="Hidden submissions">{submitted}</output>
</section>
