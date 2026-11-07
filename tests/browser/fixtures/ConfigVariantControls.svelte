<script lang="ts">
  import {
    Input, TextArea, InputPassword, InputSearch, InputOTP, InputNumber, Mentions, Select,
    AutoComplete, TreeSelect, Cascader, DatePicker, TimePicker, RangePicker, TimeRangePicker,
    Card, Pagination, ColorPicker, type Variant, type CardProps
  } from 'antd-svelte';

  let { variant, bordered, onChanged }: {
    variant?: Variant;
    bordered?: boolean;
    onChanged?: () => void;
  } = $props();
  let single = $state<string | undefined>('alpha');
  let multiple = $state(['alpha']);
  const options = [{ value: 'alpha', label: 'Alpha' }, { value: 'gamma', label: 'Gamma' }];
  let cardVariant = $derived<CardProps['variant']>(variant === undefined || variant === 'borderless'
    ? variant : 'outlined');
</script>

<div data-variant-kind="input"><Input {variant} {bordered} defaultValue="Draft"
  name="draft" aria-label="Variant input draft" onValueChange={onChanged} /></div>
<div data-variant-kind="text-area"><TextArea {variant} {bordered} defaultValue="Draft"
  name="article" aria-label="Variant text area draft" onValueChange={onChanged} /></div>
<div data-variant-kind="password"><InputPassword {variant} {bordered}
  defaultValue="Secret" name="password" aria-label="Variant password" /></div>
<div data-variant-kind="search"><InputSearch {variant} {bordered}
  defaultValue="Draft" name="search" aria-label="Variant search" /></div>
<div data-variant-kind="otp"><InputOTP {variant} defaultValue="1234" length={4} /></div>
<div data-variant-kind="input-number"><InputNumber {variant} {bordered}
  defaultValue={12} name="amount" aria-label="Variant amount" /></div>
<div data-variant-kind="mentions"><Mentions {variant} defaultValue="Draft"
  name="mentions" aria-label="Variant mentions" /></div>
<div data-variant-kind="select"><Select {variant} {bordered} {options}
  bind:value={single} name="choice" aria-label="Variant choice" onValueChange={onChanged} /></div>
<div data-variant-kind="multiple-select"><Select {variant} {bordered} {options}
  mode="multiple" bind:value={multiple} name="choices" aria-label="Variant choices"
  onValueChange={onChanged} /></div>
<div data-variant-kind="auto-complete"><AutoComplete {variant} {bordered} {options}
  defaultValue="Draft" name="completion" aria-label="Variant completion" /></div>
<div data-variant-kind="tree-select"><TreeSelect {variant} {bordered}
  treeData={[{ value: 'alpha', title: 'Alpha' }]} defaultValue="alpha"
  name="parent" aria-label="Variant parent" /></div>
<div data-variant-kind="cascader"><Cascader {variant} {bordered} {options}
  defaultValue={['alpha']} aria-label="Variant path" /></div>
<div data-variant-kind="date-picker"><DatePicker {variant} {bordered}
  name="date" aria-label="Variant date" /></div>
<div data-variant-kind="time-picker"><TimePicker {variant} {bordered}
  name="time" aria-label="Variant time" /></div>
<div data-variant-kind="range-picker"><RangePicker {variant} {bordered}
  name="dates" /></div>
<div data-variant-kind="time-range-picker"><TimeRangePicker {variant} {bordered}
  name="times" /></div>
<div data-variant-kind="card"><Card variant={cardVariant} {bordered}>Card content</Card></div>
<div data-variant-kind="pagination"><Pagination total={500}
  showQuickJumper showSizeChanger={false} /></div>
<ColorPicker defaultValue="#1677ff" aria-label="Variant color" />
