<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import CollapseItemView from './CollapseItemView.svelte';
  import { useCollapse } from './collapse-context';
  import type { CollapseItem, CollapsePanelProps } from './collapse.types';

  let {
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: CollapsePanelProps = $props();
  const parent = useCollapse();
  const registration = parent?.register(() => item, () => nativeElement);
  let key = $derived(String(props.key === '' ? registration?.index ?? 0
    : props.key ?? registration?.index ?? 0));
  let item = $derived.by((): CollapseItem & { key: string } => {
    const { header, prefixCls: _prefix, ...panelProps } = props;
    const prefix = parent?.prefix || props.prefixCls || 'ant-collapse';

    return {
      ...panelProps, key, label: header,
      class: [props.showArrow === false && `${prefix}-no-arrow`, props.class]
        .filter(Boolean).join(' ')
    };
  });

  onMount(() => {
    registration?.mount();
  });
  $effect(() => { ref = nativeElement; });
  onDestroy(() => {
    registration?.destroy();
    ref = undefined;
    nativeElement = undefined;
  });
</script>

{#key key}<CollapseItemView {item} legacy prefixCls={props.prefixCls} bind:nativeElement />{/key}
