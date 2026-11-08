<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm,
    type FormConfig, type FormItemProps, type FormProps
  } from 'antd-svelte';
  import reference from './ant-design-form-labels-reference.json';

  let { initialCase = 'default-ltr' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Anna' } });
  const outer = createForm({ initialValues: {} });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived({
    parent: undefined as FormConfig | undefined,
    config: undefined as FormConfig | undefined,
    outer: undefined as FormConfig | undefined,
    form: {} as FormConfig,
    item: {} as Pick<FormItemProps, 'labelAlign' | 'colon'>,
    layout: 'horizontal', label: 'Name:',
    ...reference.cases.find(({ sample }) => sample.id === selected)!.sample
  });
  let parent = $derived(sample.parent as FormConfig | undefined);
  let child = $derived(sample.config as FormConfig | undefined);
  let outerSettings = $derived(sample.outer as FormConfig | undefined);
  let formSettings = $derived(sample.form as FormConfig);
  let itemSettings = $derived(sample.item as Pick<FormItemProps, 'labelAlign' | 'colon'>);
  let layout = $derived(sample.layout as FormProps<typeof model.values>['layout']);
</script>

<style>
  [data-label-case] :global(.ant-form-item-label) { max-width: 96px; }
</style>

{#snippet fieldForm()}
  <Form form={model} {layout} {...formSettings} style={`direction:${sample.direction}`}>
    <FormItem name="name" label={sample.label} {...itemSettings}>
      <Input value={model.values.name} style="width:120px" aria-label="Labelled field"
        onValueChange={(value) => model.setFieldValue('name', value)} />
    </FormItem>
  </Form>
{/snippet}

<section id="form-labels-fixture" aria-label="Form labels">
  <label>Form labels sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{ name: 'name', errors: ['Stored error'], warnings: ['Stored note'], touched: true }]);
  }}>Seed label metadata</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }} form={parent}>
    <ConfigProvider form={child}>
      <div data-label-case style="width:360px">
        {#if outerSettings}
          <Form form={outer} component={false} {...outerSettings}>{@render fieldForm()}</Form>
        {:else}
          {@render fieldForm()}
        {/if}
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Label values">{JSON.stringify(model.values)}</output>
  <output aria-label="Label metadata">{JSON.stringify(model.getFieldsError())}</output>
</section>
