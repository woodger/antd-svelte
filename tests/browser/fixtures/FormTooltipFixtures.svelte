<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm, enUS,
    type FormConfig, type FormItemTooltip, type FormRequiredMarkInfo,
    type FormTooltipProps, type RenderEmptyContent
  } from 'antd-svelte';
  import reference from './ant-design-form-tooltip-reference.json';

  type IconName = 'global' | 'local' | 'item';
  type Options = Omit<FormTooltipProps, 'icon'> & { icon?: IconName | null };
  type Content = Options | RenderEmptyContent;
  interface Sample {
    id: string;
    tooltip?: Content;
    parent?: Options;
    child?: Options | 'reset';
    form?: Options;
    richTitle?: boolean;
    outer?: boolean;
    label?: null;
    mark?: 'optional' | 'custom';
    direction?: 'ltr' | 'rtl';
    layout?: 'horizontal' | 'vertical';
    compact?: boolean;
    dark?: boolean;
    activate?: 'hover' | 'click';
  }

  let { initialCase = 'absent' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Alpha' } });
  const outer = createForm({ initialValues: {} });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);

  function settings(value?: Options): FormTooltipProps | undefined {
    if (!value) return;
    const { icon, ...rest } = value;
    if (!Object.hasOwn(value, 'icon')) return rest;
    const icons = { global: globalIcon, local: localIcon, item: itemIcon };

    return { ...rest, icon: icon ? icons[icon] : icon };
  }

  function defaults(value?: Options): FormConfig | undefined {
    return value ? { tooltip: settings(value) } : undefined;
  }

  function isOptions(value: Content): value is Options {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function content(value: Content): FormItemTooltip {
    return isOptions(value) ? settings(value) : value;
  }
</script>

{#snippet globalIcon()}<span data-tooltip-icon="global">G</span>{/snippet}
{#snippet localIcon()}<span data-tooltip-icon="local">L</span>{/snippet}
{#snippet itemIcon()}<span data-tooltip-icon="item">I</span>{/snippet}
{#snippet richTitle()}<b data-rich-tip>Rich tip</b>{/snippet}
{#snippet renderLabel(value: RenderEmptyContent)}
  {#if Array.isArray(value)}
    {#each value as child}{@render renderLabel(child)}{/each}
  {:else if typeof value === 'function'}{@render value()}
  {:else if typeof value !== 'boolean'}{value}{/if}
{/snippet}
{#snippet customMark(label: RenderEmptyContent, info: FormRequiredMarkInfo)}
  <span data-custom-mark={info.required ? 'required' : 'optional'}>{@render renderLabel(label)}<b>{' marked'}</b></span>
{/snippet}

{#snippet fields()}
  <Form form={model} layout={sample.layout ?? 'vertical'}
    tooltip={{
      open: sample.activate ? undefined : true, mouseEnterDelay: 0, mouseLeaveDelay: 0,
      ...settings(sample.form)
    }} requiredMark={sample.mark === 'custom' ? customMark : sample.mark}>
    <FormItem name="name" label={sample.label === null ? null : 'Caption'}
      tooltip={sample.richTitle ? richTitle : content(sample.tooltip)}>
      <Input value={model.values.name}
        onValueChange={(value) => model.setFieldValue('name', value)} />
    </FormItem>
  </Form>
{/snippet}

<section id="form-tooltip-fixture" aria-label="Form label tooltips">
  <label>Form tooltip sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{
      name: 'name', errors: ['Stored error'], warnings: ['Stored note'], touched: true
    }]);
  }}>Seed tooltip metadata</button>
  <ConfigProvider locale={enUS} direction={sample.direction ?? 'ltr'} form={defaults(sample.parent)}
    theme={{ cssVar: {}, token: { motion: false }, compact: sample.compact,
      mode: sample.dark ? 'dark' : 'light' }}>
    <ConfigProvider form={sample.child === 'reset' ? {} : defaults(sample.child)}>
      <div data-tooltip-case dir={sample.direction ?? 'ltr'} style="width:400px;margin-top:200px">
        <button id="before-tooltip" type="button">Before</button>
        {#if sample.outer}
          <Form form={outer} component={false} tooltip={{ children: 'Outer', title: 'Outer' }}>
            {@render fields()}
          </Form>
        {:else}{@render fields()}{/if}
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Tooltip field metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('name')
  })}</output>
</section>
