<script lang="ts">
  import { untrack } from 'svelte';
  import {
    AutoComplete, Cascader, Checkbox, CheckboxGroup, DatePicker, Form, FormItem, Input,
    InputNumber, InputOTP, InputPassword, InputSearch, Mentions, Radio, RadioGroup,
    RangePicker, Select, Slider, Switch, TextArea, Transfer, TreeSelect, createForm,
    type FormValidateStatus
  } from 'antd-svelte';

  let { initialErrors = false }: { initialErrors?: boolean } = $props();
  const names = [
    'input', 'password', 'search', 'textarea', 'mentions', 'number', 'select', 'tree',
    'cascader', 'autocomplete', 'date', 'range', 'checkbox', 'checkbox-group', 'radio',
    'radio-group', 'switch', 'slider', 'otp', 'transfer'
  ];
  const model = createForm<Record<string, unknown>>({
    initialValues: {}, rules: Object.fromEntries(names.map(name => [name, [{}]]))
  });
  let selected = $state('success');
  let status = $derived(selected === 'automatic' ? undefined : selected as FormValidateStatus);

  function seedErrors() {
    model.setFields(names.map(name => ({ name, errors: ['Stored error'] })));
  }

  untrack(() => {
    if (initialErrors) seedErrors();
  });
</script>

<section aria-label="Status control accessibility">
  <label>Control visual status
    <select bind:value={selected}>
      <option value="automatic">automatic</option>
      <option value="">empty</option>
      <option value="success">success</option>
      <option value="warning">warning</option>
      <option value="validating">validating</option>
    </select>
  </label>
  <button type="button" onclick={seedErrors}>Seed control errors</button>
  <button type="button" onclick={() => model.resetFields()}>Reset control errors</button>
  <Form form={model}>
    <FormItem name="input" validateStatus={status} class="status-control-input">
      <Input aria-label="Status input" />
    </FormItem>
    <FormItem name="password" validateStatus={status} class="status-control-password">
      <InputPassword aria-label="Status password" />
    </FormItem>
    <FormItem name="search" validateStatus={status} class="status-control-search">
      <InputSearch aria-label="Status search" />
    </FormItem>
    <FormItem name="textarea" validateStatus={status} class="status-control-textarea">
      <TextArea aria-label="Status textarea" />
    </FormItem>
    <FormItem name="mentions" validateStatus={status} class="status-control-mentions">
      <Mentions aria-label="Status mentions" />
    </FormItem>
    <FormItem name="number" validateStatus={status} class="status-control-number">
      <InputNumber aria-label="Status number" />
    </FormItem>
    <FormItem name="select" validateStatus={status} class="status-control-select">
      <Select aria-label="Status select" options={[{ value: 'a', label: 'Alpha' }]} />
    </FormItem>
    <FormItem name="tree" validateStatus={status} class="status-control-tree">
      <TreeSelect aria-label="Status tree" treeData={[{ value: 'a', title: 'Alpha' }]} />
    </FormItem>
    <FormItem name="cascader" validateStatus={status} class="status-control-cascader">
      <Cascader aria-label="Status cascader" options={[{ value: 'a', label: 'Alpha' }]} />
    </FormItem>
    <FormItem name="autocomplete" validateStatus={status} class="status-control-autocomplete">
      <AutoComplete aria-label="Status autocomplete" options={[{ value: 'a', label: 'Alpha' }]} />
    </FormItem>
    <FormItem name="date" validateStatus={status} class="status-control-date">
      <DatePicker aria-label="Status date" />
    </FormItem>
    <FormItem name="range" validateStatus={status} class="status-control-range">
      <RangePicker aria-label="Status range" />
    </FormItem>
    <FormItem name="checkbox" validateStatus={status} class="status-control-checkbox">
      <Checkbox>Status checkbox</Checkbox>
    </FormItem>
    <FormItem name="checkbox-group" validateStatus={status} class="status-control-checkbox-group">
      <CheckboxGroup aria-label="Status checkbox group" options={['Alpha']} />
    </FormItem>
    <FormItem name="radio" validateStatus={status} class="status-control-radio">
      <Radio value="a">Status radio</Radio>
    </FormItem>
    <FormItem name="radio-group" validateStatus={status} class="status-control-radio-group">
      <RadioGroup aria-label="Status radio group" options={['Alpha']} />
    </FormItem>
    <FormItem name="switch" validateStatus={status} class="status-control-switch">
      <Switch aria-label="Status switch" />
    </FormItem>
    <FormItem name="slider" validateStatus={status} class="status-control-slider">
      <Slider ariaLabelForHandle="Status slider" />
    </FormItem>
    <FormItem name="otp" validateStatus={status} class="status-control-otp">
      <InputOTP aria-label="Status OTP" />
    </FormItem>
    <FormItem name="transfer" validateStatus={status} class="status-control-transfer">
      <Transfer dataSource={[{ key: 'a', title: 'Alpha' }]} />
    </FormItem>
  </Form>
</section>
