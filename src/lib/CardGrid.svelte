<script lang="ts">
  import type { CardGridProps } from './card.types';
  import { useConfig } from './config-context';
  import { useCard } from './card-context';
  let {
    children,
    hoverable = true,
    class: className = '',
    style,
    prefixCls: customizePrefixCls,
    nativeElement = $bindable(),
    ...rest
  }: CardGridProps = $props();
  const config = useConfig();
  const card = useCard();
  let prefixCls = $derived(customizePrefixCls === undefined && card
    ? card.prefixCls : config.getPrefixCls('card', customizePrefixCls));
</script>

<div {...rest} bind:this={nativeElement} data-ant-card-grid
  class={[`${prefixCls}-grid`, hoverable && `${prefixCls}-grid-hoverable`, className]}
  {style}>{@render children?.()}</div>
