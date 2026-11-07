<script lang="ts">
  import {
    Form, FormItem, FormValidationError, Input, createForm,
    type FieldError, type FormValidateOptions, type NamePath
  } from 'antd-svelte';

  interface Outcome {
    id: number;
    result: { status: 'success' | 'invalid'; outOfDate?: boolean; errorFields?: readonly FieldError[] };
  }

  let held = $state(false);
  let pending: ((message: string) => void)[] = [];
  let pendingCount = $state(0);
  let freshCalls = $state<string[]>([]);
  let freshResults = $state<Outcome[]>([]);
  let nestedCalls = $state<string[]>([]);
  let nestedResult = $state('');
  let initialCalls = $state<string[]>([]);
  let initialResult = $state('');
  let sequence = 0;

  function createFresh() {
    return createForm<{ fresh?: string }>({ initialValues: {}, rules: { fresh: [{
      validator: () => {
        freshCalls.push('Fresh');
        if (!held) return 'Fresh';

        return new Promise<string>((resolve) => {
          pending.push(resolve);
          pendingCount = pending.length;
        });
      }
    }] } });
  }

  let fresh = $state(createFresh());
  const nested = createForm({ initialValues: { user: {}, rows: [{}] } });
  const definitions: { name: NamePath; label: string }[] = [
    { name: ['user', 'name'], label: 'User name' },
    { name: ['user', 'role'], label: 'User role' },
    { name: 'user.name', label: 'Literal name' },
    { name: ['rows', 0, 'name'], label: 'Numeric row' },
    { name: ['rows', '0', 'name'], label: 'String row' }
  ];
  const initialDefinitions = [
    { name: 'empty', label: 'Empty' }, { name: 'zero', label: 'Zero' },
    { name: 'flag', label: 'False' }, { name: 'nil', label: 'Null' },
    { name: 'missing', label: 'Missing' }
  ];
  const initialized = createForm<Record<string, unknown>>({
    initialValues: { empty: '', zero: 0, flag: false, nil: null }
  });

  function failed(error: unknown): Outcome['result'] {
    if (!(error instanceof FormValidationError)) throw error;

    return { status: 'invalid', outOfDate: error.outOfDate, errorFields: error.errorFields };
  }

  async function runFresh(options?: FormValidateOptions, undefinedNames = false) {
    freshCalls = [];
    const id = ++sequence;
    const checked = fresh;
    let result: Outcome['result'];
    try {
      if (undefinedNames) await checked.validateFields(undefined, options);
      else await checked.validateFields(options);
      result = { status: 'success' };
    } catch (error) {
      result = failed(error);
    }

    freshResults.push({ id, result });
  }

  async function runNested(names: readonly NamePath[], options?: FormValidateOptions) {
    nestedCalls = [];
    try {
      await nested.validateFields(names, options);
      nestedResult = JSON.stringify({ status: 'success' });
    } catch (error) {
      nestedResult = JSON.stringify(failed(error));
    }
  }

  async function runInitial() {
    initialCalls = [];
    try {
      await initialized.validateFields({ dirty: true, validateOnly: true });
      initialResult = JSON.stringify({ status: 'success' });
    } catch (error) {
      initialResult = JSON.stringify(failed(error));
    }
  }

  function complete(newest: boolean) {
    const resolve = newest ? pending.pop() : pending.shift();
    pendingCount = pending.length;
    resolve?.(newest ? 'Newer error' : 'Older error');
  }

  function replaceFresh() {
    fresh = createFresh();
    freshCalls = [];
    freshResults = [];
    sequence = 0;
  }
</script>

