<script lang="ts">
  import { Button, Form, FormErrorList, FormItem, FormList, Input, createForm } from 'antd-svelte';

  let holdName = $state(false);
  const form = createForm({
    initialValues: { name: '' },
    rules: { name: [
      { required: true, warningOnly: true, message: 'Name recommended' },
      { warningOnly: true, validator: () => holdName ? validatePending() : undefined }
    ] }
  });
  const mixed = createForm({ initialValues: { name: '' } });
  const list = createForm({ initialValues: { users: [] as string[] } });
  let submitted = $state('');
  let rejected = $state('');
  let listSubmitted = $state('');
  let showPending = $state(false);
  let pending: ((message: string) => void)[] = [];
  let pendingCount = $state(0);
  let validation = $state('');

  function validatePending() {
    return new Promise<string>((resolve) => {
      pending.push(resolve);
      pendingCount = pending.length;
    });
  }

  async function validate() {
    validation = 'pending';
    try {
      await form.validateFields();
      validation = 'complete';
    } catch (error) {
      validation = error instanceof Error && 'outOfDate' in error && error.outOfDate
        ? 'outdated' : 'failed';
    }
  }

  function completePending() {
    const requests = pending;
    pending = [];
    pendingCount = 0;
    for (const complete of requests) complete('Delayed warning');
  }
</script>

<section id="form-warnings-fixture" aria-label="Form warnings">
  <Form id="warning-form" {form} onFinish={(values) => { submitted = JSON.stringify(values); }}>
    <FormItem name="name" label="Recommended name" help="Optional name">
      <Input value={form.values.name} onValueChange={(value) => form.setFieldValue('name', value)} />
    </FormItem>
    {#if showPending}
      <FormItem name="detail" label="Pending detail" rules={[{
        warningOnly: true, validator: validatePending
      }]}>
        <Input />
      </FormItem>
    {/if}
    <Button htmlType="submit">Submit warnings</Button>
    <Button htmlType="reset">Reset warnings</Button>
  </Form>
  <button onclick={validate}>Validate warnings</button>
  <label><input type="checkbox" bind:checked={holdName} />Hold name warning</label>
  <button onclick={() => { showPending = !showPending; }}>Toggle pending field</button>
  <button onclick={completePending}>Complete warnings</button>
  <output aria-label="Warning fields">{JSON.stringify(form.getFieldsError(['name']))}</output>
  <output aria-label="Submitted warnings">{submitted}</output>
  <output aria-label="Pending warning count">{pendingCount}</output>
  <output aria-label="Warning validation">{validation}</output>
  <output aria-label="Detail warnings">{JSON.stringify(form.getFieldWarning('detail'))}</output>

  <Form form={mixed} id="mixed-warning-form" onFinishFailed={(error) => {
    rejected = JSON.stringify(error.errorFields);
  }}>
    <FormItem name="name" label="Required name" rules={[
      { required: true, message: 'Name required' },
      { warningOnly: true, validator: () => 'Name recommended' }
    ]}>
      <Input value={mixed.values.name} onValueChange={(value) => mixed.setFieldValue('name', value)} />
    </FormItem>
    <Button htmlType="submit">Submit mixed rules</Button>
  </Form>
  <output aria-label="Mixed warning fields">{JSON.stringify(mixed.getFieldsError())}</output>
  <output aria-label="Rejected mixed fields">{rejected}</output>

  <Form form={list} id="list-warning-form" onFinish={(values) => {
    listSubmitted = JSON.stringify(values);
  }}>
    <FormList name="users" rules={[{
      warningOnly: true,
      validator: (value) => Array.isArray(value) && !value.length ? 'Add a user' : undefined
    }]}>
      {#snippet children(fields, operation, meta)}
        {#each fields as field (field.key)}<div>User {field.name}</div>{/each}
        <button type="button" onclick={() => operation.add('Anna')}>Add warning user</button>
        <output aria-label="List warning meta">{JSON.stringify(meta)}</output>
        <div class="ant-form-item"><FormErrorList errors={meta.errors} warnings={meta.warnings} /></div>
      {/snippet}
    </FormList>
    <Button htmlType="submit">Submit warning list</Button>
    <Button htmlType="reset">Reset warning list</Button>
  </Form>
  <output aria-label="Submitted warning list">{listSubmitted}</output>
  <output aria-label="List warning fields">{JSON.stringify(list.getFieldsError())}</output>
</section>
