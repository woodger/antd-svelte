<script lang="ts">
  import { listHasContent } from './list.engine';
  import type { ListItemMetaProps, ListItemMetaRef } from './list.types';
  import ListContent from './ListContent.svelte';

  let {
    avatar,
    title,
    description,
    prefixCls = 'ant-list',
    class: className,
    style,
    nativeElement = $bindable(),
    ref = $bindable(),
    ...attributes
  }: ListItemMetaProps = $props();
  let forwarded = $derived(Object.fromEntries(
    Object.entries(attributes).filter(([name]) => name !== 'children')
  ));
  const handle: ListItemMetaRef = { get nativeElement() { return nativeElement; } };

  $effect(() => {
    if (!nativeElement) return;
    ref = handle;
    return () => { ref = undefined; };
  });
</script>

<div {...forwarded} bind:this={nativeElement} class={[`${prefixCls}-item-meta`, className]} {style}>
  {#if listHasContent(avatar)}
    <div class={`${prefixCls}-item-meta-avatar`}><ListContent value={avatar} /></div>
  {/if}
  {#if listHasContent(title) || listHasContent(description)}
    <div class={`${prefixCls}-item-meta-content`}>
      {#if listHasContent(title)}
        <h4 class={`${prefixCls}-item-meta-title`}><ListContent value={title} /></h4>
      {/if}
      {#if listHasContent(description)}
        <div class={`${prefixCls}-item-meta-description`}><ListContent value={description} /></div>
      {/if}
    </div>
  {/if}
</div>
