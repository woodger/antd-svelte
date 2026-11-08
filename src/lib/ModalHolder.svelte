<script lang="ts">
  import ModalConfirmation from './ModalConfirmation.svelte';
  import { modalHolderKey } from './modal.model.svelte.js';
  import type { ModalHolderProps } from './modal-confirm.types';

  let { modal }: ModalHolderProps = $props();
  let runtime = $derived(modal[modalHolderKey]);

  function connect() {
    return runtime.connect();
  }
</script>

<span hidden aria-hidden="true" {@attach connect}></span>
{#key modal}
  {#each runtime.confirmations as confirmation (confirmation.id)}
    <ModalConfirmation {confirmation} {modal} />
  {/each}
{/key}
