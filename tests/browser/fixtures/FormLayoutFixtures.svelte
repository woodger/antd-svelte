<script lang="ts">
  import {
    ConfigProvider, Form, FormItem, Input, createForm, theme,
    type FormItemProps, type FormProps, type ThemeConfig
  } from 'antd-svelte';
  import reference from './ant-design-form-layout-reference.json';

  const form = createForm({
    initialValues: { name: 'Anna', role: 'Editor' },
    rules: { name: [{ validator: (value) => value ? undefined : 'Name required' }] }
  });
  const sibling = createForm({ initialValues: { sibling: 'Sibling' } });
  const unwrapped = createForm({ initialValues: { hidden: '' } });
  let selected = $state('inline-1280-ltr');
  let layoutMode = $state<'sample' | 'inline' | 'horizontal' | 'vertical'>('sample');
  let itemMode = $state<'sample' | 'inherit' | 'horizontal' | 'vertical'>('sample');
  let submitted = $state<{ name: string; role: string }[]>([]);
  let sample = $derived({
    compact: false, margin: undefined as number | undefined, gap: undefined as number | undefined,
    itemLayout: undefined as string | undefined,
    ...reference.cases.find(({ sample }) => sample.id === selected)!.sample
  });
  let layout = $derived(
    (layoutMode === 'sample' ? sample.layout : layoutMode) as FormProps<typeof form.values>['layout']
  );
  let itemLayout = $derived((itemMode === 'sample' ? sample.itemLayout
    : itemMode === 'inherit' ? undefined : itemMode) as FormItemProps['layout']);
  let configured = $derived<ThemeConfig>({
    cssVar: {},
    ...(sample.compact ? { algorithm: theme.compactAlgorithm } : {}),
    token: { motion: false, ...(sample.gap !== undefined ? { margin: sample.gap } : {}) },
    components: {
      Form: sample.margin !== undefined ? { inlineItemMarginBottom: sample.margin } : {}
    }
  });
</script>

<section id="form-layout-fixture" aria-label="Form layouts">
  <label>Form layout sample
    <select bind:value={selected} onchange={() => { layoutMode = 'sample'; itemMode = 'sample'; }}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <label>Form layout
    <select bind:value={layoutMode}>
      {#each ['sample', 'inline', 'horizontal', 'vertical'] as value}<option {value}>{value}</option>{/each}
    </select>
  </label>
  <label>Role layout
    <select bind:value={itemMode}>
      {#each ['sample', 'inherit', 'horizontal', 'vertical'] as value}<option {value}>{value}</option>{/each}
    </select>
  </label>
  <ConfigProvider theme={configured} direction={sample.direction === 'rtl' ? 'rtl' : 'ltr'}>
    <div data-layout-root style:width={`${sample.width}px`}>
      <Form {form} {layout} style={`direction:${sample.direction}`} onFinish={(values) => {
        submitted.push(values);
      }}>
        <FormItem name="name" label="Name">
          <Input style="width:120px" value={form.values.name}
            onValueChange={(value) => form.setFieldValue('name', value)} />
        </FormItem>
        <FormItem name="role" label="Role" layout={itemLayout}>
          <Input style="width:120px" value={form.values.role}
            onValueChange={(value) => form.setFieldValue('role', value)} />
        </FormItem>
      </Form>
    </div>
  </ConfigProvider>
  <button type="button" onclick={() => {
    form.setFields([{ name: 'role', errors: ['Role error'], warnings: ['Role note'], touched: true }]);
  }}>Seed layout metadata</button>
  <button type="button" onclick={() => form.focusField('role')}>Focus layout role</button>
  <button type="button" onclick={() => form.resetFields()}>Reset layout form</button>
  <output aria-label="Layout fields">{JSON.stringify(form.getFieldsError())}</output>
  <output aria-label="Layout values">{JSON.stringify(form.values)}</output>
  <output aria-label="Layout submitted">{JSON.stringify(submitted)}</output>
  <Form form={sibling} layout="vertical">
    <FormItem name="sibling" label="Sibling"><Input value="Sibling" /></FormItem>
  </Form>
  <Form form={unwrapped} component={false} layout="inline">
    <FormItem name="hidden" label="Without wrapper"><Input /></FormItem>
  </Form>
</section>
