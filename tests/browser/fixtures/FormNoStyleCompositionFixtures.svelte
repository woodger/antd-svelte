<script lang="ts">
  import { untrack } from 'svelte';
  import { Form, FormItem, FormList, Input, createForm } from 'antd-svelte';

  let { list = false }: { list?: boolean } = $props();
  const model = createForm(untrack(() => ({
    initialValues: {
      first: 'First', second: 'Second', third: 'Third',
      users: [{ name: 'Anna' }, { name: 'Bob' }]
    }
  })));

  $effect(() => {
    untrack(() => model.setFields(list ? [
      { name: ['users', 1, 'name'], errors: ['Bob error'] },
      { name: ['users', 0, 'name'], errors: ['Anna error'] }
    ] : [
      { name: 'first', errors: ['First error'] },
      { name: 'second', warnings: ['Second warning'] },
      { name: 'third', errors: ['Third error'] }
    ]));
  });
</script>

<Form form={model}>
  {#if list}
    <FormItem class="no-style-list-parent" label="Users">
      <FormList name="users">
        {#snippet children(fields, operation)}
          <div>
            {#each fields as field (field.key)}
              <div data-no-style-key={field.key}>
                <FormItem name={[field.name, 'name']} noStyle>
                  <Input aria-label={`User ${field.key}`}
                    value={model.values.users[field.name]?.name ?? ''}
                    onValueChange={value => model.setFieldValue(['users', field.name, 'name'], value)} />
                </FormItem>
                <button type="button" onclick={() => operation.remove(field.name)}>
                  Remove no style user {field.key}
                </button>
                <button type="button" onclick={() => operation.move(field.name, 0)}>
                  Move no style user {field.key} to first
                </button>
              </div>
            {/each}
          </div>
          <button type="button" onclick={() => operation.add({ name: 'Cora' }, 0)}>
            Insert no style user
          </button>
        {/snippet}
      </FormList>
    </FormItem>
  {:else}
    <FormItem class="no-style-outer" label="Outer">
      <div>
        <FormItem name="first" noStyle>
          <div>
            <Input aria-label="Nested first" value={model.values.first} />
            <FormItem name="second" noStyle>
              <Input aria-label="Nested second" value={model.values.second} />
            </FormItem>
          </div>
        </FormItem>
        <FormItem class="no-style-inner" label="Inner">
          <FormItem name="third" noStyle>
            <Input aria-label="Nested third" value={model.values.third} />
          </FormItem>
        </FormItem>
      </div>
    </FormItem>
  {/if}
</Form>
