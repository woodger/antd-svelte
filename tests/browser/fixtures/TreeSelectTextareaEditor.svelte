<script lang="ts">
  import { TextArea, type TreeSelectInputContext } from 'antd-svelte';
  import type { TreeSelectInputKind } from './tree-select-input-cases';
  let { context, kind }: { context: TreeSelectInputContext<HTMLTextAreaElement>; kind: TreeSelectInputKind } = $props();
  let input = $state<HTMLTextAreaElement>();
  let wrapper = $state<HTMLElement>();
  let component = $state<{ focus: (options?: FocusOptions) => void; blur: () => void }>();
  let wrapped = $derived(kind.startsWith('wrapped-') || kind.includes('composite'));
  let composite = $derived(kind.includes('composite') || kind === 'antd-textarea');
  let register = $derived(context.register);
  let componentAttributes = $derived.by(() => {
    const { value, defaultValue, class: className, ...attributes } = context.attributes;
    return { ...attributes, value: String(value ?? ''),
      defaultValue: defaultValue === undefined ? undefined : String(defaultValue), class: String(className ?? '') };
  });
  $effect(() => {
    const node = input, nativeElement = wrapper, instance = component;
    if (!composite || !node || !nativeElement) return;
    return register({ inputElement: node, nativeElement,
      focus: options => instance ? instance.focus(options) : node.focus(options),
      blur: () => instance ? instance.blur() : node.blur() });
  });
</script>

{#if kind === 'antd-textarea'}
  <TextArea {...componentAttributes}
    bind:nativeElement={input} bind:rootElement={wrapper} bind:this={component} />
{:else if wrapped}
  <span bind:this={wrapper} data-input-wrapper style="display:inline-flex">
    <span data-input-prefix style="position:relative;z-index:1;display:inline-block;width:48px">Prefix</span>
    {#if composite}
      <textarea {...context.attributes} style={`${context.attributes.style ?? ''};position:relative;width:220px`}
        bind:this={input} data-input-probe></textarea>
    {:else}
      <textarea {...context.attributes} style={`${context.attributes.style ?? ''};position:relative;width:220px`}
        {@attach context.register} data-input-probe></textarea>
    {/if}
  </span>
{:else}
  <textarea {...context.attributes} {@attach context.register} data-input-probe></textarea>
{/if}
