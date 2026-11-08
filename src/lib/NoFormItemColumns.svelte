<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideForm, useForm, type FormContext } from './form-context';

  let { children }: { children: Snippet } = $props();
  const parent = useForm();

  if (parent) {
    // Source очищает только колонки, сохраняя реактивный контекст модели и прочие defaults.
    const context: FormContext = Object.create(parent, {
      labelCol: { value: undefined },
      wrapperCol: { value: undefined }
    });
    provideForm(context);
  }
</script>

{@render children()}
