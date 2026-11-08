<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm,
    type FormConfig, type FormRequiredMark, type FormRequiredMarkInfo, type Locale
  } from 'antd-svelte';
  import reference from './ant-design-form-required-mark-reference.json';

  type Mark = boolean | 'optional' | 'custom';
  interface Sample {
    id: string;
    mark?: Mark;
    parent?: { requiredMark?: Mark };
    config?: { requiredMark?: Mark };
    parentLocale?: Partial<Locale>;
    locale?: Partial<Locale>;
    labels?: string[];
    layout?: 'horizontal' | 'vertical';
    outer?: boolean;
  }

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { required: 'Alpha', optional: 'Beta' } });
  const outer = createForm({ initialValues: {} });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);
  let submitted = $state(0);
  let failed = $state(0);

  function resolveMark(value?: Mark): FormRequiredMark | undefined {
    return value === 'custom' ? customMark : value;
  }

  function settings(input?: { requiredMark?: Mark }): FormConfig | undefined {
    return input ? { requiredMark: resolveMark(input.requiredMark) } : undefined;
  }
</script>

{#snippet customMark(label: string, info: FormRequiredMarkInfo)}
  <span data-custom-mark={info.required ? 'required' : 'optional'}>{label}<b>{info.required ? ' required' : ' optional'}</b></span>
{/snippet}

{#snippet fields()}
  <Form form={model} layout={sample.layout ?? 'vertical'} requiredMark={resolveMark(sample.mark)}
    onFinish={() => { submitted += 1; }} onFinishFailed={() => { failed += 1; }}>
    <FormItem name="required" label={sample.labels?.[0] ?? 'Required'}
      rules={[{ required: true, message: 'Required field' }]}>
      <Input value={model.values.required} aria-label="Required field"
        onValueChange={(value) => model.setFieldValue('required', value)} />
    </FormItem>
    <FormItem name="optional" label={sample.labels?.[1] ?? 'Optional'}>
      <Input value={model.values.optional} aria-label="Optional field"
        onValueChange={(value) => model.setFieldValue('optional', value)} />
    </FormItem>
  </Form>
{/snippet}

<section id="form-required-mark-fixture" aria-label="Form required marks">
  <label>Required mark sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{
      name: 'required', errors: ['Stored error'], warnings: ['Stored note'], touched: true
    }]);
  }}>Seed required mark metadata</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }} form={settings(sample.parent)}
    locale={sample.parentLocale}>
    <ConfigProvider form={settings(sample.config)} locale={sample.locale}>
      <div data-required-mark-case>
        {#if sample.outer !== undefined}
          <Form form={outer} component={false} requiredMark={sample.outer}>{@render fields()}</Form>
        {:else}
          {@render fields()}
        {/if}
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Required mark metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('required')
  })}</output>
  <output aria-label="Required mark submissions">{submitted}</output>
  <output aria-label="Required mark failures">{failed}</output>
</section>
