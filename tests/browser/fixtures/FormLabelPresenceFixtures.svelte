<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm,
    type FormProps, type FormItemProps
  } from 'antd-svelte';
  import reference from './ant-design-form-label-presence-reference.json';

  interface Sample {
    id: string;
    direction: 'ltr' | 'rtl';
    label?: string | null;
    omitLabel?: boolean;
    form?: Pick<FormProps<Record<string, unknown>>, 'labelCol' | 'wrapperCol'>;
    item?: Pick<FormItemProps, 'labelCol' | 'wrapperCol'>;
  }

  let {
    initialCase = 'null-form-576-ltr', initialRequired = false
  }: { initialCase?: string; initialRequired?: boolean } = $props();
  const model = createForm({ initialValues: { name: 'Alpha', inner: 'Beta' } });
  let selected = $state(untrack(() => initialCase));
  let required = $state(untrack(() => initialRequired));
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);
  let label = $derived(sample.omitLabel ? undefined : 'label' in sample ? sample.label : 'Name');
  let failed = $state(0);
</script>

<section id="form-label-presence-fixture" aria-label="Form label presence">
  <label>Form label presence sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{
      name: 'name', errors: ['Stored error'], warnings: ['Stored note'], touched: true
    }]);
  }}>Seed unlabelled metadata</button>
  <button type="button" onclick={() => { required = true; }}>Require unlabelled field</button>
  <ConfigProvider direction={sample.direction} theme={{ cssVar: {}, token: { motion: false } }}>
    <div style={`width:360px;direction:${sample.direction}`} data-label-presence-case>
      <Form form={model} layout="horizontal" {...sample.form}
        onFinishFailed={() => { failed += 1; }}>
        <FormItem name="name" {label} class="columns-root" {...sample.item}
          rules={required ? [{ required: true, message: 'Required field' }] : undefined}>
          <Input value={model.values.name} style="width:120px" aria-label="Control"
            onValueChange={(value) => model.setFieldValue('name', value)} />
        </FormItem>
      </Form>
    </div>
  </ConfigProvider>
  <output aria-label="Unlabelled metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('name')
  })}</output>
  <output aria-label="Unlabelled failures">{failed}</output>
</section>
