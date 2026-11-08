<script lang="ts">
  import { untrack } from 'svelte';
  import {
    Button, ConfigProvider, Form, FormItem, Input, Select, Tag, createForm
  } from 'antd-svelte';
  import reference from './ant-design-form-disabled-reference.json';

  interface Sample {
    id: string;
    disabled?: boolean;
    global?: boolean;
    child?: boolean;
    local?: boolean;
    nested?: boolean;
    nestedDisabled?: boolean;
  }

  type Values = {
    input: string;
    select: 'a' | 'b' | undefined;
  };

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  const model = createForm<Values>({ initialValues: { input: 'Draft', select: 'a' } });
  const inner = createForm<Values>({ initialValues: { input: 'Draft', select: 'a' } });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(
    reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample
  );
  let freeValue = $state<'a' | 'b' | undefined>('a');
  let freeText = $state('Draft');
  let pending = $state(false);
  let release: (() => void) | undefined;
</script>

{#snippet controls(named: boolean)}
  <div data-disabled-scope={named ? 'field' : 'free'}>
    <div data-disabled-control="input">
      {#if named}
        <FormItem name="input"><Input aria-label="Bound input" disabled={sample.local}
          value={sample.nested ? inner.values.input : model.values.input}
          onValueChange={(value) => (sample.nested ? inner : model).setFieldValue('input', value)} /></FormItem>
      {:else}<Input aria-label="Input" disabled={sample.local} bind:value={freeText} />{/if}
    </div>
    <div data-disabled-control="select">
      {#if named}
        <FormItem name="select"><Select aria-label="Bound select" disabled={sample.local}
          options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
          value={sample.nested ? inner.values.select : model.values.select}
          onValueChange={(value) => (sample.nested ? inner : model).setFieldValue('select', value)} /></FormItem>
      {:else}<Select aria-label="Free select" disabled={sample.local}
        options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
        bind:value={freeValue} name="free-select" />{/if}
    </div>
    <div data-disabled-control="button">
      {#if named}<FormItem name="button"><Button disabled={sample.local}>Bound action</Button></FormItem>
      {:else}<Button disabled={sample.local}>Action</Button>{/if}
    </div>
    <div data-disabled-control="tag">
      {#if named}<FormItem name="tag"><Tag disabled={sample.local} closable>Tag</Tag></FormItem>
      {:else}<Tag disabled={sample.local} closable>Tag</Tag>{/if}
    </div>
  </div>
{/snippet}

{#snippet content()}
  <ConfigProvider componentDisabled={sample.child}>
    {@render controls(false)}{@render controls(true)}
  </ConfigProvider>
{/snippet}

<section id="form-disabled-fixture" aria-label="Form disabled inheritance">
  <label>Form disabled sample
    <select bind:value={selected}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    release?.();
    pending = false;
  }}>Release disabled submission</button>
  <ConfigProvider componentDisabled={sample.global} theme={{ cssVar: {}, token: { motion: false } }}>
    <Form form={model} disabled={sample.disabled} onFinish={() => new Promise<void>((resolve) => {
      release = resolve;
      pending = true;
    })}>
      {#if sample.nested}<Form form={inner} component={false} disabled={sample.nestedDisabled}>
        {@render content()}
      </Form>{:else}{@render content()}{/if}
      <Input aria-label="Explicit enabled input" disabled={false} defaultValue="Allowed" />
      <Button htmlType="submit">Submit disabled form</Button>
    </Form>
  </ConfigProvider>
  <output aria-label="Disabled selections">{freeValue}</output>
  <output aria-label="Disabled submission">{pending ? 'pending' : 'ready'}</output>
</section>
