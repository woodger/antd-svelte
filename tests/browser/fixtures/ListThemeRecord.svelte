<script lang="ts">
  import { ListItem, ListItemMeta } from 'antd-svelte';

  let {
    item,
    id,
    vertical,
    priority
  }: {
    item: { key: string; };
    id: string;
    vertical: boolean;
    priority: boolean;
  } = $props();
  let draft = $state('Draft');
  let count = $state(0);
</script>

<ListItem actions={[counter, inspect]} extra={vertical ? extra : undefined}
  styles={priority ? {
    actions: 'color:rgb(128,0,128);margin-top:9px',
    extra: 'margin-left:13px'
  } : undefined}>
  <ListItemMeta avatar="A" {title} description="List row description" />
  <input aria-label={`List theme draft ${id} ${item.key}`} bind:value={draft} style="width:100px" />
</ListItem>

{#snippet title()}<a href={`#${item.key}`}>{item.key}</a>{/snippet}
{#snippet counter()}
  <button type="button" aria-label={`Increment ${id} ${item.key}`} onclick={() => count++}>
    {count}
  </button>
{/snippet}
{#snippet inspect()}<a href="#inspect">Inspect</a>{/snippet}
{#snippet extra()}<div style="width:80px;height:30px">Extra</div>{/snippet}
