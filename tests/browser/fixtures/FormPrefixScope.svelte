<script lang="ts">
  import {
    Form, FormItem, Input, createForm, type ComponentSize, type FormProps
  } from 'antd-svelte';

  export interface FormPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    itemLocal?: string;
    rtl?: boolean;
    media?: boolean;
    narrowMedia?: boolean;
    aliases?: boolean;
    layout?: FormProps<Record<string, unknown>>['layout'];
    size?: ComponentSize;
    optional?: boolean;
    requiredMark?: boolean;
    disabled?: boolean;
    tooltip?: boolean;
    component?: false;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: FormPrefixSample;
    local?: boolean;
  } = $props();
  const model = createForm({ initialValues: { draft: 'Draft', role: 'Editor' } });
  let events = $state<string[]>([]);
  let submitted = $state<string[]>([]);
</script>

<div data-form-prefix-scope={scope} style="width:480px;padding:12px">
  <Form form={model} name={`${scope}-form`} prefixCls={local ? sample.local : undefined}
    layout={sample.layout ?? 'horizontal'} size={sample.size} disabled={sample.disabled}
    component={sample.component} requiredMark={sample.optional ? 'optional' : sample.requiredMark}
    labelCol={{ span: 6, class: 'fixture-prefix-label' }}
    wrapperCol={{ span: 18, class: 'fixture-prefix-control' }} class="fixture-prefix-form"
    onFinish={values => { submitted.push(values.draft); }}>
    <button type="submit" hidden>Submit</button>
    <FormItem prefixCls={local ? sample.itemLocal : undefined} name="draft" label="Name"
      class="fixture-prefix-item" rules={[{ required: true, message: 'Required' }]}
      tooltip={sample.tooltip ? 'Details' : undefined}>
      <Input aria-label={`${scope} draft`} value={model.values.draft}
        onValueChange={value => {
          model.setFieldValue('draft', value);
          events.push(value);
        }} />
    </FormItem>
    <FormItem prefixCls={local ? sample.itemLocal : undefined} name="role" label="Role"
      class="fixture-prefix-item" labelCol={{ span: 24, class: 'fixture-prefix-label' }}
      wrapperCol={{ span: 24, class: 'fixture-prefix-control' }}>
      <Input aria-label={`${scope} role`} value={model.values.role}
        onValueChange={value => model.setFieldValue('role', value)} />
    </FormItem>
  </Form>
  <button type="button" aria-label={`${scope} validate form`}
    onclick={() => { void model.validateFields().catch(() => {}); }}>Validate</button>
  <button type="button" aria-label={`${scope} reset form`} onclick={() => model.resetFields()}>Reset</button>
  <output aria-label={`${scope} form events`}>{events.join('|')}</output>
  <output aria-label={`${scope} form submitted`}>{submitted.join('|')}</output>
  <output aria-label={`${scope} form fields`}>{JSON.stringify(model.getFieldsError())}</output>
</div>
