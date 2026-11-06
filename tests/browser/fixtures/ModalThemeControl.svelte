<script lang="ts">
  import { Button, Input, Modal } from 'antd-svelte';

  let { mode = 'default' }: { mode?: string; } = $props();
  let open = $state(true);
  let events = $state<string[]>([]);

  function getBody() {
    return document.body;
  }
</script>

{#snippet footer()}<Button onclick={() => events.push('save')}>Save</Button>{/snippet}
<Modal bind:open title="Modal title" width={mode === 'wide' ? 736 : 520}
  closable={mode !== 'no-close'}
  footer={mode === 'no-footer' ? null : mode === 'custom-footer' ? footer : undefined}
  okText="OK" cancelText="Cancel" getContainer={mode === 'portal' ? getBody : undefined}
  onOk={() => events.push('ok')} onCancel={() => events.push('cancel')}>
  <form aria-label="Modal theme form">
    <Input aria-label="Modal draft" name="draft" defaultValue="Draft" />
  </form>
  {#if mode === 'body-text'}<div>Modal body text</div>{/if}
</Modal>
<button type="button" onclick={() => { open = true; }}>Open themed Modal</button>
<button type="button" onclick={() => { open = false; }}>Close themed Modal</button>
<output aria-label="Modal theme events">{JSON.stringify(events)}</output>
