<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideFormField } from './form-context';
  import { provideFormItemStatus, useFormItemStatusContext } from './form-item-status';
  import { provideFormFeedback } from './form-feedback-context';
  import { provideCompact } from './space-compact-context';

  let { popupRender, menu }: { popupRender: Snippet<[Snippet]>; menu: Snippet; } = $props();
  provideFormField(undefined);
  provideFormFeedback({});
  provideFormItemStatus(Object.create(useFormItemStatusContext(), {
    status: { value: undefined }
  }));
  provideCompact(null);
</script>

{@render popupRender(menu)}
