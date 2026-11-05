<script lang="ts">
  import { useConfig } from './config-context';
  import { useList } from './list-context';
  import { listHasContent, listMixedText } from './list.engine';
  import { connectListItemText } from './list.dom';
  import type { ListItemProps } from './list.types';
  import ListContent from './RenderContent.svelte';
  import Col from './Col.svelte';

  let {
    children,
    actions,
    extra,
    classNames,
    styles,
    colStyle,
    prefixCls = 'ant-list',
    class: className,
    style,
    nativeElement = $bindable(),
    ...attributes
  }: ListItemProps = $props();
  const config = useConfig();
  const list = useList();
  let body = $state<HTMLElement>();
  let column = $state<HTMLDivElement>();
  let mixedText = $state(false);
  let vertical = $derived(list.itemLayout === 'vertical');
  let hasExtra = $derived(listHasContent(extra));
  let noFlex = $derived(vertical ? !hasExtra
    : typeof children === 'function' ? mixedText : listMixedText(children));
  let actionClass = $derived([config.list?.item?.classNames?.actions, classNames?.actions]);
  let extraClass = $derived([config.list?.item?.classNames?.extra, classNames?.extra]);
  let actionStyle = $derived([config.list?.item?.styles?.actions, styles?.actions]
    .filter(Boolean).join(';'));
  let extraStyle = $derived([config.list?.item?.styles?.extra, styles?.extra]
    .filter(Boolean).join(';'));

  $effect(() => {
    const element = body;
    if (element && !vertical && typeof children === 'function') {
      return connectListItemText(element, value => mixedText = value);
    }
    mixedText = false;
  });

  $effect(() => {
    nativeElement = list.grid ? column : body;
    return () => { nativeElement = undefined; };
  });
</script>

{#snippet actionItems()}
  {#if actions && actions.length > 0}
    <ul class={[`${prefixCls}-item-action`, ...actionClass]} style={actionStyle}>
      {#each actions as action, index}
        <li><ListContent value={action} />{#if index !== actions.length - 1}
            <em class={`${prefixCls}-item-action-split`}></em>
          {/if}</li>
      {/each}
    </ul>
  {/if}
{/snippet}

{#snippet item()}
  <svelte:element this={list.grid ? 'div' : 'li'} {...attributes} bind:this={body}
    class={[`${prefixCls}-item`, noFlex && `${prefixCls}-item-no-flex`, className]} {style}>
    {#if vertical && hasExtra}
      <div class={`${prefixCls}-item-main`}>
        <ListContent value={children} />{@render actionItems()}
      </div>
      <div class={[`${prefixCls}-item-extra`, ...extraClass]} style={extraStyle}>
        <ListContent value={extra} />
      </div>
    {:else}
      <!-- Постоянные markers отделяют children от actions/extra без видимой обёртки. -->
      {@html '<!--ant-list-children-start-->'}<ListContent value={children} />{@html '<!--ant-list-children-end-->'}
      {@render actionItems()}<ListContent value={extra} />
    {/if}
  </svelte:element>
{/snippet}

{#if list.grid}
  <Col flex={1} style={colStyle} bind:nativeElement={column}>{@render item()}</Col>
{:else}{@render item()}{/if}
