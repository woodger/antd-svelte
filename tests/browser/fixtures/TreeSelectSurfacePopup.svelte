<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { Input, useFormItemStatus } from 'antd-svelte';

  let { menu, replace = false, onLife }: {
    menu: Snippet;
    replace?: boolean;
    onLife: (event: string) => void;
  } = $props();
  let showMenu = $state(!untrack(() => replace));
  const field = useFormItemStatus();
  onMount(() => {
    onLife('mount');
    return () => onLife('destroy');
  });
</script>

<section data-surface-popup data-surface-field-status={field.status ?? ''} style="padding:12px">
  <Input aria-label="Popup draft" data-surface-draft="" defaultValue="Draft" />
  {#if replace}<button type="button" onclick={() => { showMenu = !showMenu; }}>Toggle menu</button>{/if}
  {#if showMenu}{@render menu()}{/if}
</section>
