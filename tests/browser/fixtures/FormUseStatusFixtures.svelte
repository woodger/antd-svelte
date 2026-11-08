<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, InputOTP, createForm, type FormValidateStatus
  } from 'antd-svelte';
  import reference from './ant-design-form-use-status-reference.json';
  import FormStatusReadout from './FormStatusReadout.svelte';

  interface Sample {
    id: string;
    status?: FormValidateStatus;
    errors?: string[];
    warnings?: string[];
    touched?: boolean;
    validating?: boolean;
    nameless?: boolean;
    otp?: boolean;
  }

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(
    reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample
  );
  const model = createForm({ initialValues: { name: 'Draft' }, rules: { name: [{}] } });
  const inner = createForm({ initialValues: {} });
  let showOTP = $state(false);
  let nativeInput = $state<HTMLInputElement>();
  let instanceMatches = $state(false);

  function applyMetadata(sample: Sample) {
    model.setFields([{
      name: 'name', errors: sample.errors ?? [], warnings: sample.warnings ?? [],
      touched: sample.touched ?? false, validating: sample.validating ?? false
    }]);
  }

  untrack(() => applyMetadata(sample));

  $effect(() => {
    const current = sample;
    untrack(() => applyMetadata(current));
  });
</script>

{#snippet label()}<FormStatusReadout scope="label" />{/snippet}
{#snippet extra()}<FormStatusReadout scope="extra" />{/snippet}
{#snippet separator()}<FormStatusReadout scope="otp" />{/snippet}

<section id="form-use-status-fixture" aria-label="Form use status">
  <label>Form use status sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => model.resetFields()}>Reset status readers</button>
  <button type="button" onclick={() => { showOTP = true; }}>Show status OTP</button>
  <button type="button" onclick={() => {
    const instance = model.getFieldInstance<{ nativeElement?: HTMLElement }>('name');
    instanceMatches = instance?.nativeElement === nativeInput;
  }}>Inspect status instance</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <FormStatusReadout scope="outside" />
    <Form form={model}>
      <FormStatusReadout scope="form-only" />
      <FormItem name={sample.nameless ? undefined : 'name'} {label} {extra}
        validateStatus={sample.status}>
        <FormStatusReadout scope="main">
          <Input aria-label="Status control" bind:inputElement={nativeInput}
            value={sample.nameless ? undefined : model.values.name}
            onValueChange={(value) => model.setFieldValue('name', value)} />
          <FormItem><FormStatusReadout scope="inner" /></FormItem>
          <Form form={inner} component={false}><FormStatusReadout scope="inner-form" /></Form>
          {#if showOTP || sample.otp}
            <InputOTP length={2} status="warning" separator={() => separator} />
          {/if}
        </FormStatusReadout>
      </FormItem>
    </Form>
  </ConfigProvider>
  <output aria-label="Status instance">{String(instanceMatches)}</output>
</section>
