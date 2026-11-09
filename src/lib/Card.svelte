<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useVariant } from './variant.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { provideCard } from './card-context';
  import { getCardPrefixCss } from './card-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { cardHasContent, cardTabItems } from './card.engine';
  import { cardSemantics } from './card-semantic.engine';
  import { connectCardGrid } from './card.dom';
  import { createSkeletonFocus } from './skeleton.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import Skeleton from './Skeleton.svelte';
  import Tabs from './Tabs.svelte';
  import type { CardContent, CardProps } from './card.types';

  let {
    children,
    title,
    extra,
    cover,
    actions,
    loading = false,
    hoverable = false,
    size,
    type,
    variant,
    containGrid,
    tabList,
    activeTabKey = $bindable(),
    defaultActiveTabKey,
    tabBarExtraContent,
    tabProps = {},
    onTabChange,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    prefixCls: customizePrefixCls,
    nativeElement = $bindable(),
    ...rest
  }: CardProps = $props();
  const config = useConfig();
  const variantContext = useVariant('card', () => ({ variant }));
  const componentTheme = useComponentTheme('Card');
  let prefixCls = $derived(config.getPrefixCls('card', customizePrefixCls));
  let rootPrefixCls = $derived(config.getPrefixCls());
  let prefixCss = $derived(getCardPrefixCss(prefixCls, rootPrefixCls));
  provideCard({ get prefixCls() { return prefixCls; } });
  const focus = createSkeletonFocus();
  let body = $state<HTMLDivElement>();
  let detectedGrid = $state(false);
  let mergedSize = $derived(size ?? config.explicitComponentSize);
  let mergedVariant = $derived(variantContext.variant);
  let hasGrid = $derived(containGrid ?? detectedGrid);
  let tabs = $derived(cardTabItems(tabList));
  let info = $derived(
    {
      props: {
        ...rest,
        children,
        title,
        extra,
        cover,
        actions,
        loading,
        hoverable,
        size: mergedSize,
        type,
        variant: mergedVariant as CardProps['variant'],
        containGrid,
        tabList,
        activeTabKey,
        defaultActiveTabKey,
        tabBarExtraContent,
        tabProps,
        onTabChange,
        classNames,
        styles,
        class: className,
        rootClassName,
        style,
        prefixCls: customizePrefixCls
      }
    }
  );
  let semantic = $derived(cardSemantics(config.card, info.props));
  let classes = $derived(semantic.classes);
  let slots = $derived(semantic.styles);
  $effect(() => {
    if (nativeElement) return connectFeedbackFocus(nativeElement);
  });
  $effect(() => {
    const node = body;
    if (node && !loading) return untrack(() => connectCardGrid(node, value => {
      detectedGrid = value;
    }));
  });
  $effect.pre(() => {
    const node = body;
    const busy = loading;
    if (node)
      untrack(() => focus.update(node, node, busy));
  });
  onDestroy(() => focus.destroy());

  function selectTab(key: string) {
    activeTabKey = key;
    onTabChange?.(key);
  }
</script>

<style>
  [data-ant-card-part="body"]:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -2px; }
  [data-ant-card-loading] > [data-ant-card-part="body"] :global(.ant-skeleton-host) { width: 100%; }
  [data-ant-card-root] :global([data-ant-card-head-tabs] [data-ant-tabs-part="empty"]) { display: none; }
  @media (prefers-reduced-motion: reduce) { [data-ant-card-root], [data-ant-card-root] :global(:is([data-ant-card-grid], .ant-card-grid)) { transition: none; } }
</style>

{#snippet value(node: CardContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`card-prefix:${prefixCls}:${rootPrefixCls}`} />{/if}<div {...rest} bind:this={nativeElement} dir={config.direction}
  data-ant-card-root data-ant-card-loading={loading || undefined}
  data-ant-card-prefix={prefixCss ? prefixCls : undefined}
  data-ant-card-global={prefixCss ? rootPrefixCls : undefined}
  data-ant-contain-grid={containGrid === false ? 'false' : undefined}
  class={[
      prefixCls,
      'ant-card-css-var',
      componentTheme.className,
      config.card?.class,
      loading && `${prefixCls}-loading`,
      mergedVariant !== 'borderless' && `${prefixCls}-bordered`,
      hoverable && `${prefixCls}-hoverable`,
      hasGrid && `${prefixCls}-contain-grid`,
      tabList?.length && `${prefixCls}-contain-tabs`,
      mergedSize === 'small' && `${prefixCls}-small`,
      type && `${prefixCls}-type-${type}`,
      config.direction === 'rtl' && `${prefixCls}-rtl`,
      className,
      rootClassName,
      classes.root
    ]}
  style={[componentTheme.style, slots.root].filter(Boolean).join(';')}>
  {#if cardHasContent(title) || cardHasContent(extra) || tabList}
    <div class={[`${prefixCls}-head`, classes.header]} style={slots.header ?? ''}>
      <div class={`${prefixCls}-head-wrapper`}>
        {#if cardHasContent(title)}<div class={[`${prefixCls}-head-title`, classes.title]} style={slots.title}>{@render value(title)}</div>{/if}
        {#if cardHasContent(extra)}<div class={[`${prefixCls}-extra`, classes.extra]} style={slots.extra}>{@render value(extra)}</div>{/if}
      </div>
      {#if tabList}<Tabs {...tabProps} data-ant-card-head-tabs items={tabs} activeKey={activeTabKey ?? tabProps.activeKey} defaultActiveKey={defaultActiveTabKey ?? tabProps.defaultActiveKey}
        {tabBarExtraContent} size={tabProps.size ?? (mergedSize === 'small' ? 'small' : 'large')} class={`${prefixCls}-head-tabs`} onChange={selectTab} />{/if}
    </div>
  {/if}
  {#if cardHasContent(cover)}<div class={[`${prefixCls}-cover`, classes.cover]} style={slots.cover}>{@render value(cover)}</div>{/if}
  {#if loading || children}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Фокус парковки при замене содержимого Skeleton.) -->
    <div data-ant-card-part="body" bind:this={body} class={[`${prefixCls}-body`, classes.body]} style={slots.body ?? ''} tabindex="-1" aria-busy={loading || undefined}>
      {#if loading}<Skeleton active title={false} paragraph={{ rows: 4 }} />{:else}{@render children?.()}{/if}
    </div>
  {/if}
  {#if actions?.length}<ul class={[`${prefixCls}-actions`, classes.actions]} style={slots.actions}>{#each actions as action, index (index)}<li style={`width:${100 / actions.length}%`}><span>{@render value(action)}</span></li>{/each}</ul>{/if}
</div>
