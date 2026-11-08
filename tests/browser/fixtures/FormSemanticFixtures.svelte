<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, FormList, FormErrorList, Input, createForm
  } from 'antd-svelte';
  import reference from './ant-design-form-semantic-reference.json';
  import { formSemanticSettings, type FormSemanticSettings } from './form-semantic-settings';

  interface Sample {
    id: string;
    parent?: FormSemanticSettings;
    child?: FormSemanticSettings;
    form?: FormSemanticSettings;
    disabled?: boolean;
    helpOnly?: boolean;
    nested?: boolean;
    nestedForm?: boolean;
  }

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Alpha', inner: '', list: [] } });
  const inner = createForm({ initialValues: { inner: '' } });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample as Sample);

  async function choose(id: string) {
    selected = id;
    await tick();
    model.setFields([{
      name: 'name', errors: sample.helpOnly ? [] : ['Error'],
      warnings: sample.helpOnly ? [] : ['Warning']
    }]);
  }

  onMount(() => { void choose(selected); });
</script>

{#snippet innerField()}
  <FormItem name="inner" label="Inner"><Input /></FormItem>
{/snippet}

<section id="form-semantic-fixture" aria-label="Form semantic styles">
  <label>Form semantic sample
    <select value={selected} onchange={(event) => choose(event.currentTarget.value)}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => {
    model.setFields([{
      name: 'name', errors: ['Error'], warnings: ['Warning'], touched: true
    }]);
  }}>Seed semantic metadata</button>
  <ConfigProvider componentDisabled={sample.disabled} theme={{ cssVar: {}, token: { motion: false } }}
    form={formSemanticSettings(sample.parent, 'context')}>
    <ConfigProvider form={formSemanticSettings(sample.child, 'child')}>
      <div data-semantic-case style="width:360px">
        <Form form={model} layout="vertical" {...formSemanticSettings(sample.form, 'local')}>
          <div data-semantic-field>
            <FormItem name="name" label="Name" extra="Extra" help={sample.helpOnly ? 'Help' : undefined}>
              {#if sample.nested}
                {@render innerField()}
              {:else if sample.nestedForm}
                <Form form={inner} component={false} layout="vertical">{@render innerField()}</Form>
              {:else}
                <Input value={model.values.name}
                  onValueChange={(value) => model.setFieldValue('name', value)} />
              {/if}
            </FormItem>
          </div>
          <div data-semantic-list>
            <FormItem name="listMessages">
              <FormList name="list">
                <FormErrorList class="owner-standalone" errors={['List error']} warnings={['List warning']} />
              </FormList>
            </FormItem>
          </div>
        </Form>
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Semantic metadata">{JSON.stringify({
    values: model.values, fields: model.getFieldsError(), touched: model.isFieldTouched('name')
  })}</output>
</section>