<section id="form-validation-options-fixture" aria-label="Form validation options">
  <Form form={fresh}>
    <FormItem name="fresh" label="Fresh" help="Fresh hint">
      <Input value={fresh.values.fresh ?? ''}
        onValueChange={(value) => fresh.setFieldValue('fresh', value)} />
    </FormItem>
  </Form>
  <button onclick={() => runFresh()}>Normal validation</button>
  <button onclick={() => runFresh({ validateOnly: true })}>Silent validation</button>
  <button onclick={() => runFresh({ dirty: true })}>Dirty validation</button>
  <button onclick={() => runFresh({ validateOnly: true }, true)}>Undefined names silent</button>
  <button onclick={() => fresh.setFieldValue('fresh', undefined)}>Set same undefined</button>
  <button onclick={() => fresh.setFieldsValue({ fresh: undefined })}>Merge undefined</button>
  <button onclick={() => fresh.setFieldsValue({ fresh: 'changed' })}>Merge changed</button>
  <button onclick={() => fresh.resetFields()}>Reset fresh</button>
  <button onclick={replaceFresh}>Replace empty model</button>
  <label><input type="checkbox" bind:checked={held} />Hold validators</label>
  <button onclick={() => complete(false)}>Complete oldest</button>
  <button onclick={() => complete(true)}>Complete newest</button>
  <output aria-label="Fresh calls">{JSON.stringify(freshCalls)}</output>
  <output aria-label="Fresh results">{JSON.stringify(freshResults)}</output>
  <output aria-label="Fresh fields">{JSON.stringify(fresh.getFieldsError(['fresh']))}</output>
  <output aria-label="Fresh validating">{String(fresh.isFieldValidating('fresh'))}</output>
  <output aria-label="Pending validators">{pendingCount}</output>
  <Form form={nested}>
    {#each definitions as field (field.label)}
      <FormItem name={field.name} label={field.label} rules={[{ validator: () => {
        nestedCalls.push(field.label);
        return field.label;
      } }]}>
        <Input value={String(nested.getFieldValue(field.name) ?? '')} />
      </FormItem>
    {/each}
  </Form>
  <button onclick={() => runNested([['user']])}>Validate parent</button>
  <button onclick={() => runNested([['user']], { recursive: true })}>Validate descendants</button>
  <button onclick={() => runNested([['user'], ['user', 'name']], { recursive: true })}>
    Validate overlapping
  </button>
  <button onclick={() => runNested([['rows', 0]], { recursive: true, validateOnly: true })}>
    Validate numeric row
  </button>
  <button onclick={() => runNested(['user.name'], { recursive: true, validateOnly: true })}>
    Validate literal
  </button>
  <button onclick={() => nested.resetFields()}>Reset nested options</button>
  <output aria-label="Nested calls">{JSON.stringify(nestedCalls)}</output>
  <output aria-label="Touched user">{String(nested.isFieldTouched('user'))}</output>
  <output aria-label="Touched literal">{String(nested.isFieldTouched('user.name'))}</output>
  <output aria-label="Touched numeric row">{String(nested.isFieldTouched(['rows', 0]))}</output>
  <output aria-label="Touched string row">{String(nested.isFieldTouched(['rows', '0']))}</output>
  <output aria-label="Touched any">{String(nested.isFieldTouched([]))}</output>
  <output aria-label="Nested result">{nestedResult}</output>
  <output aria-label="Nested fields">{JSON.stringify(nested.getFieldsError(
    definitions.map(({ name }) => name)
  ))}</output>
  <Form form={initialized}>
    {#each initialDefinitions as field (field.name)}
      <FormItem name={field.name} label={field.label} rules={[{ validator: () => {
        initialCalls.push(field.label);
        return field.label;
      } }]}><Input value={String(initialized.getFieldValue(field.name) ?? '')} /></FormItem>
    {/each}
  </Form>
  <button onclick={runInitial}>Validate initial dirty</button>
  <output aria-label="Initial calls">{JSON.stringify(initialCalls)}</output>
  <output aria-label="Initial result">{initialResult}</output>
  <output aria-label="Initial fields">{JSON.stringify(initialized.getFieldsError(
    initialDefinitions.map(({ name }) => name)
  ))}</output>
</section>
