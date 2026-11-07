<script lang="ts">
  import {
    Form, FormItem, Input, createForm, FormValidationError,
    type FormFieldData, type FormFieldMeta, type NamePath
  } from 'antd-svelte';
  import { encodeFormValues } from './form-value-projection';

  const names: NamePath[] = [
    'name', ['user', 'name'], 'user.name', ['rows', 0, 'name'], ['rows', '0', 'name'], 'unbound', 'missing'
  ];
  const form = createForm<Record<string, unknown>>({ initialValues: {
    name: 'Anna', user: { name: 'Nested' }, 'user.name': 'Literal',
    rows: [{ name: 'Row' }], unbound: 'Hidden'
  } });
  const patches: Record<string, readonly FormFieldData[]> = {
    'computed-validated': [{ name: 'name', validated: true }],
    'server-messages': [{ name: 'name', errors: ['Server error'], warnings: ['Heads up'], touched: false }],
    'touch-only': [{ name: 'name', touched: true }],
    'values-and-paths': [
      { name: 'name', value: 'Changed' },
      { name: ['user', 'name'], value: 'Nested changed', errors: ['Nested server'] },
      { name: 'user.name', value: 'Literal changed', warnings: ['Literal note'] },
      { name: ['rows', 0, 'name'], errors: ['Numeric'] },
      { name: ['rows', '0', 'name'], warnings: ['String'] }
    ],
    'repeated-path': [
      { name: 'name', errors: ['First'] }, { name: 'name', errors: ['Last'], touched: false }
    ],
    'clear-messages': [
      { name: 'name', errors: [], warnings: [] }, { name: ['user', 'name'], errors: [] }
    ],
    'explicit-undefined-value': [{ name: 'name', value: undefined, errors: undefined, warnings: undefined }],
    'unbound-metadata': [
      { name: 'unbound', value: 'Hidden changed', errors: ['Invisible'], touched: true },
      { name: 'missing', errors: ['Ignored'], warnings: ['Ignored'], touched: true }
    ],
    'messages-during-validation': [
      { name: 'name', errors: ['Manual pending'], warnings: ['Pending warning'], touched: true }
    ],
    'manual-validating': [
      { name: 'name', validating: true, errors: [], warnings: [], touched: false }
    ],
    'manual-complete': [{ name: 'name', validating: false, validated: false }],
    'override-pending': [
      { name: 'name', validating: false, errors: ['Override'], warnings: ['Override warning'] }
    ],
    'ruleless-metadata': [
      { name: ['user', 'name'], errors: ['Bare server'], warnings: ['Bare note'], touched: true, validating: true }
    ],
    'ruleless-cleared': [{ name: ['user', 'name'], validating: false }],
    'fresh-value': [{ name: 'name', value: 'New value', errors: ['Server after write'] }],
    'undefined-flags': [{ name: 'name', touched: undefined, validating: undefined }]
  };
  let calls = $state(0);
  let pending = $state<{ id: number; complete(message: string): void }[]>([]);
  let finished = $state<number[]>([]);
  let nextRequest = 0;
  let bareDone = $state(false);

  function hold(value: unknown) {
    const id = calls++;
    return new Promise<string | void>((resolve) => {
      pending.push({ id, complete: (message) => resolve(value === 'New value' ? undefined : message) });
    });
  }

  async function validate() {
    const id = nextRequest++;
    try {
      await form.validateFields(['name']);
    } catch (error) {
      if (!(error instanceof FormValidationError)) throw error;
    }
    finished.push(id);
  }

  function complete(id: number) {
    pending.find((entry) => entry.id === id)?.complete('Async rejected');
    pending = pending.filter((entry) => entry.id !== id);
  }

  async function validateBare() {
    bareDone = false;
    await form.validateFields([['user', 'name']]);
    bareDone = true;
  }

  function snapshot() {
    const meta: (FormFieldMeta | null)[] = [];
    const mounted = form.getFieldsValue({ filter: (value) => { meta.push(value); return true; } });

    return {
      values: encodeFormValues(form.getFieldsValue(true)), mounted: encodeFormValues(mounted),
      meta: encodeFormValues(meta), fields: names.map((name) => ({
        name: Array.isArray(name) ? name : [name], errors: form.getFieldError(name),
        warnings: form.getFieldWarning(name), touched: form.isFieldTouched(name),
        validating: form.isFieldValidating(name)
      })), calls
    };
  }
</script>

<section id="form-set-fields-fixture" aria-label="Form setFields">
  <Form {form}>
    {#each names.slice(0, 5) as name, index (index)}
      <FormItem {name} label={`Set field ${index}`} rules={index === 0 ? [{ validator: hold }] : undefined}>
        <Input value={String(form.getFieldValue(name) ?? '')}
          onValueChange={(value) => form.setFieldValue(name, value)} />
      </FormItem>
    {/each}
  </Form>
  {#each Object.keys(patches) as key (key)}
    <button onclick={() => form.setFields(patches[key])}>Set fields {key}</button>
  {/each}
  <button onclick={validate}>Validate set field</button>
  <button onclick={validateBare}>Validate bare set field</button>
  <button onclick={() => form.resetFields()}>Reset set fields</button>
  {#each pending as entry (entry.id)}
    <button onclick={() => complete(entry.id)}>Complete set fields {entry.id}</button>
  {/each}
  <output aria-label="Set fields snapshot">{JSON.stringify(snapshot())}</output>
  <output aria-label="Set fields pending">{JSON.stringify(pending.map(({ id }) => id))}</output>
  <output aria-label="Set fields finished">{JSON.stringify(finished)}</output>
  <output aria-label="Set fields bare done">{String(bareDone)}</output>
</section>
