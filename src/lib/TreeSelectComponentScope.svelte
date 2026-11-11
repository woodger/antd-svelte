<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideFormField } from './form-context';

  let { children }: { children: Snippet } = $props();
  // Внутренний редактор не становится вторым successful control выбранного поля.
  // Status/feedback, Form и остальные контексты продолжают наследоваться.
  provideFormField(undefined);
</script>

{@render children()}
