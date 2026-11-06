<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { inheritedComponentThemeStyle } from './theme-component-style.engine';
  import { messageHolderKey, type MessageNotice } from './message.model.svelte.js';
  import { animateMessageNotice } from './message.dom';
  import type { MessageInstance } from './message.types';

  let { notice, message }: { notice: MessageNotice; message: MessageInstance; } = $props();
  const id = untrack(() => notice.id);
  const runtime = untrack(() => message[messageHolderKey]);
  const designTheme = useDesignTokenContext();
  // Канонические variables разрешаются здесь, после локальных variables другого prefix.
  let inheritedStyle = $derived(designTheme.enabled && designTheme.state.prefix !== 'ant'
    ? inheritedComponentThemeStyle('Message', designTheme.state.token, designTheme.state.prefix)
    : undefined);
  let rootStyle = $derived([inheritedStyle, notice.style].filter(Boolean).join(';') || undefined);
  const icons = {
    success: 'check-circle-filled',
    info: 'info-circle-filled',
    warning: 'exclamation-circle-filled',
    error: 'close-circle-filled',
    loading: 'loading'
  } as const;
  let node = $state<HTMLDivElement>();
  let present = $state(true);
  let entered = false;
  let active = true;
  let disposeMotion: (() => void) | undefined;

  function mounted() {
    runtime.mounted(id);
  }

  $effect(() => {
    const root = node;
    const current = notice;
    const visible = runtime.visible;
    if (!root || !present) return;

    untrack(() => {
      if (current.closing) {
        const style = root.ownerDocument.defaultView!.getComputedStyle(root);
        const from = { opacity: style.opacity, transform: style.transform };
        disposeMotion?.();
        const finish = () => {
          present = false;
          void tick().then(() => {
            if (active)
              runtime.complete(id, current.version);
          });
        };
        if (!visible)
          finish(); else disposeMotion = animateMessageNotice(root, true, from, finish);
      } else if (visible && !entered) {
        entered = true;
        disposeMotion = animateMessageNotice(root, false, undefined, () => { });
      }
    });
  });

  onDestroy(() => {
    active = false;
    disposeMotion?.();
  });
</script>

<style>
  :global(.ant-message-top) > :global(.ant-message-list-content) > .ant-message-notice { position: relative; top: auto; left: auto; transform: none; max-width: 100%; transition: none; }
  .ant-message-notice-title { min-width: 0; overflow-wrap: anywhere; }
  .ant-message-notice-wrapper { min-width: 0; }
  .ant-message-notice-icon { display: inline-flex; }
  .message-source-theme .ant-message-notice-icon { display: block; }
  @media (prefers-reduced-motion: reduce) { .ant-message-notice-icon :global(.loading) { animation: none; } }
</style>

{#if present}
  <div bind:this={node} {@attach mounted} role={notice.role} aria-atomic="true" aria-hidden={notice.closing || undefined} inert={notice.closing} class={[
      'ant-message-notice',
      `ant-message-notice-${notice.type}`,
      designTheme.enabled && 'message-source-theme',
      notice.class
    ]} style={rootStyle} onpointerenter={(event) => {
      if (event.pointerType !== 'touch')
        runtime.hover(id, true);
    }} onpointerleave={() => runtime.hover(id, false)}>
    <div class={['ant-message-notice-wrapper', `ant-message-${notice.type}`]}>
      <span class={[
          'ant-message-notice-icon',
          `ant-message-notice-icon-${notice.type}`
        ]} aria-hidden="true">{#if notice.icon}{@render notice.icon()}{:else}<Icon name={icons[notice.type]} />{/if}</span>
      <div class="ant-message-notice-title">{#if typeof notice.content === 'function'}{@render notice.content()}{:else}{notice.content}{/if}</div>
    </div>
  </div>
{/if}
