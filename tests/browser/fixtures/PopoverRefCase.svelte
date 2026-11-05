<script lang="ts">
  import { untrack } from 'svelte';
  import { Popover, Popconfirm, type PopoverRef } from 'antd-svelte';
  import reference from './ant-design-popover-ref-reference.json';
  import OverlayLifecycleContent from './OverlayLifecycleContent.svelte';

  let { sample, initialStep = 0 }: {
    sample: typeof reference.cases[number];
    initialStep?: number;
  } = $props();
  let api = $state<PopoverRef>();
  let saved = $state<PopoverRef>();
  let step = $state(untrack(() => initialStep));
  let frame = $derived(sample.frames[step]);
  let replacement = $state(false);
  let portal = $state(false);
  let runEffect = $state(false);
  let effectCalls = $state(0);
  let title = $state('Ref content');
  let events = $state<boolean[]>([]);
  let observe = $state(false);
  let alignCalls = $state(0);
  let confirmations = $state(0);
  let resolveConfirmation: (() => void) | undefined;
  let properties = $derived({
    open: frame.open,
    trigger: [] as const,
    destroyOnHidden: sample.destroy,
    getPopupContainer: portal ? () => document.body : undefined,
    onOpenChange: recordOpen,
    onPopupAlign: observe ? recordAlignment : undefined
  });

  $effect(() => {
    if (runEffect && api) {
      api.forceAlign();
      untrack(() => effectCalls++);
    }
  });

  function recordOpen(value: boolean) {
    events.push(value);
  }

  function recordAlignment() {
    alignCalls++;
  }

  function confirm() {
    confirmations++;
    return new Promise<void>(resolve => { resolveConfirmation = resolve; });
  }

  function expose(node: HTMLElement) {
    Object.defineProperties(node, {
      popupRef: { configurable: true, get: () => api },
      savedPopupRef: { configurable: true, get: () => saved },
      alignCalls: { configurable: true, get: () => alignCalls }
    });

    return () => {
      for (const key of ['popupRef', 'savedPopupRef', 'alignCalls']) Reflect.deleteProperty(node, key);
    };
  }
</script>

{#snippet content()}<span>{title}</span><OverlayLifecycleContent />{/snippet}
{#snippet trigger()}
  {#if replacement}
    <a data-ref-trigger="" href="#popover-ref-case">Replacement ref trigger</a>
  {:else if sample.kind === 'svg'}
    <svg data-ref-trigger="" width="80" height="30" tabindex="0"
      role="button" aria-label="Ref trigger"><rect width="80" height="30" /></svg>
  {:else}
    <button data-ref-trigger="" type="button">Ref trigger</button>
  {/if}
{/snippet}
<div id="popover-ref-case" {@attach expose}>
  <button type="button" disabled={step === sample.frames.length - 1} onclick={() => {
    saved = api;
    step++;
  }}>Next ref step</button>
  <label><input type="checkbox" bind:checked={replacement} /> Replace ref trigger</label>
  <label><input type="checkbox" bind:checked={portal} /> Ref body container</label>
  <label><input type="checkbox" bind:checked={runEffect} /> Ref align effect</label>
  <label><input type="checkbox" bind:checked={observe} /> Observe ref alignment</label>
  <button type="button" onclick={() => title = 'Updated ref content'}>Update ref title</button>
  <button type="button" onclick={() => resolveConfirmation?.()}>Resolve ref confirmation</button>
  <output aria-label="Ref confirmation calls">{confirmations}</output>
  <output aria-label="Ref alignment calls">{alignCalls}</output>
  <output aria-label="Ref effect calls">{effectCalls}</output>
  <output aria-label="Ref step">{step}</output>
  <output aria-label="Ref events">{JSON.stringify(events)}</output>
  <output aria-label="Ref binding">{api ? 'mounted' : 'empty'}</output>
  {#if !frame.unmounted}
    <div class="ref-stage" style="margin:150px">
      {#if sample.mode === 'popconfirm'}
        <Popconfirm {...properties} bind:ref={api} title="Ref title" description={content}
          okText="Confirm via ref" cancelText="Cancel via ref" onConfirm={confirm}>
          {@render trigger()}
        </Popconfirm>
      {:else}
        <Popover {...properties} bind:ref={api} title="Ref title" {content}>
          {@render trigger()}
        </Popover>
      {/if}
    </div>
  {/if}
</div>
