<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideFormField } from './form-context';
  import { provideCompact } from './space-compact-context';

  let { popupRender, menu }: { popupRender: Snippet<[Snippet]>; menu: Snippet; } = $props();
  provideFormField(undefined);
  provideCompact(null);
</script>

{@render popupRender(menu)}
