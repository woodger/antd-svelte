<script lang="ts">
  import { Form, FormItem, Input, createForm } from 'antd-svelte';

  const first = createForm({ initialValues: { field: '' }, rules: { field: [{ required: true }] } });
  const second = createForm({ initialValues: { field: '' }, rules: { field: [{ required: true }] } });
  let useSecond = $state(false);
  let shown = $state(true);
  let active = $derived(useSecond ? second : first);
  let report = $state('');

  async function validate() {
    await Promise.all([first, second].map(form => form.validateFields().catch(() => {})));
    report = JSON.stringify([first.getFieldError('field'), second.getFieldError('field')]);
  }
</script>

<section aria-label="Template lifecycle cases">
  {#if shown}
    <Form form={active} component={false} validateMessages={{ required: 'Mounted ${label}' }}>
      <FormItem name="field" label="Field label">
        <Input value={active.values.field} readonly />
      </FormItem>
    </Form>
  {/if}
  <button type="button" onclick={() => { useSecond = !useSecond; }}>Switch template model</button>
  <button type="button" onclick={() => { shown = !shown; }}>Toggle template Form</button>
  <button type="button" onclick={() => { void validate(); }}>Validate retained models</button>
  <output aria-label="Template lifecycle report">{report}</output>
</section>
