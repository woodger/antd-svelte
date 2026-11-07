<script lang="ts">
  import {
    Form, FormItem, FormValidationError, Input, createForm,
    type NamePath, type FormValidateOptions
  } from 'antd-svelte';

  const form = createForm({ initialValues: {
    user: { name: 'Anna' }, 'user.name': 'Literal', rows: [{ name: 'Row' }], bare: 'Value'
  } });
  const definitions: { name: NamePath; label: string }[] = [
    { name: ['user', 'name'], label: 'Nested' }, { name: 'user.name', label: 'Literal' },
    { name: ['rows', 0, 'name'], label: 'Numeric' },
    { name: ['rows', '0', 'name'], label: 'String' }
  ];
  let shown = $state(true);
  let pending = $state<{ id: number; complete(): void }[]>([]);
  let finished = $state<number[]>([]);
  let request = 0;
  let nextPending = 0;
  let during = $state('');

  function hold() {
    return new Promise<void>((complete) => { pending.push({ id: nextPending++, complete }); });
  }

  async function validate(name: NamePath, options?: FormValidateOptions) {
    const id = request++;
    try {
      await form.validateFields([name], options);
    } catch (error) {
      if (!(error instanceof FormValidationError)) throw error;
    }
    finished.push(id);
  }

  function complete(id: number) {
    pending.find((entry) => entry.id === id)?.complete();
    pending = pending.filter((entry) => entry.id !== id);
  }

  function snapshot() {
    return {
      any: form.isFieldsValidating(), empty: form.isFieldsValidating([]),
      root: form.isFieldsValidating([[]]), parent: form.isFieldsValidating([['user']]),
      nested: form.isFieldsValidating([['user', 'name']]), literal: form.isFieldsValidating(['user.name']),
      rows: form.isFieldsValidating(['rows']), numericParent: form.isFieldsValidating([['rows', 0]]),
      numeric: form.isFieldsValidating([['rows', 0, 'name']]),
      string: form.isFieldsValidating([['rows', '0', 'name']]),
      pair: form.isFieldsValidating([['user', 'name'], 'user.name']),
      bare: form.isFieldsValidating(['bare']), missing: form.isFieldsValidating(['missing'])
    };
  }

  async function checkRuleless() {
    const validation = form.validateFields(['bare']);
    during = JSON.stringify(snapshot());
    await validation;
  }
</script>

<section id="form-validating-aggregate-fixture" aria-label="Form validating aggregate">
  <Form {form}>
    {#each definitions as field (field.label)}
      {#if field.label !== 'Nested' || shown}
        <FormItem name={field.name} label={field.label} rules={[{ validator: hold }]}>
          <Input value={String(form.getFieldValue(field.name) ?? '')} />
        </FormItem>
      {/if}
    {/each}
    <FormItem name="bare" label="Bare"><Input value={form.values.bare} /></FormItem>
  </Form>
  <button onclick={() => validate(['user', 'name'])}>Validate nested aggregate</button>
  <button onclick={() => validate('user.name', { validateOnly: true })}>Validate literal silently</button>
  <button onclick={() => validate(['rows', 0, 'name'])}>Validate numeric aggregate</button>
  <button onclick={() => validate(['rows', '0', 'name'])}>Validate string aggregate</button>
  <button onclick={() => form.resetFields()}>Reset validating aggregate</button>
  <button onclick={() => { shown = false; }}>Remove nested aggregate</button>
  <button onclick={checkRuleless}>Check bare aggregate</button>
  {#each pending as entry (entry.id)}
    <button onclick={() => complete(entry.id)}>Complete aggregate {entry.id}</button>
  {/each}
  <output aria-label="Validating snapshot">{JSON.stringify(snapshot())}</output>
  <output aria-label="Validating single">{JSON.stringify({
    parent: form.isFieldValidating('user'), nested: form.isFieldValidating(['user', 'name'])
  })}</output>
  <output aria-label="Aggregate pending">{JSON.stringify(pending.map(({ id }) => id))}</output>
  <output aria-label="Aggregate finished">{JSON.stringify(finished)}</output>
  <output aria-label="Bare during">{during}</output>
</section>
