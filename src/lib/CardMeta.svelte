<script lang="ts">
  import { cardHasContent } from './card.engine';
  import { cardMetaSemantics } from './card-semantic.engine';
  import { useConfig } from './config-context';
  import { useCard } from './card-context';
  import type { CardContent, CardMetaProps } from './card.types';
  let {
    avatar,
    title,
    description,
    classNames,
    styles,
    class: className = '',
    style,
    prefixCls: customizePrefixCls,
    nativeElement = $bindable(),
    ...rest
  }: CardMetaProps = $props();
  const config = useConfig();
  const card = useCard();
  let prefixCls = $derived(customizePrefixCls === undefined && card
    ? card.prefixCls : config.getPrefixCls('card', customizePrefixCls));
  let info = $derived(
    {
      props: {
        ...rest,
        avatar,
        title,
        description,
        classNames,
        styles,
        class: className,
        style,
        prefixCls: customizePrefixCls
      }
    }
  );
  let semantic = $derived(cardMetaSemantics(config.cardMeta, info.props));
  let classes = $derived(semantic.classes);
  let slots = $derived(semantic.styles);
</script>

{#snippet value(node: CardContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
<div {...rest} bind:this={nativeElement} data-ant-card-meta
  class={[`${prefixCls}-meta`, className, config.cardMeta?.class, classes.root]} style={slots.root ?? ''}>
  {#if cardHasContent(avatar)}<div class={[`${prefixCls}-meta-avatar`, classes.avatar]} style={slots.avatar}>{@render value(avatar)}</div>{/if}
  {#if cardHasContent(title) || cardHasContent(description)}
    <div class={[`${prefixCls}-meta-section`, classes.section]} style={slots.section}>
      {#if cardHasContent(title)}<div class={[`${prefixCls}-meta-title`, classes.title]} style={slots.title}>{@render value(title)}</div>{/if}
      {#if cardHasContent(description)}<div class={[`${prefixCls}-meta-description`, classes.description]} style={slots.description}>{@render value(description)}</div>{/if}
    </div>
  {/if}
</div>
