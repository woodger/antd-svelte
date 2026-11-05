<script lang="ts">
  import { untrack } from 'svelte';
  import { AvatarGroup, ConfigProvider, Popover, Popconfirm, enUS, type PopoverRef }
    from 'antd-svelte';
  import type { PopoverLifecycleCase } from './popover-lifecycle.types';
  import PopoverLifecycleWidget from './PopoverLifecycleWidget.svelte';

  let { sample, source = true, initialStep = 0 }: {
    sample: PopoverLifecycleCase;
    source?: boolean;
    initialStep?: number;
  } = $props();
  let step = $state(untrack(() => initialStep));
  let frame = $derived(sample.frames[step]);
  let changed = $state(false);
  let existingId = $state(false);
  let mounted = $state(true);
  let captured = $state(false);
  let events = $state<boolean[]>([]);
  let getterCalls = $state(0);
  let api = $state<PopoverRef>();
  let confirmations = $state(0);
  let resolveConfirmation: (() => void) | undefined;
  let options = $derived({
    ...frame.props,
    ...(changed ? { id: 'state-changed-panel', zIndex: 1600 } : {}),
    ...(existingId ? { id: 'existing-controls' } : {})
  });
  let body = $derived(captured ? capturedContent : options.widget ? stateContent : options.title);
  let overlayProps = $derived({
    id: options.id ?? undefined,
    open: options.open,
    trigger: options.trigger,
    disabled: options.disabled,
    forceRender: options.forceRender,
    fresh: options.fresh,
    zIndex: options.zIndex ?? undefined,
    ...('destroyOnHidden' in options ? { destroyOnHidden: options.destroyOnHidden } : {}),
    getPopupContainer: options.portal ? getContainer : undefined,
    onOpenChange: recordOpen,
    overlayStyle: options.overlayZIndex == null ? undefined : `z-index:${options.overlayZIndex}`,
    styles: {
      root: options.rootZIndex == null ? undefined : `z-index:${options.rootZIndex}`,
      container: options.containerPadding == null ? undefined : `padding:${options.containerPadding}px`,
      title: options.headingColor == null ? undefined : `color:${options.headingColor}`,
      content: options.contentColor == null ? undefined : `color:${options.contentColor}`
    },
    classNames: {
      container: options.containerClass,
      title: options.headingClass,
      content: options.contentClass
    }
  });
  let provider = $derived(source || options.providerZIndex != null ? {
    style: options.providerZIndex == null ? undefined : `z-index:${options.providerZIndex}`
  } : undefined);

  function recordOpen(value: boolean) {
    events.push(value);
  }

  function confirm() {
    confirmations++;
    return new Promise<void>(resolve => { resolveConfirmation = resolve; });
  }

  function getContainer() {
    untrack(() => getterCalls++);
    return document.getElementById('popover-lifecycle-container')!;
  }

  function expose(node: HTMLElement) {
    Object.defineProperty(node, 'lifecycleEvents', {
      configurable: true,
      get: () => [...events]
    });
    if (sample.mode === 'avatar') {
      const trigger = node.querySelector('.ant-avatar-group-more');
      if (trigger) {
        trigger.setAttribute('data-lifecycle-trigger', '');
        const tokens = new Set(['existing-controls',
          ...(trigger.getAttribute('aria-controls') ?? '').split(/\s+/).filter(Boolean)]);
        trigger.setAttribute('aria-controls', [...tokens].join(' '));
      }
    }
    return () => { Reflect.deleteProperty(node, 'lifecycleEvents'); };
  }
</script>

{#snippet stateContent()}<PopoverLifecycleWidget />{/snippet}
{#snippet capturedContent()}<span data-captured-content="">{options.title}</span><PopoverLifecycleWidget />{/snippet}
{#snippet trigger()}<button type="button" data-lifecycle-trigger="" aria-controls="existing-controls">
  Lifecycle trigger
</button>{/snippet}
<div id="popover-lifecycle-case" {@attach expose}>
  <button type="button" onclick={() => step++} disabled={step >= sample.frames.length - 1}>
    Next lifecycle step
  </button>
  <label><input type="checkbox" bind:checked={changed} /> Change lifecycle ID and layer</label>
  <label><input type="checkbox" bind:checked={existingId} /> Existing controls ID</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount lifecycle popup</label>
  <label><input type="checkbox" bind:checked={captured} /> Use captured Snippet</label>
  <button type="button" onclick={() => resolveConfirmation?.()}>Resolve lifecycle confirmation</button>
  <output aria-label="Lifecycle confirmation calls">{confirmations}</output>
  <output aria-label="Lifecycle step">{step}</output>
  <output aria-label="Lifecycle events">{JSON.stringify(events)}</output>
  <output aria-label="Lifecycle getter calls">{getterCalls}</output>
  <output aria-label="Lifecycle ref">{api ? 'mounted' : 'empty'}</output>
  <ConfigProvider locale={enUS} theme={source ? {
    cssVar: {},
    token: { motion: false },
    components: options.tokenZIndex === undefined ? {} : sample.mode === 'popconfirm'
      ? { Popconfirm: { zIndexPopup: options.tokenZIndex } }
      : { Popover: { zIndexPopup: options.tokenZIndex } }
  } : { mode: 'light', primary: 'blue' }} popover={provider} popconfirm={provider}>
    <div style="margin:180px">
      {#if mounted}
        {#if sample.mode === 'avatar'}
          <AvatarGroup items={[{ key: 'a', text: 'A', label: 'A' }, { key: 'b', text: 'B', label: 'B' }]}
            max={{ count: 1, popover: {
              ...overlayProps, title: options.heading, content: body, 'aria-label': 'Lifecycle panel'
            } }} />
        {:else if sample.mode === 'popconfirm'}
          <Popconfirm {...overlayProps} bind:ref={api}
            bind:open={() => options.open, () => {}}
            title={options.heading ?? 'Confirm heading'} description={body}
            okText={options.okText} cancelText={options.cancelText} showCancel={options.showCancel}
            onConfirm={confirm}
            icon={options.iconVisible === false ? null : undefined}
            okButtonProps={{ class: options.buttonClass, disabled: options.okDisabled }}
            cancelButtonProps={{ class: options.buttonClass }}>
            {@render trigger()}
          </Popconfirm>
        {:else}
          <Popover {...overlayProps} bind:ref={api} bind:open={() => options.open, () => {}}
            title={options.heading} content={body} aria-label="Lifecycle panel">
            {@render trigger()}
          </Popover>
        {/if}
      {/if}
    </div>
  </ConfigProvider>
</div>
