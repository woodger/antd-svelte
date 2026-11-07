<script lang="ts">
  import { tick } from 'svelte';
  import {
    Form, FormItem, FormList, createForm,
    FormValidationError, type FormFieldMeta, type NamePath
  } from 'antd-svelte';
  import { encodeFormValues } from './form-value-projection';
  import FormResetControl from './FormResetControl.svelte';

  type Mode = 'fields' | 'list-defaults' | 'list-initial-value' | 'compound';
  const names: NamePath[] = [
    'name', 'sibling', ['user', 'name'], 'user.name', ['rows', 0, 'name'], ['rows', '0', 'name']
  ];
  const tags = ['name', 'sibling', 'nested', 'literal', 'numeric', 'string'];
  let mode = $state<Mode>('fields');
  let form = $state(createModel('fields'));
  let mounts = $state<Record<string, number>>({});
  let pending = $state<((message: string) => void)[]>([]);
  let validated = $state('');

  function createModel(mode: Mode) {
    return createForm<Record<string, unknown>>({ initialValues: mode === 'fields' ? {
      name: 'Anna', sibling: 'Sibling', user: { name: 'Nested', role: 'Role' },
      'user.name': 'Literal', rows: [{ name: 'Row' }]
    } : mode === 'list-defaults' ? {
      sibling: 'Sibling', people: [{ name: 'Anna', extra: 'Hidden' }, { name: 'Bob' }]
    } : mode === 'compound' ? { group: {}, child: 'Child' } : { sibling: 'Sibling' } });
  }

  function choose(next: Mode) {
    mode = next;
    mounts = {};
    form = createModel(next);
  }

  function recordMount(tag: string) {
    mounts[tag] = (mounts[tag] ?? 0) + 1;
  }

  function hold() {
    return new Promise<string>((complete) => { pending.push(complete); });
  }

  async function validate(name: NamePath) {
    try {
      await form.validateFields([name]);
      validated = 'success';
    } catch (error) {
      if (!(error instanceof FormValidationError)) throw error;
      validated = error.outOfDate ? 'outdated' : 'invalid';
    }
  }

  function complete() {
    const checks = pending;
    pending = [];
    checks.forEach((resolve) => { resolve('Late error'); });
  }

  function seedLocals() {
    for (const input of document.querySelectorAll<HTMLInputElement>('[data-reset-local]')) {
      input.value = `Scratch ${input.dataset.resetLocal}`;
    }
    const sibling = document.querySelector<HTMLInputElement>('[data-reset-local="sibling"]');
    sibling?.focus();
    sibling?.setSelectionRange(1, 3);
  }

  function seedFields() {
    form.setFields([
      ...names.map((name, index) => ({
        name, value: `Draft ${index}`, errors: [`Error ${index}`],
        warnings: [`Warning ${index}`], touched: true
      })),
      { name: ['user', 'role'], value: 'Changed role' }
    ]);
    seedLocals();
  }

  function seedParent() {
    form.setFields([{
      name: ['user', 'name'], value: 'Nested again', errors: ['Parent error'],
      warnings: ['Parent warning'], touched: true
    }]);
    const input = document.querySelector<HTMLInputElement>('[data-reset-local="nested"]');
    if (input) input.value = 'Nested scratch';
  }

  function seedList() {
    form.setFields([
      { name: 'sibling', value: 'Sibling draft', errors: ['Sibling error'], touched: true },
      { name: 'people', errors: ['List error'], warnings: ['List warning'], touched: true },
      { name: ['people', 0, 'name'], value: 'Draft Anna', errors: ['Person error'], warnings: ['Person warning'], touched: true },
      { name: ['people', 1, 'name'], value: 'Draft Bob', errors: ['Second error'], touched: true }
    ]);
    seedLocals();
  }

  async function seedFallback() {
    form.setFields([{
      name: 'people', value: [{ name: 'Changed default' }, { name: 'Added' }],
      errors: ['List error'], touched: true
    }]);
    // Новая строка должна смонтироваться до записи её локального черновика.
    await tick();
    seedLocals();
  }

  function snapshot() {
    const meta: (FormFieldMeta | null)[] = [];
    form.getFieldsValue({ filter: (value) => { meta.push(value); return false; } });

    return {
      mode, values: encodeFormValues(form.getFieldsValue(true)), meta: encodeFormValues(meta), mounts,
      ...(mode === 'fields' || mode === 'compound' ? {} : { list: {
        errors: form.getFieldError('people'), warnings: form.getFieldWarning('people'),
        touched: form.isFieldTouched('people')
      } })
    };
  }
