<script module lang="ts">
  import type { NamePath } from 'antd-svelte';

  export interface FormInitialSample {
    id: string;
    name?: NamePath;
    initialValue?: unknown;
    defaults?: Record<string, unknown>;
    duplicate?: boolean;
    parentInitial?: boolean;
    childHidden?: boolean;
    nameless?: boolean;
    list?: boolean;
    listInitial?: readonly unknown[];
    show?: boolean;
    preset?: boolean;
    stored?: unknown;
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { Form, FormItem, FormList, Input, createForm } from 'antd-svelte';

  let { sample }: { sample: FormInitialSample } = $props();
  const model = createForm<Record<string, unknown>>({
    initialValues: untrack(() => sample.defaults ?? {})
  });
  let initialValue = $state.raw(untrack(() => sample.initialValue));
  let show = $state(untrack(() => sample.show !== false));
  let showChild = $state(untrack(() => !sample.childHidden));
  let path = $derived(sample.name ?? 'name');
  let selectedPath = $derived(sample.list ? ['people', 0, 'name'] : path);

  untrack(() => {
    if (sample.preset) model.setFieldValue(path, sample.stored);
  });

  function fullPath(name: NamePath): NamePath {
    const parts = typeof name === 'string' || typeof name === 'number' ? [name] : name;

    return sample.list ? ['people', ...parts] : name;
  }
</script>

{#snippet field(name: NamePath, value: unknown, index: number)}
  <FormItem name={sample.nameless ? undefined : name} initialValue={value} label={`Field ${index}`}>
    <Input aria-label={`Field ${index}`}
      value={sample.nameless ? undefined : String(model.getFieldValue(fullPath(name)) ?? '')}
      onValueChange={(value) => {
        if (!sample.nameless) model.setFieldValue(fullPath(name), value);
      }} />
  </FormItem>
{/snippet}

<div class="capture-initial">
  <button type="button" onclick={() => model.setFieldValue(selectedPath, 'Edited')}>
    Edit initial model
  </button>
  <button type="button" onclick={() => model.resetFields([selectedPath])}>Reset selected initial</button>
  <button type="button" onclick={() => model.resetFields()}>Reset all initial</button>
  <button type="button" onclick={() => { initialValue = 'Second'; }}>Update initial default</button>
  <button type="button" onclick={() => { initialValue = 'Added later'; }}>Add initial default</button>
  <button type="button" onclick={() => { show = true; }}>Mount initial field</button>
  <button type="button" onclick={() => { showChild = true; }}>Mount initial child</button>
  <Form form={model}>
    {#if show}
      {#if sample.list}
        <FormList name="people" initialValue={sample.listInitial}>
          {#snippet children(fields)}
            {#each fields as item (item.key)}
              {@render field([item.name, 'name'], initialValue, item.key)}
            {/each}
          {/snippet}
        </FormList>
      {:else if sample.parentInitial}
        <FormItem name="profile" initialValue={{ name: 'Parent' }}>
          <div>{#if showChild}{@render field(path, initialValue, 0)}{/if}</div>
        </FormItem>
      {:else}
        {@render field(path, initialValue, 0)}
        {#if sample.duplicate}{@render field(path, 'Other', 1)}{/if}
      {/if}
    {/if}
  </Form>
  <output aria-label="Initial field metadata">{JSON.stringify({
    store: model.getFieldsValue(true), values: model.getFieldsValue(),
    touched: model.isFieldsTouched()
  })}</output>
</div>
