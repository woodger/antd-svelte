<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideFormField } from './form-context';
  import { provideFormItemStatus, useFormItemStatusContext } from './form-item-status';

  let { popupRender, menu }: { popupRender: Snippet<[Snippet]>; menu: Snippet; } = $props();
  provideFormField(undefined);
  provideFormItemStatus(Object.create(useFormItemStatusContext(), {
    status: { value: undefined }
  }));
</script>

{@render popupRender(menu)}
