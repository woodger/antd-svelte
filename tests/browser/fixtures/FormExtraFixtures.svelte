<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm, type RenderEmptyContent
  } from 'antd-svelte';
  import reference from './ant-design-form-extra-reference.json';

  let { initialMode = 'missing' }: { initialMode?: string } = $props();
  const form = createForm({ initialValues: { name: 'Anna' } });
  const content: Record<string, RenderEmptyContent> = {
    missing: undefined, null: null, false: false, empty: '', zero: 0, true: true, space: ' ',
    array: [], nested: [null, false, 0, 'Text'], text: 'Extra text',
    'with-messages': 'Persistent extra', 'messages-without-extra': false,
    'help-and-extra': 'Extra text'
  };
  let mode = $state(untrack(() => initialMode));
  let richText = $state('Read more');
  let customDescription = $state(false);
  let extra = $derived(mode === 'rich' ? rich : content[mode]);
  let help = $derived(mode === 'help-and-extra' ? 'Help text' : undefined);

  function choose(id: string) {
    mode = id;
    if (id === 'with-messages') {
      form.setFields([{ name: 'name', errors: ['Error'], warnings: ['Warning'] }]);
    } else if (id !== 'messages-without-extra') {
      form.setFields([{ name: 'name', errors: [], warnings: [] }]);
    }
  }
</script>

{#snippet rich()}<a href="#more">{richText}</a>{/snippet}

<section id="form-extra-fixture" data-extra-case={mode} aria-label="Form extra">
  {#each reference.cases as sample}
    <button type="button" onclick={() => choose(sample.id)}>Extra {sample.id}</button>
  {/each}
  <button type="button" onclick={() => { richText = 'Updated extra'; }}>Update extra snippet</button>
  <button type="button" onclick={() => { customDescription = !customDescription; }}>
    Toggle external description
  </button>
  <p id="extra-external">External description</p>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Form {form}>
      <FormItem name="name" label="Name" {extra} {help}>
        <Input value={form.values.name} onValueChange={(value) => form.setFieldValue('name', value)}
          aria-describedby={customDescription ? 'extra-external' : undefined} />
      </FormItem>
    </Form>
  </ConfigProvider>
  <output data-extra-meta aria-label="Extra metadata">{JSON.stringify({
    errors: form.getFieldError('name'), warnings: form.getFieldWarning('name')
  })}</output>
</section>
