<script lang="ts">
  import { untrack } from 'svelte';
  import dayjs from 'dayjs';
  import {
    Button, ConfigProvider, DatePicker, Divider, Form, FormItem, Input, InputNumber,
    Select, SpaceCompact, Switch, createForm, type ComponentSize, type FormSemantic
  } from 'antd-svelte';
  import reference from './ant-design-form-size-reference.json';

  interface Sample {
    id: string;
    size?: ComponentSize;
    global?: ComponentSize;
    nestedSize?: ComponentSize;
    nestedProvider?: ComponentSize;
    controlSize?: ComponentSize;
    compactSize?: ComponentSize;
    component?: false;
    layout?: 'vertical' | 'horizontal' | 'inline';
    direction?: 'ltr' | 'rtl';
    compactTheme?: boolean;
    labelHeight?: number;
  }

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Alpha' } });
  const nested = createForm({ initialValues: { nested: '' } });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);
  const classNames: FormSemantic = ({ props }) => ({
    root: `owner-size-${props.size ?? 'unset'}`,
    label: `owner-label-size-${props.size ?? 'unset'}`
  });
</script>

<section id="form-size-fixture" aria-label="Form sizes">
  <label>Form size sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{
      name: 'name', errors: ['Stored error'], warnings: ['Stored note'], touched: true
    }]);
  }}>Seed size metadata</button>
  <ConfigProvider
    componentSize={sample.global}
    direction={sample.direction ?? 'ltr'}
    theme={{
      cssVar: {}, token: { motion: false }, compact: sample.compactTheme,
      components: sample.labelHeight ? { Form: { labelHeight: sample.labelHeight } } : undefined
    }}
  >
    <div data-size-case style="width:400px">
      <Form form={model} layout={sample.layout ?? 'vertical'} size={sample.size}
        component={sample.component} {classNames}>
        <FormItem name="name" label="Name">
          <Input value={model.values.name} size={sample.controlSize}
            onValueChange={(value) => model.setFieldValue('name', value)} />
        </FormItem>
        <div data-size-control="number"><InputNumber size={sample.controlSize} defaultValue={3} /></div>
        <div data-size-control="select"><Select size={sample.controlSize}
          options={[{ value: 'a', label: 'Alpha' }]} defaultValue="a" /></div>
        <div data-size-control="picker"><DatePicker size={sample.controlSize}
          defaultValue={dayjs('2025-03-04')} /></div>
        <div data-size-control="button"><Button size={sample.controlSize}>Action</Button></div>
        <div data-size-control="switch"><Switch size={sample.controlSize === 'small'
          ? 'small' : sample.controlSize ? 'medium' : undefined} /></div>
        <div data-size-control="compact"><SpaceCompact size={sample.compactSize}>
          <Input size={sample.controlSize} /><Button size={sample.controlSize}>Compact</Button>
        </SpaceCompact></div>
        <div data-size-control="divider"><Divider /></div>
        <div data-size-nested>
          <ConfigProvider componentSize={sample.nestedProvider}>
            <Form form={nested} component={false} size={sample.nestedSize} {classNames}>
              <FormItem name="nested" label="Nested"><Input /></FormItem>
            </Form>
          </ConfigProvider>
        </div>
      </Form>
      <div data-size-sibling><Input aria-label="Sibling" /></div>
    </div>
  </ConfigProvider>
  <output aria-label="Size metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('name')
  })}</output>
</section>
