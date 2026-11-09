<script lang="ts">
  import {
    Button, Modal, ModalHolder, createModal,
    type ModalConfirmHandle, type ModalConfirmType
  } from 'antd-svelte';

  export interface ModalPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    wide?: boolean;
    loading?: boolean;
    noClose?: boolean;
    noFooter?: boolean;
    type?: ModalConfirmType;
    noIcon?: boolean;
    close?: boolean;
  }
  let { sample, local = true }: { sample: ModalPrefixSample; local?: boolean } = $props();
  const modal = createModal();
  let handle: ModalConfirmHandle | undefined;
  let open = $state(false);
  let draft = $state('Draft');
  let closes = $state(0);
  let result = $state('pending');

  function show() {
    if (!sample.type) {
      open = true;
      return;
    }

    handle = modal[sample.type]({
      prefixCls: local ? sample.local : undefined,
      title: 'Prefix confirmation',
      content: editor,
      class: 'fixture-modal-prefix',
      closable: sample.close,
      icon: sample.noIcon ? null : undefined,
      footer: sample.noFooter ? null : undefined,
      afterClose: () => { closes += 1; }
    });
    open = true;
    void handle.then(value => {
      result = String(value);
      open = false;
    });
  }

  $effect(() => {
    const prefixCls = local ? sample.local : undefined;
    handle?.update({ prefixCls });
  });
</script>

{#snippet editor()}<input aria-label="Modal prefix draft" bind:value={draft}
  style="width:240px;max-width:100%;padding:4px 8px;font:inherit" />{/snippet}
<Button onclick={show}>Open prefix Modal</Button>
{#if sample.type}<ModalHolder {modal} />
{:else}
  <Modal prefixCls={local ? sample.local : undefined} bind:open title="Prefix panel"
    width={sample.wide ? 736 : 520} closable={sample.noClose ? false : undefined}
    confirmLoading={sample.loading} footer={sample.noFooter ? null : undefined}
    class="fixture-modal-prefix" okText="OK" cancelText="Cancel"
    onCancel={() => { closes += 1; }}>
    {@render editor()}
  </Modal>
{/if}
<output aria-label="Modal prefix state">{open ? 'open' : 'closed'}:{closes}:{result}</output>
