<script lang="ts">
  import { Form, FormItem, Input, createForm } from 'antd-svelte';

  let { prefixCls }: { prefixCls?: string } = $props();
  const form = createForm({ initialValues: { draft: 'Draft' } });
</script>

<Form {form} {prefixCls} component={false}><FormItem {prefixCls} name="draft" noStyle><Input value={form.values.draft} /></FormItem></Form>
