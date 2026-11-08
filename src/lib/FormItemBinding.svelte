<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { provideFormField, type FormFieldContext } from './form-context';

  let { field, children }: { field: FormFieldContext; children: Snippet } = $props();
  // Владелец context постоянен; значения props/model читаются его reactive getters.
  provideFormField(untrack(() => field));
</script>

{@render children()}
