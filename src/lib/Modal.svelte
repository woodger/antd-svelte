<script lang="ts">
  import { tick } from 'svelte';
  import NoCompactStyle from './NoCompactStyle.svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getModalPrefixCss } from './modal-prefix.engine';
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
    prefixCls: customizePrefixCls,
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
    afterClose,
    getContainer,
    class: className = ''
  }: ModalProps = $props();

  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('modal', customizePrefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let prefixCss = $derived(getModalPrefixCss(componentPrefix, rootPrefix));
  const componentTheme = useComponentTheme('Modal');
  const designTheme = useDesignTokenContext();
  const watermarkPanel = useWatermarkPanel();
  const generatedId = $props.id();
  const titleId = `ant-modal-${generatedId}`;
  let hasTitle = $derived(title !== undefined && title !== null && title !== false && title !== '');
  let dialog = $state<HTMLDialogElement>();
  let backdropPointer = false;
  let focusTrigger: HTMLElement | undefined;
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
      focusTrigger = dialog.ownerDocument.activeElement as HTMLElement | undefined;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  function connectDialog(node: HTMLDialogElement) {
    return () => {
      const document = node.ownerDocument;
      const active = document.activeElement;
      const trigger = focusTrigger;
      const restore = node.open && (active === document.body || !active || node.contains(active));
      if (node.open) node.close();
      if (restore) {
        void tick().then(() => {
          const current = document.activeElement;
          if (trigger?.isConnected && (current === document.body || !current || current === node)) {
            trigger.focus();
          }
        });
      }
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
  [data-ant-modal-panel] { top: auto; max-width: none; width: 100%; margin: 0; padding: 0; }
  [data-ant-modal-container] { max-height: calc(100dvh - 48px); overflow: auto; }
  [data-ant-modal-title] { padding-inline-end: 32px; }
  [data-ant-modal-close] { display: flex; align-items: center; justify-content: center; }
</style>

{#snippet content(value: ModalContent | undefined)}
  {#if typeof value === 'function'}{@render value()}
  {:else if typeof value !== 'boolean'}{value ?? ''}{/if}
{/snippet}

<NoCompactStyle>
{#key container.key}
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`modal-prefix:${componentPrefix}:${rootPrefix}`} />{/if}<dialog
  data-ant-modal-prefix={componentPrefix} data-ant-modal-root-prefix={rootPrefix}
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
      if (event.currentTarget === dialog && !dialog.open) {
        open = false;
        afterClose?.();
      }
    }}
  {@attach container.attach}
  {@attach connectDialog}
>
  <div data-ant-modal-panel data-ant-modal-prefix={componentPrefix} data-ant-modal-root-prefix={rootPrefix} class={componentPrefix}>
    <div data-ant-modal-container class={`${componentPrefix}-container`} {@attach watermarkPanel}>
      {#if closable}
        <button type="button" data-ant-modal-close class={`${componentPrefix}-close`} disabled={confirmLoading} aria-label={config.locale.closeText} onclick={cancel}>
          {#if designTheme.enabled}<span data-ant-modal-close-x class={`${componentPrefix}-close-x`}><Icon name="close" /></span>{:else}<Icon name="close" />{/if}
        </button>
      {/if}
      {#if hasTitle}<div data-ant-modal-header class={`${componentPrefix}-header`}><h2 id={titleId} data-ant-modal-title class={`${componentPrefix}-title`}>{@render content(title)}</h2></div>{/if}
      <div data-ant-modal-body class={`${componentPrefix}-body`}>{@render children?.()}</div>
      {#if footer !== null}
        <div data-ant-modal-footer class={`${componentPrefix}-footer`}>
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
