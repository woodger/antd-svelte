<script lang="ts">
  import { Form, FormItem, FormList, Input, createForm, FormValidationError } from 'antd-svelte';
  import { snapshotFormValues } from './form-value-projection';

  type Mode = 'fields' | 'empty' | 'list' | 'empty-list';
  let mode = $state<Mode>('fields');
  let form = $state(createModel('fields'));
  let shown = $state(true);
  let pending = $state<{ id: number; complete(message: string): void }[]>([]);
  let finished = $state<number[]>([]);
  let nextPending = 0;
  let nextRequest = 0;

  function createModel(mode: Mode) {
    return createForm<Record<string, unknown>>({ initialValues: mode === 'list'
      ? { people: [{ name: 'Anna', extra: 'Hidden' }, { name: 'Bob' }] }
      : mode === 'empty-list' ? { people: [] } : {
        user: { name: 'Anna', role: 'Writer', extra: 'Hidden' }, 'user.name': 'Literal',
        rows: [{ name: 'First', extra: 'Hidden' }], unbound: 'Hidden'
      }
    });
  }

  function choose(next: Mode) {
    mode = next;
    form = createModel(next);
    shown = true;
    pending = [];
    finished = [];
    nextPending = 0;
    nextRequest = 0;
  }

  function hold() {
    return new Promise<string>((complete) => { pending.push({ id: nextPending++, complete }); });
  }

  async function validate(validateOnly: boolean) {
    const id = nextRequest++;
    try {
      await form.validateFields([['user', 'name']], { validateOnly });
    } catch (error) {
      if (!(error instanceof FormValidationError)) throw error;
    }
    finished.push(id);
  }

  function complete(id: number) {
    pending.find((entry) => entry.id === id)?.complete('Name rejected');
    pending = pending.filter((entry) => entry.id !== id);
  }
</script>

<section id="form-get-fields-value-fixture" aria-label="Form value projection">
  <Form {form}>
    {#if mode === 'fields'}
      {#if shown}
        <FormItem name={['user', 'name']} label="Projected name" rules={[
          { validator: hold }, { warningOnly: true, validator: () => 'Heads up' }
        ]}>
          <Input value={String(form.getFieldValue(['user', 'name']) ?? '')}
            onValueChange={(value) => form.setFieldValue(['user', 'name'], value)} />
        </FormItem>
      {/if}
      <FormItem name="user.name" label="Projected literal">
        <Input value={String(form.getFieldValue('user.name') ?? '')} />
      </FormItem>
      <FormItem name={['rows', 0, 'name']} label="Projected row">
        <Input value={String(form.getFieldValue(['rows', 0, 'name']) ?? '')} />
      </FormItem>
    {:else if mode === 'list' || mode === 'empty-list'}
      <FormList name="people">
        {#snippet children(fields)}
          {#if shown}
            {#each fields as field (field.key)}
              <FormItem name={[field.name, 'name']} label={`Projected person ${field.name}`}>
                <Input value={String(form.getFieldValue(['people', field.name, 'name']) ?? '')} />
              </FormItem>
            {/each}
          {/if}
        {/snippet}
      </FormList>
    {/if}
  </Form>
  <button onclick={() => form.touchField('user.name')}>Touch projection literal</button>
  <button onclick={() => form.touchField('unbound')}>Touch projection unbound</button>
  <button onclick={() => form.touchField(['people', 0, 'name'])}>Touch projection row</button>
  <button onclick={() => validate(true)}>Validate projection silently</button>
  <button onclick={() => validate(false)}>Validate projection normally</button>
  <button onclick={() => form.setFieldValue('unbound', 'Changed')}>Update projection store</button>
  <button onclick={() => { shown = false; }}>Hide projected fields</button>
  <button onclick={() => form.resetFields()}>Reset projected fields</button>
  <button onclick={() => choose('fields')}>Show projection fields</button>
  <button onclick={() => choose('empty')}>Show empty projection</button>
  <button onclick={() => choose('list')}>Show projection list</button>
  <button onclick={() => choose('empty-list')}>Show empty projection list</button>
  {#each pending as entry (entry.id)}
    <button onclick={() => complete(entry.id)}>Complete projection {entry.id}</button>
  {/each}
  <output aria-label="Projected snapshot">{JSON.stringify(snapshotFormValues(form))}</output>
  <output aria-label="Projection pending">{JSON.stringify(pending.map(({ id }) => id))}</output>
  <output aria-label="Projection finished">{JSON.stringify(finished)}</output>
</section>
