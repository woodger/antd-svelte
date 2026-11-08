<script lang="ts">
  import { ConfigProvider, Form, FormItem, Input, createForm } from 'antd-svelte';
  import Counter from './FormExplanationCounter.svelte';

  const fields = ['a', 'b'] as const;
  const model = createForm({ initialValues: { a: 'Alpha', b: 'Beta' } });
</script>

<section id="form-explanation-reset-fixture" aria-label="Form explanation reset">
  <button type="button" onclick={() => model.resetFields(['a'])}>Reset explanations for a</button>
  <button type="button" onclick={() => model.resetFields()}>Reset all explanations</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Form form={model}>
      {#each fields as name (name)}
        {#snippet caption()}<Counter id={`${name}-label`} />{/snippet}
        {#snippet extra()}<Counter id={`${name}-extra`} />{/snippet}
        {#snippet icon()}<Counter id={`${name}-tooltip`} />{/snippet}
        <div data-explanation-field={name}>
          <FormItem {name} label={caption} {extra} tooltip={{ title: 'Details', icon }}>
            <Input value={model.values[name]} aria-label={`${name} control`}
              onValueChange={(value) => model.setFieldValue(name, value)} />
          </FormItem>
        </div>
      {/each}
    </Form>
  </ConfigProvider>
</section>
