<script lang="ts">
  import { untrack } from 'svelte';
  import { Button, Form, FormItem, FormList, Input, createForm } from 'antd-svelte';

  let { sparse = false, rootId = 'form-list-fixture' }: {
    sparse?: boolean;
    rootId?: string;
  } = $props();
  const users: { name: string }[] = untrack(() =>
    sparse ? [] : [{ name: 'Anna' }, { name: 'Bob' }]
  );
  let form = $state(createForm({ initialValues: { users } }));
  untrack(() => {
    if (sparse) {
      const users: { name: string }[] = [];
      users[2] = { name: 'Sparse row' };
      form.setFieldValue('users', users);
    }
  });
  let submitted = $state('');
  let errors = $state('');
  let hold = $state(false);
  let pending: ((error: string | void) => void)[] = [];
  let pendingCount = $state(0);

  function validateName() {
    if (!hold) return;

    return new Promise<string | void>((resolve) => {
      pending.push(resolve);
      pendingCount = pending.length;
    });
  }

  function completeValidation() {
    const validations = pending;
    pending = [];
    pendingCount = 0;
    for (const resolve of validations) resolve('Name rejected');
  }
</script>

<section id={rootId} aria-label="Form list">
  <Form
    {form}
    onFinish={(values) => { submitted = JSON.stringify(values); }}
    onFinishFailed={(error) => { errors = JSON.stringify(error.errorFields); }}
  >
    <FormList
      name="users"
      initialValue={[{ name: 'Ignored default' }]}
      rules={[{ validator: (value) => Array.isArray(value) && value.length
        ? undefined : 'At least one user' }]}
    >
      {#snippet children(fields, operation, meta)}
        <div aria-label="User rows">
          {#each fields as field (field.key)}
            <div data-list-key={field.key} data-list-index={field.name}>
              <FormItem
                name={[field.name, 'name']}
                label={`User ${field.key}`}
                htmlFor={`user-${field.key}`}
                rules={[{ required: true, message: 'Name required' }, { validator: validateName }]}
              >
                <Input
                  value={form.values.users[field.name]?.name ?? ''}
                  onValueChange={(value) => form.setFieldValue(['users', field.name, 'name'], value)}
                />
              </FormItem>
              <button type="button" onclick={() => operation.remove(field.name)}>
                Remove user {field.key}
              </button>
              <button type="button" onclick={() => operation.move(field.name, 0)}>
                Move user {field.key} to first
              </button>
            </div>
          {/each}
        </div>
        {#each meta.errors as error}<p role="alert">{error}</p>{/each}
        <button type="button" onclick={() => operation.add({ name: 'Cora' }, 1)}>Insert Cora</button>
        <button type="button" onclick={() => operation.move(2, 0)}>Move last to first</button>
        <button type="button" onclick={() => operation.remove([1, 1, 99])}>Remove indices</button>
        <button type="button" onclick={() => operation.add({ name: 'Dina' }, 99)}>Append Dina</button>
        <button type="button" onclick={() => operation.move(-1, 0)}>Ignore invalid move</button>
        <button type="button" onclick={() => operation.move(0.5, 1)}>Ignore fractional move</button>
        <button type="button" onclick={() => operation.add({ name: 'Hana' })}>Append Hana</button>
        <button type="button" onclick={() => operation.add()}>Append empty row</button>
        <button type="button" onclick={() => operation.remove(fields.map((field) => field.name))}>
          Remove all users
        </button>
        <output aria-label="List fields">{JSON.stringify(fields)}</output>
        <output aria-label="List errors">{JSON.stringify(meta.errors)}</output>
      {/snippet}
    </FormList>
    <Button htmlType="submit">Submit list</Button>
    <Button htmlType="reset">Reset list</Button>
  </Form>
  <button onclick={() => form.setFieldValue('users', [{ name: 'Evan' }, { name: 'Fran' }])}>
    Replace list
  </button>
  <button onclick={() => form.setFieldValue('users', [{ name: 'Gina' }])}>Shrink list</button>
  <button onclick={() => form.setFieldsValue({ users: [
    { name: 'Ivy' }, { name: 'Juno' }, { name: 'Kira' }, { name: 'Lara' }, { name: 'Mira' }
  ] })}>Grow list externally</button>
  <button onclick={() => {
    form = createForm({ initialValues: { users: [{ name: 'Replacement model' }] } });
  }}>Replace list model</button>
  <label><input type="checkbox" bind:checked={hold} /> Hold list validation</label>
  <button onclick={completeValidation}>Reject pending names</button>
  <button onclick={() => {
    pending.pop()?.();
    pendingCount = pending.length;
  }}>Accept latest name</button>
  <button onclick={() => {
    pending.shift()?.('Old name rejected');
    pendingCount = pending.length;
  }}>Reject oldest name</button>
  <output aria-label="List values">{JSON.stringify(form.values)}</output>
  <output aria-label="Submitted list">{submitted}</output>
  <output aria-label="List error fields">{errors}</output>
  <output aria-label="Pending name validations">{pendingCount}</output>
</section>
