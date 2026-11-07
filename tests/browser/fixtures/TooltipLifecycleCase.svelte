<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Tooltip, TypographyText, type TooltipRef } from 'antd-svelte';
  import type { TooltipLifecycleOptions } from './tooltip-lifecycle.types';

  let { sample, source = true, initialStep = 0, kind = 'tooltip' }: {
    sample: { name: string; frames: readonly { props: TooltipLifecycleOptions; }[]; };
    source?: boolean;
    initialStep?: number;
    kind?: 'tooltip' | 'typography';
  } = $props();
  let step = $state(untrack(() => initialStep));
  let frame = $derived(sample.frames[step]);
  let options = $derived(frame.props);
  let events = $state<boolean[]>([]);
  let getterCalls = $state(0);
  let api = $state<TooltipRef>();
  let mounted = $state(true);
  let existingId = $state(false);
  let tooltipProps = $derived.by(() => {
    const {
      id,
      zIndex,
      rootZIndex,
      providerZIndex,
      tokenZIndex,
      portal,
      showAction,
      hideAction,
      ...rest
    } = options;
    return {
      ...rest,
      showAction: showAction ?? undefined,
      hideAction: hideAction ?? undefined,
      id: existingId ? 'existing-description' : id ?? undefined,
      zIndex: zIndex ?? undefined,
      styles: rootZIndex == null ? undefined : { root: `z-index:${rootZIndex}` }
    };
  });

  function getContainer() {
    untrack(() => getterCalls++);
    return document.getElementById('lifecycle-container')!;
  }

  function exposeEvents(node: HTMLElement) {
    Object.defineProperty(node, 'tooltipEvents', {
      configurable: true,
      get: () => [...events]
    });
    return () => { Reflect.deleteProperty(node, 'tooltipEvents'); };
  }
</script>

<div id="tooltip-lifecycle-case" {@attach exposeEvents}>
  <button type="button" onclick={() => step++} disabled={step >= sample.frames.length - 1}>
    Next lifecycle step
  </button>
  <label><input type="checkbox" bind:checked={mounted} /> Mount lifecycle tooltip</label>
  <label><input type="checkbox" bind:checked={existingId} /> Existing description ID</label>
  <output aria-label="Lifecycle step">{step}</output>
  <output aria-label="Lifecycle events">{JSON.stringify(events)}</output>
  <output aria-label="Lifecycle getter calls">{getterCalls}</output>
  <output aria-label="Lifecycle ref">{api ? 'mounted' : 'empty'}</output>
  <span id="existing-description" hidden>Existing description</span>
  <ConfigProvider theme={source ? {
    cssVar: {},
    token: { motion: false },
    components: options.tokenZIndex === undefined ? {}
      : { Tooltip: { zIndexPopup: options.tokenZIndex } } }
    : { mode: 'light', primary: 'blue' }}
    tooltip={source || options.providerZIndex != null ? {
      style: options.providerZIndex == null ? undefined : `z-index:${options.providerZIndex}`
    } : undefined}>
    <div style="margin:180px">
      {#if mounted}
        {#if kind === 'typography'}
          <TypographyText id="lifecycle-trigger" aria-describedby="existing-description" tabindex={0}
            style="display:block;width:80px"
            ellipsis={{
              onEllipsis: () => {},
              tooltip: {
                ...tooltipProps,
                getPopupContainer: options.portal ? getContainer : undefined,
                onOpenChange: value => events.push(value)
              }
            }}>
            A long text that exceeds its width
          </TypographyText>
        {:else}<Tooltip {...tooltipProps} bind:ref={api}
          bind:open={() => options.open, () => {}}
          getPopupContainer={options.portal ? getContainer : undefined}
          onOpenChange={value => events.push(value)}>
          <button type="button" id="lifecycle-trigger" aria-describedby="existing-description">
            Lifecycle trigger
          </button>
        </Tooltip>{/if}
      {/if}
    </div>
  </ConfigProvider>
</div>
