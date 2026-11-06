<script lang="ts">
  import { Button, Drawer, Input, type DrawerPlacement } from 'antd-svelte';

  let {
    mode = 'default',
    scope = 'normal',
    prefix = 'ant',
    priority = false
  }: {
    mode?: string;
    scope?: string;
    prefix?: string;
    priority?: boolean;
  } = $props();
  let open = $state(true);
  let events = $state<string[]>([]);
  let styled = $derived(priority || scope === 'priority');
  let placement = $derived<DrawerPlacement>(mode === 'left' || mode === 'top' || mode === 'bottom'
    ? mode : 'right');
  let rootStyle = $derived([
    styled && 'color:rgb(0,128,0);z-index:1900',
    scope === 'variable' && `--${prefix}-drawer-footer-padding-block:17px`
  ].filter(Boolean).join(';'));

  function getBody() {
    return document.body;
  }
</script>

{#snippet extra()}<Button>Extra</Button>{/snippet}
{#snippet footer()}<Button onclick={() => events.push('save')}>Save</Button>{/snippet}
<Drawer bind:open title={mode === 'headerless' ? undefined : 'Drawer title'}
  {placement} size={mode === 'large' ? 'large' : 378}
  closable={mode !== 'no-close' && mode !== 'headerless'}
  extra={mode === 'no-extra' || mode === 'headerless' ? undefined : extra}
  footer={mode === 'no-footer' ? undefined : footer}
  mask={{ blur: mode === 'blur' }} style={rootStyle}
  getContainer={mode === 'portal' ? getBody : undefined}
  onClose={() => events.push('close')}>
  <form aria-label="Drawer theme form">
    <Input aria-label="Drawer draft" name="draft" defaultValue="Draft" />
  </form>
</Drawer>
<button type="button" onclick={() => { open = true; }}>Open themed Drawer</button>
<button type="button" onclick={() => { open = false; }}>Close themed Drawer</button>
<output aria-label="Drawer theme events">{JSON.stringify(events)}</output>
