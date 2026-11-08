<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { provideFormItemStatus, type FormItemStatus } from './form-item-status';

  let { value, children }: { value: FormItemStatus; children: Snippet } = $props();
  provideFormItemStatus(untrack(() => value));
</script>

{@render children()}
