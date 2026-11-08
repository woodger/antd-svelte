<script lang="ts">
  import { untrack } from 'svelte';
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import { modalHolderKey, type ModalConfirmation } from './modal.model.svelte.js';
  import type { ModalHolderProps } from './modal-confirm.types';
  import type { ModalContent } from './modal.types';

  let { confirmation, modal }: ModalHolderProps & { confirmation: ModalConfirmation; } = $props();
  const runtime = untrack(() => modal[modalHolderKey]);
  const id = untrack(() => confirmation.id);
  const generatedId = $props.id();
  const titleId = `ant-modal-confirm-title-${generatedId}`;
  const contentId = `ant-modal-confirm-content-${generatedId}`;
  const config = useConfig();
  const icons = {
    info: 'info-circle-filled',
    success: 'check-circle-filled',
    error: 'close-circle-filled',
    warning: 'exclamation-circle-filled',
    confirm: 'exclamation-circle-filled'
  } as const;
  let options = $derived(confirmation.config);
  let hasTitle = $derived(options.title !== undefined
    && options.title !== null && typeof options.title !== 'boolean' && options.title !== '');
  let hasIcon = $derived(options.icon !== null && options.icon !== false);
  let okCancel = $derived(options.okCancel ?? confirmation.type === 'confirm');

  function mounted() {
    runtime.mounted(id);
  }
</script>

<style>
  :global(dialog.ant-modal-confirm .ant-modal-body) { padding: var(--ant-modal-confirm-body-padding); }
</style>

{#snippet content(value: ModalContent | undefined)}
  {#if typeof value === 'function'}{@render value()}
  {:else if typeof value !== 'boolean'}{value ?? ''}{/if}
{/snippet}

<Modal
  open={confirmation.open}
  width={options.width || 416}
  closable={options.closable ?? false}
  keyboard={options.keyboard}
  mask={options.mask ?? { closable: false }}
  getContainer={options.getContainer}
  class={['ant-modal-confirm', `ant-modal-confirm-${confirmation.type}`, options.class]
    .filter(Boolean).join(' ')}
  aria-labelledby={hasTitle ? titleId : contentId}
  onCancel={() => runtime.dismiss(id)}
  afterClose={() => runtime.complete(id)}
  footer={null}
>
  <div class="ant-modal-confirm-body-wrapper" {@attach mounted}>
    <div class={[
      'ant-modal-confirm-body',
      hasTitle && 'ant-modal-confirm-body-has-title',
      !hasIcon && 'ant-modal-confirm-body-no-icon'
    ]}>
      {#if hasIcon}
        {#if options.icon}{@render options.icon()}
        {:else}<span class="anticon" aria-hidden="true"><Icon name={icons[confirmation.type]} /></span>{/if}
      {/if}
      <div class="ant-modal-confirm-paragraph">
        {#if hasTitle}<span id={titleId} class="ant-modal-confirm-title">{@render content(options.title)}</span>{/if}
        <div id={contentId} class="ant-modal-confirm-content">{@render content(options.content)}</div>
      </div>
    </div>
    {#if options.footer === undefined}
      <div class="ant-modal-confirm-btns">
        {#if okCancel}
          <Button loading={confirmation.pendingCancel} onclick={() => runtime.act(id, false)}>
            {@render content(options.cancelText ?? config.locale.cancelText)}
          </Button>
        {/if}
        <Button type="primary" loading={confirmation.pendingOk} autofocus
          onclick={() => runtime.act(id, true)}>
          {@render content(options.okText ?? config.locale.okText)}
        </Button>
      </div>
    {:else if options.footer}
      {@render options.footer()}
    {/if}
  </div>
</Modal>
