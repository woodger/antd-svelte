<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm, type ComponentSize, type Variant
  } from 'antd-svelte';
  import reference from './ant-design-form-nameless-reference.json';

  interface Sample {
    id: string;
    named?: boolean;
    required?: boolean;
    rules?: boolean;
    manual?: boolean;
    disabled?: boolean;
    size?: ComponentSize;
    variant?: Variant;
  }

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Model' } });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);
  let snapshot = $state<{ values: unknown; instance: boolean; store: string; touched: boolean }>();
  let validation = $state('');

  function inspect() {
    snapshot = {
      values: model.getFieldsValue(), instance: Boolean(model.getFieldInstance('name')),
      store: model.getFieldValue('name'), touched: model.isFieldTouched('name')
    };
  }

  async function validate() {
    try {
      await model.validateFields();
      validation = 'valid';
    } catch {
      validation = 'invalid';
    }
  }
</script>

<section id="form-nameless-fixture" aria-label="Form nameless rows">
  <label>Form name sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => model.resetFields()}>Reset nameless form</button>
  <button type="button" onclick={inspect}>Inspect nameless row</button>
  <button type="button" onclick={validate}>Validate nameless form</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <div data-nameless-case>
      <Form form={model} disabled={sample.disabled} size={sample.size} variant={sample.variant}>
        <FormItem name={sample.named ? 'name' : undefined} label="Caption"
          required={sample.required} rules={sample.rules ? [{ required: true }] : undefined}
          htmlFor={sample.manual ? 'owner-input' : undefined} help="Details" extra="Extra">
          <Input aria-label="control" defaultValue="Local"
            value={sample.named ? model.values.name : undefined}
            id={sample.manual ? 'owner-input' : undefined}
            onValueChange={(value) => {
              if (sample.named) model.setFieldValue('name', value);
            }} />
        </FormItem>
      </Form>
    </div>
  </ConfigProvider>
  <output aria-label="Nameless snapshot">{JSON.stringify(snapshot)}</output>
  <output aria-label="Nameless validation">{validation}</output>
</section>
