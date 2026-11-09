<script lang="ts" generics="T, K extends ListyKey">
  import { untrack } from 'svelte';
  import { listyRows } from './listy.engine';
  import { createListyVirtual } from './listy.model.svelte.js';
  import { connectListyGestures } from './listy-gestures.dom';
  import type { ListyKey, ListyViewProps } from './listy.types';
  import ListyGroupHeader from './ListyGroupHeader.svelte';
  import ListyScrollbar from './ListyScrollbar.svelte';

  let {
    items,
    rowKey,
    group,
    itemRender,
    height,
    itemHeight,
    sticky,
    prefixCls,
    direction,
    classNames,
    styles,
    onScroll,
    attributes,
    ref = $bindable(),
    nativeElement = $bindable()
  }: ListyViewProps<T, K> = $props();

  let rows = $derived(listyRows(items, rowKey, group));
  let holder = $state<HTMLDivElement>();
  let inner = $state<HTMLDivElement>();
  const model = createListyVirtual<T, K>({
    rows: () => rows,
    height: () => height,
    estimate: () => itemHeight,
    sticky: () => Boolean(sticky && group)
  });
  let range = $derived(model.range);
  let useVirtual = $derived(range.useVirtual);
  let inVirtual = $derived(range.virtual);
  let visible = $derived(rows.slice(range.start, range.end + 1));
  let fixed = $derived(model.connected && range.virtual && sticky && group ? model.sticky : undefined);

  $effect(() => {
    const viewport = holder;
    const content = inner;
    if (!viewport || !content) return;
    return untrack(() => model.connect(viewport, content));
  });

  $effect(() => {
    if (!nativeElement) return;
    ref = { scrollTo: model.scrollTo };
    return () => { ref = undefined; };
  });

  $effect(() => {
    const viewport = holder;
    const enabled = useVirtual;
    const virtual = inVirtual;
    if (!viewport) return;
    return untrack(() => connectListyGestures(viewport, {
      useVirtual: enabled,
      virtual,
      top: () => model.top,
      maximum: () => (model.range.scrollHeight ?? NaN) - (height ?? NaN),
      scrollBy: model.scrollBy
    }));
  });

  function handleScroll(event: UIEvent & { currentTarget: HTMLDivElement; }) {
    if (event.currentTarget.scrollTop !== model.top) model.sync(event.currentTarget.scrollTop);
    onScroll?.(event);
  }
</script>

<div {...attributes} {...{ dir: direction === 'rtl' ? 'rtl' : undefined }} bind:this={nativeElement}
  class={[prefixCls, direction === 'rtl' && `${prefixCls}-rtl`, classNames.root]}
  style={[styles.root, 'position:relative'].filter(Boolean).join(';')}>
  <div bind:this={holder} class={`${prefixCls}-holder`} onscroll={handleScroll} role="presentation"
    onmouseenter={model.flashScrollbar}
    style={height ? `max-height:${height}px;overflow-y:${range.useVirtual ? 'hidden' : 'auto'};overflow-anchor:none;${model.moving ? 'pointer-events:none' : ''}` : undefined}>
    <div style={range.offset !== undefined
      ? `height:${range.scrollHeight}px;position:relative;overflow:hidden` : undefined}>
      <div bind:this={inner} class={`${prefixCls}-holder-inner`}
        style={`display:flex;flex-direction:column;${range.offset !== undefined
          ? `position:absolute;left:0;right:0;top:0;transform:translateY(${range.offset}px);${direction === 'rtl' ? 'margin-right' : 'margin-left'}:0` : ''}`}>
        {#each visible as row (row.renderKey)}
          {#if row.type === 'group' && group}
            <ListyGroupHeader {row} title={group.title} {prefixCls}
              class={classNames.groupHeader} style={styles.groupHeader}
              attach={element => model.attach(element, row.taggedKey)} />
          {:else if row.type === 'item'}
            <div data-ant-listy-item class={[`${prefixCls}-item`, classNames.item]} style={styles.item}
              {@attach element => model.attach(element, row.taggedKey)}>
              {@render itemRender(row.item, row.index)}
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </div>
  {#if range.virtual && (range.scrollHeight ?? 0) > (height ?? 0)}
    <ListyScrollbar {prefixCls} rtl={direction === 'rtl'} offset={model.top}
      range={range.scrollHeight ?? 0} size={model.holderHeight} flash={model.flash}
      onScroll={model.sync} onMoving={value => { model.moving = value; }} />
  {/if}
  {#if fixed && group}
    <div class={`${prefixCls}-group-header-holder`}>
      <ListyGroupHeader row={fixed.row} title={group.title} {prefixCls} fixed top={fixed.top}
        class={classNames.groupHeader} style={styles.groupHeader} />
    </div>
  {/if}
</div>
