<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, Select, createForm, type FormValidateStatus
  } from 'antd-svelte';
  import reference from './ant-design-form-status-reference.json';
  import FormStatusControls from './FormStatusControls.svelte';

  interface Sample {
    id: string;
    status?: FormValidateStatus;
    errors?: string[];
    warnings?: string[];
    touched?: boolean;
    validating?: boolean;
    nameless?: boolean;
    local?: 'error' | 'warning';
    mode?: 'dark' | 'compact' | 'dark-compact';
    rtl?: boolean;
  }

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(
    reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample
  );
  const model = createForm<{ input: string; select: 'a' | undefined }>({
    initialValues: { input: 'Draft', select: 'a' }, rules: { input: [{}], select: [{}] }
  });
  let pending = $state(false);
  let showControls = $state(false);
  let release: (() => void) | undefined;

  function applyMetadata(sample: Sample) {
    model.setFields(['input', 'select'].map(name => ({
      name, errors: sample.errors ?? [], warnings: sample.warnings ?? [],
      touched: sample.touched ?? false, validating: sample.validating ?? false
    })));
  }

  untrack(() => applyMetadata(sample));

  $effect(() => {
    const current = sample;
    untrack(() => applyMetadata(current));
  });
</script>

<section id="form-status-fixture" aria-label="Form validation status">
  <label>Form status sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{ name: 'input', touched: true }]);
    pending = true;
    void model.validateFields(['input']).catch(() => {}).finally(() => {
      pending = false;
    });
  }}>Begin status validation</button>
  <button type="button" onclick={() => release?.()}>Release status validation</button>
  <button type="button" onclick={() => model.resetFields()}>Reset status form</button>
  <button type="button" onclick={() => { showControls = true; }}>Show status controls</button>
  <ConfigProvider direction={sample.rtl ? 'rtl' : 'ltr'} theme={{
    cssVar: {}, token: { motion: false },
    mode: sample.mode === 'dark' || sample.mode === 'dark-compact' ? 'dark' : 'light',
    compact: sample.mode === 'compact' || sample.mode === 'dark-compact'
  }}>
    <Form form={model}>
      <FormItem name={sample.nameless ? undefined : 'input'} label="input"
        validateStatus={sample.status} class="capture-input" rules={[{
          validator: () => new Promise<void>((resolve) => { release = resolve; })
        }]}>
        <Input aria-label="Input" status={sample.local} value={model.values.input}
          onValueChange={(value) => model.setFieldValue('input', value)} />
      </FormItem>
      <FormItem name={sample.nameless ? undefined : 'select'} label="select"
        validateStatus={sample.status} class="capture-select">
        <Select aria-label="Select" status={sample.local} value={model.values.select}
          options={[{ value: 'a', label: 'Alpha' }]}
          onValueChange={(value) => model.setFieldValue('select', value)} />
      </FormItem>
    </Form>
  </ConfigProvider>
  {#if showControls}<FormStatusControls />{/if}
  <output aria-label="Status validation">{pending ? 'pending' : 'ready'}</output>
  <output aria-label="Status metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('input')
  })}</output>
</section>
