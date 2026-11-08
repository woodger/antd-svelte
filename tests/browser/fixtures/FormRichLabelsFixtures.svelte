<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm, enUS,
    type FormRequiredMarkInfo, type RenderEmptyContent
  } from 'antd-svelte';
  import reference from './ant-design-form-rich-labels-reference.json';
  import FormLabelCounter from './FormLabelCounter.svelte';
  import FormRichLabelControls from './FormRichLabelControls.svelte';

  interface Sample {
    id: string;
    kind: string;
    mark: string;
    required: boolean;
    layout: 'vertical' | 'horizontal';
  }

  let { initialCase = 'text-default' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Alpha' } });
  const counterSample: Sample = {
    id: 'counter', kind: 'counter', mark: 'default', required: false, layout: 'vertical'
  };
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(selected === 'counter' ? counterSample
    : reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);
  let caption = $state('Rich name:');
  let controlsCaption = $state('Choices');
  let showControls = $state(false);
  const content: Record<string, RenderEmptyContent> = {
    text: 'Name:', zero: 0, number: 12, true: true, false: false, missing: undefined,
    null: null, empty: '', space: ' ', array: [], nested: [null, false, 0, 'Name:'],
    rich, 'empty-rich': emptyRich, 'rich-array': ['Name ', emphasis, 0], counter
  };
  let label = $derived(content[sample.kind]);
</script>

{#snippet rich()}<strong data-rich-label>{caption}</strong>{/snippet}
{#snippet emptyRich()}{/snippet}
{#snippet emphasis()}<em>rich</em>{/snippet}
{#snippet counter()}<FormLabelCounter />{/snippet}

{#snippet renderLabel(value: RenderEmptyContent)}
  {#if Array.isArray(value)}
    {#each value as child}{@render renderLabel(child)}{/each}
  {:else if typeof value === 'function'}{@render value()}
  {:else if typeof value !== 'boolean'}{value}{/if}
{/snippet}

{#snippet customMark(value: RenderEmptyContent, info: FormRequiredMarkInfo)}
  <span data-label-kind={Array.isArray(value) ? 'array' : typeof value === 'function' ? 'rich' : typeof value}
    data-label-required={String(info.required)}>{@render renderLabel(value)}<b>!</b></span>
{/snippet}

<section id="form-rich-labels-fixture" aria-label="Form rich labels">
  <label>Form rich labels sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
      <option value="counter">counter</option>
    </select>
  </label>
  <button type="button" onclick={() => { caption = 'Updated caption:'; }}>Update rich caption</button>
  <button type="button" onclick={() => { controlsCaption = 'Updated choices'; }}>
    Update control captions
  </button>
  <button type="button" onclick={() => { showControls = !showControls; }}>Show rich controls</button>
  <button type="button" onclick={() => {
    model.setFields([{
      name: 'name', errors: ['Stored error'], warnings: ['Stored note'], touched: true
    }]);
  }}>Seed rich label metadata</button>
  <button type="button" onclick={() => model.resetFields(['name'])}>Reset rich field</button>
  <ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
    <div data-rich-label-case style="width:360px">
      <Form form={model} layout={sample.layout} requiredMark={sample.mark === 'custom'
        ? customMark : sample.mark === 'optional' ? 'optional' : true}>
        <FormItem name="name" {label} rules={sample.required ? [{ required: true }] : undefined}>
          <Input value={model.values.name}
            onValueChange={(value) => model.setFieldValue('name', value)} />
        </FormItem>
      </Form>
    </div>
    {#if showControls}<FormRichLabelControls caption={controlsCaption} />{/if}
  </ConfigProvider>
  <output aria-label="Rich label metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('name')
  })}</output>
</section>
