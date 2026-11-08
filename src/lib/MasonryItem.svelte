<script lang="ts" generics="Data">
  import { untrack } from 'svelte';
  import { createMasonryMotion, type createMasonryRuntime } from './masonry.dom';
  import type { MasonryEntry } from './masonry.engine';
  import type { MasonryProps } from './masonry.types';

  let {
    entry,
    prefixCls = 'ant-masonry',
    runtime,
    motionEnabled = true,
    class: className,
    style,
    itemRender,
    onRemove
  }: {
    entry: MasonryEntry<Data>;
    prefixCls?: string;
    runtime?: ReturnType<typeof createMasonryRuntime<Data>>;
    motionEnabled?: boolean;
    class?: string;
    style: string;
    itemRender?: MasonryProps<Data>['itemRender'];
    onRemove: (key: string) => void;
  } = $props();

  let element = $state<HTMLDivElement>();
  let motionClass = $state('');
  let renderedMotionClass = $derived(
    motionClass.split('ant-masonry-item-fade').join(`${prefixCls}-item-fade`)
  );
  let motion = $state.raw<ReturnType<typeof createMasonryMotion>>();
  let content = $derived(entry.item.children);
  let column = $derived(entry.position?.column ?? 0);

  $effect(() => {
    if (!element || !runtime) return;

    return runtime.register(entry.itemKey, element);
  });

  $effect(() => {
    if (!element) return;

    const controller = createMasonryMotion(
      element,
      value => { motionClass = value; },
      () => onRemove(entry.key)
    );
    motion = controller;

    return () => {
      controller.destroy();
      motion = undefined;
    };
  });

  $effect(() => {
    const controller = motion;
    const visible = entry.visible;
    const enabled = motionEnabled;

    untrack(() => controller?.sync(visible, enabled));
  });
</script>

<div
  bind:this={element}
  class={[`${prefixCls}-item`, className, renderedMotionClass]}
  {style}
  style:top={entry.position?.top === undefined ? undefined : `${entry.position.top}px`}
>
  {#if content !== undefined && content !== null}
    {#if typeof content === 'function'}{@render content()}{:else if typeof content !== 'boolean'}{content}{/if}
  {:else}
    {@render itemRender?.({ ...entry.item, index: entry.index, column })}
  {/if}
</div>
