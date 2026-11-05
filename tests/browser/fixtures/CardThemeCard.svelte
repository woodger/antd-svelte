<script lang="ts">
  import { Card, CardGrid, CardMeta } from 'antd-svelte';

  let { id, kind = 'normal', priority = false }: {
    id: string;
    kind?: string;
    priority?: boolean;
  } = $props();
</script>

{#snippet action()}<button type="button">Card action</button>{/snippet}
<Card data-card-theme={id} title="Card title" extra="Extra"
  size={kind === 'small' || kind === 'small-inner' ? 'small' : undefined}
  type={kind === 'inner' || kind === 'small-inner' ? 'inner' : undefined}
  loading={kind === 'loading'} actions={[action]}
  tabList={kind === 'tabs' ? [{ key: 'a', tab: 'Alpha' }, { key: 'b', tab: 'Beta' }] : undefined}
  bodyStyle={priority ? 'padding:17px' : undefined}
  headStyle={priority ? 'min-height:91px;padding:17px' : undefined}
  style={priority ? 'background-color:rgb(11, 12, 13)' : undefined}
  styles={priority ? {
    root: 'background-color:rgb(7, 8, 9)',
    header: 'min-height:83px;padding:15px',
    body: 'padding:13px',
    actions: 'background-color:rgb(4, 5, 6)'
  } : undefined}>
  {#if kind === 'grid'}
    <CardGrid hoverable={false}>Grid</CardGrid>
  {:else}
    <CardMeta title="Meta title" description="Meta description" />
    <input aria-label="Card theme draft" value="Draft" />
  {/if}
</Card>
