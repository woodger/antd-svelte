<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { provideFormItemStatus, type FormItemStatus } from './form-item-status';
  import { provideFormItemMeta, type FormItemMetaContext } from './form-item-meta-context';

  let { value, meta, children }: {
    value: FormItemStatus;
    meta?: FormItemMetaContext;
    children: Snippet;
  } = $props();
  provideFormItemStatus(untrack(() => value));
  const collector = untrack(() => meta);
  if (collector) provideFormItemMeta(collector);
</script>

{@render children()}
