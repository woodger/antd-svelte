<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { provideFormItemStatus, type FormItemStatus } from './form-item-status';
  import { provideFormItemMeta, type FormItemMetaContext } from './form-item-meta-context';
  import { provideFormFeedback, type FormFeedbackContext } from './form-feedback-context';

  let { value, meta, feedback, children }: {
    value: FormItemStatus;
    meta?: FormItemMetaContext;
    feedback?: FormFeedbackContext;
    children: Snippet;
  } = $props();
  provideFormItemStatus(untrack(() => value));
  const iconContext = untrack(() => feedback);
  if (iconContext) provideFormFeedback(iconContext);
  const collector = untrack(() => meta);
  if (collector) provideFormItemMeta(collector);
</script>

{@render children()}
