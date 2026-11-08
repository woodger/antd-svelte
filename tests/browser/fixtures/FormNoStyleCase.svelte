<script module lang="ts">
  export interface FormNoStyleSample {
    id: string;
    noStyle?: boolean;
    hidden?: boolean;
    nameless?: boolean;
    standalone?: boolean;
    decorated?: boolean;
    required?: boolean;
    touched?: boolean;
    validating?: boolean;
    helpFalse?: boolean;
    errors?: string[];
    warnings?: string[];
    parentNamed?: boolean;
    parentErrors?: string[];
    status?: import('antd-svelte').FormValidateStatus;
    parentStatus?: import('antd-svelte').FormValidateStatus;
    pair?: boolean;
    async?: boolean;
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { Button, ConfigProvider, Form, FormItem, Input, createForm } from 'antd-svelte';
  import FormStatusReadout from './FormStatusReadout.svelte';

  let { sample, initialMetadata = false }: {
    sample: FormNoStyleSample;
    initialMetadata?: boolean;
  } = $props();
  const model = createForm(untrack(() => ({
    initialValues: { first: 'Alpha', second: 'Beta', group: 'Group' },
    rules: initialMetadata ? { first: [{}], second: [{}], group: [{}] } : undefined
  })));
  let noStyle = $state(untrack(() => sample.noStyle !== false));
  let helpFalse = $state(untrack(() => !!sample.helpFalse));
  let show = $state(true);
  let outcome = $state('ready');
  let release: ((value: string | undefined) => void) | undefined;

  function seed() {
    if (sample.pair) {
      model.setFields([
        { name: 'second', errors: ['Second error'] }, { name: 'first', errors: ['First error'] }
      ]);
      return;
    }
    model.setFields([
      { name: 'group', errors: sample.parentErrors ?? [] },
      { name: 'first', errors: sample.errors ?? [], warnings: sample.warnings ?? [],
        ...(sample.touched !== undefined ? { touched: sample.touched } : {}),
        ...(sample.validating !== undefined ? { validating: sample.validating } : {}) }
    ]);
  }

  untrack(() => { if (initialMetadata) seed(); });
  $effect(() => { untrack(seed); });

  async function validate(silent: boolean) {
    outcome = 'pending';
    try {
      await model.validateFields(['first'], { validateOnly: silent });
      outcome = 'success';
    } catch {
      outcome = 'invalid';
    }
  }
</script>

{#snippet field(scope: 'first' | 'second')}
  <FormItem name={scope === 'first' && sample.nameless ? undefined : scope}
    noStyle={scope === 'first' ? noStyle : true} hidden={sample.hidden}
    validateStatus={sample.status} class={scope === 'first' ? 'capture-child' : undefined}
    label={sample.decorated ? 'Ignored label' : undefined}
    help={helpFalse ? false : sample.decorated ? 'Ignored help' : undefined}
    extra={sample.decorated ? 'Ignored extra' : undefined}
    style={sample.decorated ? 'margin-bottom:77px' : undefined}
    rules={sample.required ? [{ required: true, message: 'Required' }]
      : sample.async ? [{ validator: () => new Promise<string | undefined>(resolve => {
        release = resolve;
      }) }] : undefined}>
    <FormStatusReadout {scope}>
      <Input id={`${scope}-control`} aria-label={scope}
        value={scope === 'first' && sample.nameless ? undefined : model.values[scope]}
        onValueChange={(value) => {
          if (!(scope === 'first' && sample.nameless)) model.setFieldValue(scope, value);
        }} />
    </FormStatusReadout>
  </FormItem>
{/snippet}

<div class="no-style-case">
  <button type="button" onclick={() => { noStyle = !noStyle; }}>Toggle no style layout</button>
  <button type="button" onclick={() => { helpFalse = !helpFalse; }}>Toggle no style help</button>
  <button type="button" onclick={() => { show = !show; }}>Toggle no style field</button>
  <button type="button" onclick={() => model.resetFields(['first'])}>Reset no style field</button>
  <button type="button" onclick={() => {
    model.resetFields(['first']);
    document.getElementById('no-style-owner-focus')?.focus();
  }}>Reset no style and move focus</button>
  <input id="no-style-owner-focus" aria-label="No style owner focus" />
  <button type="button" onclick={() => { void validate(true); }}>Validate no style silently</button>
  <button type="button" onclick={() => { void validate(false); }}>Validate no style visibly</button>
  <button type="button" onclick={() => release?.('Async error')}>Release no style validation</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Form form={model}>
      {#if sample.standalone}
        {#if show}{@render field('first')}{/if}
      {:else}
        <FormItem name={sample.parentNamed ? 'group' : undefined}
          class="capture-parent" label="Parent" htmlFor="first-control"
          validateStatus={sample.parentStatus}>
          <div><FormStatusReadout scope="parent" />{#if show}{@render field('first')}{/if}
            {#if sample.pair}{@render field('second')}{/if}</div>
        </FormItem>
      {/if}
      <Button htmlType="submit">Submit no style form</Button>
    </Form>
  </ConfigProvider>
  <output aria-label="No style validation">{outcome}</output>
</div>
