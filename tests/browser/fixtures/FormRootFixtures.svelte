<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm,
    type FormConfig, type FormProps, type FormItemProps
  } from 'antd-svelte';
  import reference from './ant-design-form-root-reference.json';

  interface Sample {
    id: string;
    parent?: FormConfig;
    child?: FormConfig;
    form?: Pick<FormProps<Record<string, unknown>>, 'class' | 'style' | 'rootClassName' | 'component'>;
    item?: Pick<FormItemProps, 'class' | 'style' | 'rootClassName'>;
  }

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Alpha' } });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);
</script>

<section id="form-root-fixture" aria-label="Form root styles">
  <label>Form root sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{
      name: 'name', errors: ['Stored error'], warnings: ['Stored note'], touched: true
    }]);
  }}>Seed root metadata</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }} form={sample.parent}>
    <ConfigProvider form={sample.child}>
      <div data-root-case style="width:360px">
        <Form form={model} layout="vertical" {...sample.form}>
          <FormItem name="name" label="Name" {...sample.item}>
            <Input value={model.values.name}
              onValueChange={(value) => model.setFieldValue('name', value)} />
          </FormItem>
        </Form>
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Root metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('name')
  })}</output>
</section>
