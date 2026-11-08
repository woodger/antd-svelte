<script lang="ts">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { componentThemeVariables } from './theme-component-style.engine';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { formatStatisticValue } from './statistic.engine';
  import { mergeComponentSemantics } from './semantic-style.engine';
  import Skeleton from './Skeleton.svelte';
  import type {
    StatisticContent, StatisticProps, StatisticSemanticInfo, StatisticSemanticSlots
  } from './statistic.types';

  let {
    value = 0,
    title,
    prefix,
    suffix,
    loading = false,
    precision,
    decimalSeparator = '.',
    groupSeparator = ',',
    formatter,
    valueRender,
    class: className = '',
    rootClassName = '',
    style,
    classNames,
    styles,
    nativeElement = $bindable(),
    ...rest
  }: StatisticProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Statistic');
  const designTokens = useDesignTokenContext();
  let skeletonPadding = $derived(componentThemeVariables('Skeleton', designTokens.state.token)
    ['--ant-padding'] ?? `${designTokens.state.token.padding}px`);
  // Source Skeleton имеет собственный CSS-variable root; native host сохраняет его отступ.
  let skeletonStyle = $derived(designTokens.enabled
    ? `--ant-padding:${skeletonPadding}`
    : undefined);
  let semanticInfo = $derived<StatisticSemanticInfo>({
    props: {
      ...rest,
      value,
      title,
      prefix,
      suffix,
      loading,
      precision,
      decimalSeparator,
      groupSeparator,
      formatter,
      valueRender,
      class: className,
      rootClassName,
      style,
      classNames,
      styles
    }
  });
  let semantic = $derived(mergeComponentSemantics<
    keyof StatisticSemanticSlots, StatisticSemanticInfo['props']
  >(
    config.statistic,
    semanticInfo.props,
    ['root', 'header', 'title', 'content', 'value', 'prefix', 'suffix']
  ));
  let classes = $derived(semantic.classes);
  let slotStyles = $derived(semantic.styles);
  let formatted = $derived(typeof formatter === 'function' ? formatter(value) : undefined);
  let parts = $derived(formatStatisticValue(value, precision, decimalSeparator, groupSeparator));

  function hasContent(content: StatisticContent | undefined) {
    return content !== undefined && content !== null && content !== false && content !== '';
  }
</script>

<style>
  .ant-statistic { --ant-statistic-title-font-size: var(--ant-font-size); }
  .ant-statistic-compact { --ant-statistic-content-font-size: 20px; }
</style>

{#snippet content(node: StatisticContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== false}{node}{/if}
{/snippet}

{#snippet valueNode()}
  <span class={['ant-statistic-content-value', classes.value]} style={slotStyles.value}>
    {#if typeof formatter === 'function'}{@render content(formatted)}
    {:else if 'text' in parts}{parts.text}
    {:else}<span class="ant-statistic-content-value-int">{parts.integer}</span>{#if parts.decimal}<span class="ant-statistic-content-value-decimal">{parts.decimal}</span>{/if}{/if}
  </span>
{/snippet}

<div {...rest} bind:this={nativeElement} dir={config.direction}
  class={[
      'ant-statistic ant-statistic-css-var',
      componentTheme.className,
      config.direction === 'rtl' && 'ant-statistic-rtl',
      config.theme.compact && 'ant-statistic-compact',
      config.statistic?.class,
      className,
      rootClassName,
      classes.root
    ]}
  style={[componentTheme.style, slotStyles.root].filter(Boolean).join(';')}>
  {#if hasContent(title)}<div class={['ant-statistic-header', classes.header]} style={slotStyles.header}><div class={['ant-statistic-title', classes.title]} style={slotStyles.title}>{@render content(title)}</div></div>{/if}
  {#if loading}<Skeleton paragraph={false} active class="ant-statistic-skeleton" style={skeletonStyle} />
  {:else}
    <div class={['ant-statistic-content', classes.content]} style={slotStyles.content ?? ''}>
      {#if hasContent(prefix)}<span class={['ant-statistic-content-prefix', classes.prefix]} style={slotStyles.prefix}>{@render content(prefix)}</span>{/if}
      {#if valueRender}{@render valueRender(valueNode)}{:else}{@render valueNode()}{/if}
      {#if hasContent(suffix)}<span class={['ant-statistic-content-suffix', classes.suffix]} style={slotStyles.suffix}>{@render content(suffix)}</span>{/if}
    </div>
  {/if}
</div>
