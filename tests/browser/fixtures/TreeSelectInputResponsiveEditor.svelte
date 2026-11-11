<script lang="ts">
  import type { TreeSelectInputContext } from 'antd-svelte';
  import type { TreeSelectInputResponsiveSample } from './tree-select-input-responsive-cases';
  let { context, kind, prefixWidth }: {
    context: TreeSelectInputContext<HTMLInputElement>;
    kind: TreeSelectInputResponsiveSample['id'];
    prefixWidth: number;
  } = $props();
  let input = $state<HTMLInputElement>();
  let wrapper = $state<HTMLSpanElement>();
  let register = $derived(context.register);
  $effect(() => {
    const field = input, nativeElement = wrapper;
    if (kind !== 'composite-ref' || !field || !nativeElement) return;
    return register({ inputElement: field, nativeElement, focus: options => field.focus(options), blur: () => field.blur() });
  });
</script>

{#snippet prefix()}
  <span data-input-responsive-prefix style={`display:inline-block;width:${prefixWidth}px;flex:none`}>Prefix</span>
{/snippet}
{#if kind === 'fragment'}
  {@render prefix()}
  <input {...context.attributes} {@attach context.register} data-input-responsive-editor />
{:else if kind === 'wrapped-dom-ref' || kind === 'composite-ref'}
  <span data-input-responsive-wrapper bind:this={wrapper} style="display:inline-flex">
    {@render prefix()}
    {#if kind === 'composite-ref'}
      <input {...context.attributes} bind:this={input} data-input-responsive-editor />
    {:else}
      <input {...context.attributes} {@attach context.register} data-input-responsive-editor />
    {/if}
  </span>
{:else}
  <input {...context.attributes} {@attach context.register} data-input-responsive-editor />
{/if}
