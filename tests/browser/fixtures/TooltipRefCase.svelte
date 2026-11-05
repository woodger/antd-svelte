<script lang="ts">
  import { untrack } from 'svelte';
  import { Tooltip, type TooltipRef } from 'antd-svelte';
  import reference from './ant-design-tooltip-ref-reference.json';
  import OverlayLifecycleContent from './OverlayLifecycleContent.svelte';

  let { sample, initialStep = 0 }: {
    sample: typeof reference.cases[number];
    initialStep?: number;
  } = $props();
  let api = $state<TooltipRef>();
  let saved = $state<TooltipRef>();
  let step = $state(untrack(() => initialStep));
  let frame = $derived(sample.frames[step]);
  let replacement = $state(false);
  let portal = $state(false);
  let runEffect = $state(false);
  let effectCalls = $state(0);
  let title = $state('Ref content');
  let events = $state<boolean[]>([]);

  $effect(() => {
    if (runEffect && api) {
      api.forceAlign();
      untrack(() => effectCalls++);
    }
  });

  function expose(node: HTMLElement) {
    Object.defineProperties(node, {
      tooltipRef: { configurable: true, get: () => api },
      savedTooltipRef: { configurable: true, get: () => saved }
    });

    return () => {
      Reflect.deleteProperty(node, 'tooltipRef');
      Reflect.deleteProperty(node, 'savedTooltipRef');
    };
  }
</script>

{#snippet content()}<span>{title}</span><OverlayLifecycleContent />{/snippet}
<div id="tooltip-ref-case" {@attach expose}>
  <button type="button" disabled={step === sample.frames.length - 1} onclick={() => {
    saved = api;
    step++;
  }}>Next ref step</button>
  <label><input type="checkbox" bind:checked={replacement} /> Replace ref trigger</label>
  <label><input type="checkbox" bind:checked={portal} /> Ref body container</label>
  <label><input type="checkbox" bind:checked={runEffect} /> Ref align effect</label>
  <button type="button" onclick={() => title = 'Updated ref content'}>Update ref title</button>
  <output aria-label="Ref effect calls">{effectCalls}</output>
  <output aria-label="Ref step">{step}</output>
  <output aria-label="Ref events">{JSON.stringify(events)}</output>
  <output aria-label="Ref binding">{api ? 'mounted' : 'empty'}</output>
  {#if !frame.unmounted}
    <div class="ref-stage" style="margin:150px">
      <Tooltip bind:ref={api} title={content} open={frame.open} trigger={[]}
        destroyOnHidden={sample.destroy} getPopupContainer={portal ? () => document.body : undefined}
        onOpenChange={value => events.push(value)}>
        {#if replacement}
          <a data-ref-trigger="" href="#tooltip-ref-case">Replacement ref trigger</a>
        {:else if sample.kind === 'svg'}
          <svg data-ref-trigger="" width="80" height="30" tabindex="0"
            role="button" aria-label="Ref trigger"><rect width="80" height="30" /></svg>
        {:else}
          <button data-ref-trigger="" type="button">Ref trigger</button>
        {/if}
      </Tooltip>
    </div>
  {/if}
</div>
