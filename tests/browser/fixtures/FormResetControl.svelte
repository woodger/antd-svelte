<script lang="ts">
  import { onMount } from 'svelte';
  import { Input, type FormInstance, type NamePath } from 'antd-svelte';

  let { form, name, tag, onMounted }: {
    form: FormInstance<Record<string, unknown>>;
    name: NamePath;
    tag: string;
    onMounted(tag: string): void;
  } = $props();

  onMount(() => { onMounted(tag); });
</script>

<div data-reset-probe={tag}>
  <Input data-reset-main={tag} aria-label={`Bound ${tag}`}
    value={String(form.getFieldValue(name) ?? '')}
    onValueChange={(value) => form.setFieldValue(name, value)} />
  <input data-reset-local={tag} aria-label={`Local ${tag}`} value="Local" />
</div>