</script>

<section id="form-reset-fields-fixture" aria-label="Form resetFields">
  {#key form}
    <Form {form}>
      {#if mode === 'fields'}
        {#each names as name, index (tags[index])}
          <FormItem {name} label={tags[index]} rules={index === 0 ? [{ validator: hold }] : undefined}>
            <FormResetControl {form} {name} tag={tags[index]} onMounted={recordMount} />
          </FormItem>
        {/each}
      {:else if mode === 'compound'}
        <FormItem name="group" label="Group">
          <FormItem name="child" label="Compound child" rules={[{ required: true, message: 'Child required' }]}>
            <FormResetControl {form} name="child" tag="child" onMounted={recordMount} />
          </FormItem>
        </FormItem>
      {:else}
        <FormItem name="sibling" label="Sibling">
          <FormResetControl {form} name="sibling" tag="sibling" onMounted={recordMount} />
        </FormItem>
        <FormList name="people" initialValue={mode === 'list-defaults' ? undefined : [{ name: 'List default' }]}>
          {#snippet children(fields)}
            <output aria-label="Reset list keys">{JSON.stringify(fields.map((field) => field.key))}</output>
            {#each fields as field (field.key)}
              <FormItem name={[field.name, 'name']} label={`Person ${field.name}`}>
                <FormResetControl {form} name={['people', field.name, 'name']}
                  tag={`person-${field.name}`} onMounted={recordMount} />
              </FormItem>
            {/each}
          {/snippet}
        </FormList>
      {/if}
    </Form>
  {/key}
  <button onclick={seedFields}>Seed reset fields</button>
  <button onclick={seedParent}>Seed reset parent</button>
  <button onclick={seedList}>Seed reset list</button>
  <button onclick={seedFallback}>Seed reset fallback</button>
  <button onclick={() => form.resetFields([['user', 'name']])}>Reset nested field</button>
  <button onclick={() => form.resetFields(['user'])}>Reset parent value</button>
  <button onclick={() => form.resetFields(['user.name'])}>Reset literal field</button>
  <button onclick={() => form.resetFields([['rows', 0, 'name']])}>Reset numeric field</button>
  <button onclick={() => form.resetFields([['rows', '0', 'name']])}>Reset string field</button>
  <button onclick={() => form.resetFields(['missing'])}>Reset missing value</button>
  <button onclick={() => form.resetFields([])}>Reset no fields</button>
  <button onclick={() => form.resetFields(['name', 'name'])}>Reset repeated field</button>
  <button onclick={() => form.resetFields([[]])}>Reset root value</button>
  <button onclick={() => form.resetFields()}>Reset all fields</button>
  <button onclick={() => form.resetFields([['people', 0]])}>Reset row value</button>
  <button onclick={() => form.resetFields([['people', 1, 'name']])}>Reset row field</button>
  <button onclick={() => form.resetFields(['people'])}>Reset list field</button>
  <button onclick={() => choose('list-defaults')}>Show reset list</button>
  <button onclick={() => choose('list-initial-value')}>Show reset fallback</button>
  <button onclick={() => choose('compound')}>Show reset compound</button>
  <button onclick={() => form.resetFields(['group'])}>Reset compound group</button>
  <button onclick={() => form.resetFields(['name'])}>Reset held field</button>
  <button onclick={() => validate('name')}>Validate held reset field</button>
  <button onclick={() => validate('child')}>Validate compound child</button>
  <button onclick={complete}>Complete reset validations</button>
  <output aria-label="Reset pending">{pending.length}</output>
  <output aria-label="Reset validation result">{validated}</output>
  <output aria-label="Reset fields snapshot">{JSON.stringify(snapshot())}</output>
</section>
