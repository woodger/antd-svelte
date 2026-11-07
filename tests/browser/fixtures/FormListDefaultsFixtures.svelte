<script lang="ts">
  import { Button, Form, FormItem, FormList, Input, createForm } from 'antd-svelte';

  const form = createForm<{ users?: { name: string }[] }>({ initialValues: {} });
  const empty = createForm({ initialValues: { users: [] as { name: string }[] } });
  let shown = $state(true);
  let initialValue = $state([{ name: 'List default' }]);
</script>

<section id="form-list-defaults-fixture" aria-label="Form list defaults">
  <Form {form}>
    {#if shown}
      <FormList name="users" {initialValue}>
        {#snippet children(fields, operation)}
          {#each fields as field (field.key)}
            <FormItem name={[field.name, 'name']} label="Default user">
              <Input
                value={form.values.users?.[field.name]?.name ?? ''}
                onValueChange={(value) => form.setFieldValue(['users', field.name, 'name'], value)}
              />
            </FormItem>
          {/each}
          <button type="button" onclick={() => operation.add({ name: 'Added default row' })}>
            Add default row
          </button>
        {/snippet}
      </FormList>
    {/if}
    <Button htmlType="reset">Reset defaults</Button>
  </Form>
  <Form form={empty}>
    <FormList name="users" initialValue={[{ name: 'Ignored default' }]}>
      {#snippet children(fields)}
        <output aria-label="Empty default fields">{fields.length}</output>
      {/snippet}
    </FormList>
  </Form>
  <button onclick={() => { shown = !shown; }}>Toggle default list</button>
  <button onclick={() => { initialValue = [{ name: 'Updated default' }]; }}>
    Replace list default
  </button>
  <output aria-label="Default list values">{JSON.stringify(form.values)}</output>
</section>
