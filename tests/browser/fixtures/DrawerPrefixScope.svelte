<script lang="ts">
  import { Button, Drawer, type DrawerPlacement, type DrawerSize } from 'antd-svelte';

  export interface DrawerPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    placement?: DrawerPlacement;
    size?: DrawerSize;
    blur?: boolean;
    noClose?: boolean;
  }
  let { sample, local = true }: { sample: DrawerPrefixSample; local?: boolean } = $props();
  let open = $state(false);
  let draft = $state('Draft');
  let closes = $state(0);
</script>

{#snippet extra()}<Button>Extra</Button>{/snippet}
{#snippet footer()}<Button>Footer</Button>{/snippet}
<Button onclick={() => { open = true; }}>Open prefix Drawer</Button>
<Drawer prefixCls={local ? sample.local : undefined} bind:open title="Prefix panel"
  placement={sample.placement ?? 'right'} size={sample.size ?? 'default'}
  closable={sample.noClose ? false : undefined} mask={sample.blur ? { blur: true } : undefined}
  class="fixture-drawer-prefix" {extra} {footer} onClose={() => { closes += 1; }}>
  <input aria-label="Drawer prefix draft" bind:value={draft}
    style="width:240px;max-width:100%;padding:4px 8px;font:inherit" />
</Drawer>
<output aria-label="Drawer prefix state">{open ? 'open' : 'closed'}:{closes}</output>
