<script lang="ts">
  import { Button, ConfigProvider, Form, FormItem, Input, createForm } from 'antd-svelte';

  let {
    id,
    prefix = 'ant',
    priority = false
  }: { id: string; prefix?: string; priority?: boolean; } = $props();
  const model = createForm({
    initialValues: { title: 'Draft' },
    rules: { title: [{ required: true, message: 'Field required' }] }
  });
  let submissions = $state(0);
  let submitted = $state('');
  let layout = $derived<'horizontal' | 'vertical'>(
    id === 'horizontal' || id === 'rtl' || id === 'sibling'
    ? 'horizontal' : 'vertical');
  let styled = $derived(priority || id === 'priority');
  let style = $derived([
    'width:320px',
    styled && 'font-size:30px;color:rgb(255,0,0);margin-bottom:5px',
    id === 'variable' && `--${prefix}-form-label-color:rgb(255,0,255)`
  ].filter(Boolean).join(';'));
</script>

{#snippet item()}
  <FormItem name="title" label="Field" required help="Help" htmlFor={`form-theme-field-${id}`}>
    <Input aria-label={`Form theme draft ${id}`} value={model.values.title}
      onValueChange={value => model.setFieldValue('title', value ?? '')} />
  </FormItem>
{/snippet}

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'}>
  <div data-form-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
    style="width:320px;min-height:150px">
    {#if id === 'standalone'}
      {@render item()}
    {:else}
      <Form form={model} {layout} {style} class="theme-form" onFinish={values => {
        submissions++;
        submitted = values.title;
      }}>
        {@render item()}
        {#if id === 'normal'}
          <Button htmlType="submit">Submit themed form</Button>
          <Button htmlType="reset">Reset themed form</Button>
        {/if}
      </Form>
    {/if}
    <output aria-label={`Form theme value ${id}`}>{model.values.title}</output>
    <output aria-label={`Form theme submissions ${id}`}>{submissions}</output>
    <output aria-label={`Form theme submitted ${id}`}>{submitted}</output>
  </div>
</ConfigProvider>
