<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm,
    type FormProps, type FormItemProps
  } from 'antd-svelte';
  import reference from './ant-design-form-columns-reference.json';

  interface Sample {
    id: string;
    direction: 'ltr' | 'rtl';
    layout?: FormProps<Record<string, unknown>>['layout'];
    form?: Pick<FormProps<Record<string, unknown>>, 'labelCol' | 'wrapperCol'>;
    item?: Pick<FormItemProps, 'labelCol' | 'wrapperCol'>;
    child?: Pick<FormItemProps, 'labelCol' | 'wrapperCol'>;
    nested?: boolean;
    nestedForm?: boolean;
  }

  let { initialCase = 'form-columns-576-ltr' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Alpha', inner: 'Beta' } });
  const inner = createForm({ initialValues: { inner: 'Beta' } });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);
</script>

{#snippet nestedField(nested = false)}
  <FormItem name="inner" label="Inner" class="columns-inner" {...sample.child}>
    <Input value={nested ? inner.values.inner : model.values.inner} style="width:120px"
      onValueChange={(value) => {
        if (nested) inner.setFieldValue('inner', value);
        else model.setFieldValue('inner', value);
      }} />
  </FormItem>
{/snippet}

<section id="form-columns-fixture" aria-label="Form columns">
  <label>Form columns sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{
      name: 'name', errors: ['Stored error'], warnings: ['Stored note'], touched: true
    }]);
  }}>Seed columns metadata</button>
  <ConfigProvider direction={sample.direction} theme={{ cssVar: {}, token: { motion: false } }}>
    <div style={`width:360px;direction:${sample.direction}`} data-columns-case>
      <Form form={model} layout={sample.layout ?? 'horizontal'} {...sample.form}>
        <FormItem name="name" label="Name" class="columns-root" {...sample.item}>
          {#if sample.nested}
            {@render nestedField()}
          {:else if sample.nestedForm}
            <Form form={inner} component={false} layout="horizontal">{@render nestedField(true)}</Form>
          {:else}
            <Input value={model.values.name} style="width:120px"
              onValueChange={(value) => model.setFieldValue('name', value)} />
          {/if}
        </FormItem>
      </Form>
    </div>
  </ConfigProvider>
  <output aria-label="Columns metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('name')
  })}</output>
</section>
