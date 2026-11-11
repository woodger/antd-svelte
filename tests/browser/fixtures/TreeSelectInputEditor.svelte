<script lang="ts">
  import { Input, type TreeSelectInputContext } from 'antd-svelte';
  import type { TreeSelectInputKind } from './tree-select-input-cases';
  let { context, kind }: { context: TreeSelectInputContext<HTMLInputElement>; kind: TreeSelectInputKind } = $props();
  let input = $state<HTMLInputElement>();
  let wrapper = $state<HTMLElement>();
  let component = $state<{ focus: (options?: FocusOptions) => void; blur: () => void }>();
  let wrapped = $derived(kind.startsWith('wrapped-') || kind.includes('composite'));
  let composite = $derived(kind.includes('composite') || kind === 'antd-input');
  let register = $derived(context.register);
  let componentAttributes = $derived.by(() => {
    const { value, defaultValue, size, class: className, ...attributes } = context.attributes;
    return { ...attributes, value: String(value ?? ''),
      defaultValue: defaultValue === undefined ? undefined : String(defaultValue),
      class: String(className ?? ''), htmlSize: size ?? undefined };
  });
  $effect(() => {
    const node = input, nativeElement = wrapper, instance = component;
    if (!composite || !node || !nativeElement) return;
    return register({ inputElement: node, nativeElement,
      focus: options => instance ? instance.focus(options) : node.focus(options),
      blur: () => instance ? instance.blur() : node.blur() });
  });
</script>

{#snippet prefix()}<span data-input-prefix>Prefix</span>{/snippet}
{#if kind === 'antd-input'}
  <Input {...componentAttributes} {prefix}
    bind:inputElement={input} bind:nativeElement={wrapper} bind:this={component} />
{:else if wrapped}
  <span bind:this={wrapper} data-input-wrapper style="display:inline-flex">
    <span data-input-prefix style="position:relative;z-index:1;display:inline-block;width:48px">Prefix</span>
    {#if composite}
      <input {...context.attributes} style={`${context.attributes.style ?? ''};position:relative;width:220px`}
        bind:this={input} data-input-probe />
    {:else}
      <input {...context.attributes} style={`${context.attributes.style ?? ''};position:relative;width:220px`}
        {@attach context.register} data-input-probe />
    {/if}
  </span>
{:else}
  <input {...context.attributes} {@attach context.register} data-input-probe />
{/if}
