<script lang="ts">
  import { tick } from 'svelte';
  import {
    Form, FormItem, Input, createForm, FormValidationError,
    type FieldError, type ValidationRule
  } from 'antd-svelte';

  interface RuleSpec {
    id: string;
    warning?: boolean;
  }

  interface Outcome {
    status: 'success' | 'invalid';
    outOfDate?: boolean;
    errorFields?: readonly FieldError[];
  }

  const scenarios = [
    'default', 'all', 'serial', 'serial-pass', 'serial-warning-sort', 'serial-warning',
    'parallel', 'parallel-pass', 'parallel-warning-early', 'parallel-warning-pass',
    'parallel-error-early', 'parallel-warnings'
  ];
  let form = $state(createForm({ initialValues: { name: 'Anna' } }));
  let mode = $state<boolean | 'parallel'>();
  let specs = $state<RuleSpec[]>([]);
  let calls = $state<string[]>([]);
  let outcomes = $state<Outcome[]>([]);
  let visible = $state(true);
  let pendingCount = $state(0);
  let submitted = $state<string[]>([]);
  const pending = new Map<string, (message?: string) => void>();
  let rules = $derived<ValidationRule[]>(specs.map((spec) => ({
    warningOnly: spec.warning,
    validator: () => {
      calls.push(spec.id);
      return new Promise<string | void>((resolve) => {
        pending.set(spec.id, (message) => {
          pending.delete(spec.id);
          pendingCount = pending.size;
          resolve(message);
        });
        pendingCount = pending.size;
      });
    }
  })));

  async function prepare(id: string) {
    form = createForm({ initialValues: { name: 'Anna' } });
    mode = id === 'default' ? undefined : id === 'all' ? false
      : id.startsWith('serial') ? true : 'parallel';
    const warning = { id: 'warning', warning: true };
    const first = { id: 'first' };
    const second = { id: 'second' };
    specs = id === 'all' || id === 'serial-warning-sort' ? [warning, first, second]
      : id === 'serial-warning' || id.startsWith('parallel-warning-')
        || id === 'parallel-error-early' ? [warning, first]
      : id === 'parallel-warnings' ? [warning, { id: 'warning2', warning: true }]
      : [first, second];
    calls = [];
    outcomes = [];
    pending.clear();
    pendingCount = 0;
    visible = true;
    await tick();
    void validate();
  }

  async function validate(silent = false) {
    try {
      await form.validateFields({ validateOnly: silent });
      outcomes.push({ status: 'success' });
    } catch (error) {
      if (!(error instanceof FormValidationError)) throw error;
      outcomes.push({ status: 'invalid', outOfDate: error.outOfDate, errorFields: error.errorFields });
    }
  }

  function complete(id: string, success = false) {
    const message = id === 'first' ? 'First' : id === 'second' ? 'Second'
      : id === 'warning' ? 'Warning' : 'Second warning';
    pending.get(id)?.(success ? undefined : message);
  }

  function completeAll() {
    for (const id of pending.keys()) complete(id);
  }

  async function submit() {
    const result = await form.submit((values) => { submitted.push(values.name); });
    outcomes.push(result.status === 'invalid' ? {
      status: 'invalid', outOfDate: result.error.outOfDate, errorFields: result.error.errorFields
    } : { status: 'success' });
  }

  function snapshot() {
    return {
      mode: mode ?? null, calls, outcomes, fields: form.getFieldsError(),
      validating: form.isFieldValidating('name')
    };
  }
</script>

<section id="form-validate-first-fixture" aria-label="Form validateFirst">
  {#each scenarios as id}
    <button type="button" onclick={() => prepare(id)}>Start {id}</button>
  {/each}
  {#each ['first', 'second', 'warning', 'warning2'] as id}
    <button type="button" onclick={() => complete(id)}>Fail {id}</button>
    <button type="button" onclick={() => complete(id, true)}>Pass {id}</button>
  {/each}
  <button type="button" onclick={() => validate()}>Validate first rules</button>
  <button type="button" onclick={() => validate(true)}>Validate first silently</button>
  <button type="button" onclick={submit}>Submit first rules</button>
  <button type="button" onclick={completeAll}>Complete first rules</button>
  <button type="button" onclick={() => { mode = false; }}>Use all rules</button>
  <button type="button" onclick={() => { mode = true; }}>Use serial rules</button>
  <button type="button" onclick={() => { mode = 'parallel'; }}>Use parallel rules</button>
  <button type="button" onclick={() => { form.resetFields(['name']); }}>Reset first field</button>
  <button type="button" onclick={() => { visible = !visible; }}>Toggle first field</button>
  <button type="button" onclick={() => { form.setFieldValue('name', 'New'); }}>Change first value</button>
  <button type="button" onclick={() => {
    form.setFields([{ name: 'name', errors: ['Visible'], warnings: ['Note'], touched: true }]);
  }}>Seed first metadata</button>

  <Form {form}>
    {#if visible}
      <FormItem name="name" label="Name" {rules} validateFirst={mode}>
        <Input value={form.values.name}
          onValueChange={(value) => form.setFieldValue('name', value)} />
      </FormItem>
    {/if}
  </Form>
  <output aria-label="First snapshot">{JSON.stringify(snapshot())}</output>
  <output aria-label="First pending">{pendingCount}</output>
  <output aria-label="First submitted">{JSON.stringify(submitted)}</output>
</section>
