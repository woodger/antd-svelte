<script lang="ts">
  import NoCompactStyle from './NoCompactStyle.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { useWatermarkPanel } from './watermark-context';
  import { createDialogContainer } from './dialog-container.model.svelte.js';
  import type { ModalContent, ModalProps as ModalComponentProps } from './modal.types';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';

  export type ModalProps = ModalComponentProps;

  let {
    open = $bindable(false),
    title,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    footer,
    width = 520,
    closable = true,
    keyboard = true,
    mask,
    confirmLoading = false,
    okText,
    cancelText,
    onOk,
    onCancel,
    getContainer,
    class: className = ''
  }: ModalProps = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('Modal');
  const designTheme = useDesignTokenContext();
  const watermarkPanel = useWatermarkPanel();
  const generatedId = $props.id();
  const titleId = `ant-modal-${generatedId}`;
  let hasTitle = $derived(title !== undefined && title !== null && title !== false && title !== '');
  let dialog = $state<HTMLDialogElement>();
  let backdropPointer = false;
  const container = createDialogContainer(() => ({
    component: 'modal',
    getContainer,
    getPopupContainer: config.getPopupContainer,
    style: componentTheme.style,
    onPointerDown: event => { backdropPointer = isBackdrop(event); },
    onPointerUp: handlePointerUp
  }));

  $effect(() => {
    if (!dialog || !container.connected || !dialog.isConnected) {
      return;
    }

    if (open && !dialog.matches(':modal')) {
      if (dialog.open) dialog.close();
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  function connectDialog(node: HTMLDialogElement) {
    return () => {
      if (node.open) node.close();
    };
  }

  function cancel() {
    if (!confirmLoading) {
      open = false;
      onCancel?.();
    }
  }

  function handleCancel(event: Event) {
    event.preventDefault();

    if (keyboard) {
      cancel();
    }
  }

  function isBackdrop(event: PointerEvent) {
    if (!dialog) {
      return false;
    }

    const bounds = dialog.getBoundingClientRect();

    return event.target === dialog && (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    );
  }

  function handlePointerUp(event: PointerEvent) {
    if (mask?.closable !== false && backdropPointer && isBackdrop(event)) {
      cancel();
    }

    backdropPointer = false;
  }

  function handleOk() {
    if (onOk) {
      onOk();
    } else {
      open = false;
    }
  }
</script>

<style>
  :global(html:has(dialog.ant-svelte-dialog[open])) { overflow: hidden; }
  .ant-svelte-dialog { max-width: calc(100vw - 32px); max-height: calc(100dvh - 48px); padding: 0; border: 0; overflow: visible; background: transparent; color: var(--ant-color-text); }
  .ant-svelte-dialog::backdrop { background: var(--ant-color-bg-mask); }
  .ant-modal { top: auto; max-width: none; width: 100%; margin: 0; padding: 0; }
  .ant-modal-container { max-height: calc(100dvh - 48px); overflow: auto; }
  .ant-modal-title { padding-inline-end: 32px; }
  .ant-modal-close { display: flex; align-items: center; justify-content: center; }
</style>

{#snippet content(value: ModalContent | undefined)}
  {#if typeof value === 'function'}{@render value()}
  {:else if typeof value !== 'boolean'}{value ?? ''}{/if}
{/snippet}

<NoCompactStyle>
{#key container.key}
<dialog
  bind:this={dialog}
  class={['ant-svelte-dialog ant-modal-css-var', componentTheme.className, className]}
  style={componentTheme.style}
  style:width={`${width}px`}
  dir={config.direction}
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledBy ?? (ariaLabel?.trim() ? undefined : hasTitle ? titleId : undefined)}
  aria-modal="true"
  oncancel={handleCancel}
  onclose={event => {
      if (event.currentTarget === dialog && !dialog.open)
        open = false;
    }}
  {@attach container.attach}
  {@attach connectDialog}
>
  <div class="ant-modal">
    <div class="ant-modal-container" {@attach watermarkPanel}>
      {#if closable}
        <button type="button" class="ant-modal-close" disabled={confirmLoading} aria-label={config.locale.closeText} onclick={cancel}>
          {#if designTheme.enabled}<span class="ant-modal-close-x"><Icon name="close" /></span>{:else}<Icon name="close" />{/if}
        </button>
      {/if}
      {#if hasTitle}<div class="ant-modal-header"><h2 id={titleId} class="ant-modal-title">{@render content(title)}</h2></div>{/if}
      <div class="ant-modal-body">{@render children?.()}</div>
      {#if footer !== null}
        <div class="ant-modal-footer">
          {#if footer}
            {@render footer()}
          {:else}
            <Button disabled={confirmLoading} onclick={cancel}>{cancelText ?? config.locale.cancelText}</Button>
            <Button type="primary" loading={confirmLoading} onclick={handleOk}>{okText ?? config.locale.okText}</Button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</dialog>
{/key}
</NoCompactStyle>
