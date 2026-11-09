<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { getGridMediaQueries } from './grid.engine';
  import { getDescriptionsPrefixCss } from './descriptions-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { createBreakpoint } from './grid-breakpoint.model.svelte.js';
  import { descriptionsColumn, descriptionsItems, descriptionsRows } from './descriptions.engine';
  import { descriptionsSemantics } from './descriptions-semantic.engine';
  import DescriptionsCell from './DescriptionsCell.svelte';
  import type { DescriptionsContent, DescriptionsProps } from './descriptions.types';

  let {
    items = [],
    title,
    extra,
    column,
    layout = 'horizontal',
    bordered = false,
    colon = true,
    size,
    prefixCls: customizePrefixCls,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: DescriptionsProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Descriptions');
  let prefixCls = $derived(config.getPrefixCls('descriptions', customizePrefixCls));
  let rootPrefixCls = $derived(config.getPrefixCls());
  let prefixCss = $derived(getDescriptionsPrefixCss(prefixCls, rootPrefixCls));
  const breakpoint = createBreakpoint();
  const designTokens = useDesignTokenContext();
  let mediaQueries = $derived(designTokens.enabled
    ? getGridMediaQueries(designTokens.state.token) : undefined);
  // Source проверяет порядок порогов и при SSR, до подключения matchMedia.
  untrack(() => mediaQueries);
  let columns = $derived(descriptionsColumn(column, breakpoint.screens));
  let rows = $derived(descriptionsRows(items, columns, breakpoint.screens));
  let mergedSize = $derived(size ?? config.explicitComponentSize);
  let info = $derived(
    {
      props: {
        ...rest,
        items: descriptionsItems(items, breakpoint.screens),
        title,
        extra,
        column: columns,
        layout,
        bordered,
        colon,
        size: mergedSize,
        prefixCls: customizePrefixCls,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let semantic = $derived(descriptionsSemantics(config.descriptions, info.props));
  let classes = $derived(semantic.classes);
  let slots = $derived(semantic.styles);
  $effect(() => breakpoint.connect(window, mediaQueries));
</script>

{#snippet value(node: DescriptionsContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`descriptions-prefix:${prefixCls}:${rootPrefixCls}`} />{/if}<div {...rest} bind:this={nativeElement} dir={config.direction}
  data-ant-descriptions-prefix={prefixCss ? prefixCls : undefined}
  data-ant-descriptions-global={prefixCss ? rootPrefixCls : undefined}
  class={[
      prefixCls,
      'ant-descriptions-css-var',
      componentTheme.className,
      config.descriptions?.class,
      bordered && `${prefixCls}-bordered`,
      mergedSize === 'small' && `${prefixCls}-small`,
      mergedSize === 'medium' && `${prefixCls}-medium`,
      config.direction === 'rtl' && `${prefixCls}-rtl`,
      className,
      rootClassName,
      classes.root
    ]}
  style={[componentTheme.style, slots.root].filter(Boolean).join(';')}>
  {#if title !== undefined && title !== null && title !== false && title !== '' || extra !== undefined && extra !== null && extra !== false && extra !== ''}
    <div class={[`${prefixCls}-header`, classes.header]} style={slots.header}>
      {#if title !== undefined && title !== null && title !== false && title !== ''}<div class={[`${prefixCls}-title`, classes.title]} style={slots.title}>{@render value(title)}</div>{/if}
      {#if extra !== undefined && extra !== null && extra !== false && extra !== ''}<div class={[`${prefixCls}-extra`, classes.extra]} style={slots.extra}>{@render value(extra)}</div>{/if}
    </div>
  {/if}
  <div class={`${prefixCls}-view`}><table><tbody>
    {#each rows as row}
      {#if layout === 'vertical'}
        {#each ['label', 'content'] as kind}
          <tr class={`${prefixCls}-row`}>{#each row as item, index (item.key ?? index)}<DescriptionsCell {prefixCls} {item} component={kind === 'label' ? 'th' : 'td'} kind={kind as 'label' | 'content'} span={item.span ?? 1} {bordered} {colon} classNames={classes} styles={slots} />{/each}</tr>
        {/each}
      {:else}
        <tr class={`${prefixCls}-row`}>{#each row as item, index (item.key ?? index)}
          {#if bordered}<DescriptionsCell {prefixCls} {item} component="th" kind="label" span={1} {bordered} {colon} classNames={classes} styles={slots} />{/if}
          <DescriptionsCell {prefixCls} {item} component="td" kind={bordered ? 'content' : 'item'} span={bordered ? (item.span ?? 1) * 2 - 1 : item.span ?? 1} {bordered} {colon} classNames={classes} styles={slots} />
        {/each}</tr>
      {/if}
    {/each}
  </tbody></table></div>
</div>
