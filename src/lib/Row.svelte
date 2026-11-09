<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getGridRowPrefixCss } from './grid-row-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { createBreakpoint } from './grid-breakpoint.model.svelte.js';
  import { provideGridRow } from './grid-context';
  import {
    getGridMediaQueries, gridGutters, gridHalfGutter, gridResponsiveValue
  } from './grid.engine';
  import type { RowProps } from './grid.types';

  let {
    prefixCls,
    children,
    gutter = 0,
    align,
    justify,
    wrap,
    class: className = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: RowProps = $props();
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('row', prefixCls));
  let prefixCss = $derived(getGridRowPrefixCss(componentPrefix));
  const componentTheme = useComponentTheme('Grid');
  const designTokens = useDesignTokenContext();
  const breakpoint = createBreakpoint();
  let mediaQueries = $derived(designTokens.enabled
    ? getGridMediaQueries(designTokens.state.token) : undefined);
  // $derived ленивый: Source проверяет пороги при SSR до подключения observer.
  untrack(() => mediaQueries);
  let screens = $derived(breakpoint.connected ? breakpoint.screens : null);
  let gutters = $derived(gridGutters(gutter, screens));
  let alignment = $derived(gridResponsiveValue(align, screens));
  let justification = $derived(gridResponsiveValue(justify, screens));
  let margin = $derived(gridHalfGutter(gutters[0], true));
  let rowGap = $derived(typeof gutters[1] === 'number' ? `${gutters[1]}px` : gutters[1]);
  provideGridRow({
    get gutter() {
      return gutters;
    },
    get wrap() {
      return wrap;
    }
  });
  $effect(() => breakpoint.connect(window, mediaQueries));
</script>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`grid-row-prefix:${componentPrefix}`} />{/if}<div {...rest} bind:this={nativeElement} dir={config.direction}
  data-ant-grid-row-prefix={prefixCss ? componentPrefix : undefined}
  class={[
      `${componentPrefix} ant-grid-css-var`,
      componentTheme.className,
      wrap === false && `${componentPrefix}-no-wrap`,
      alignment && `${componentPrefix}-${alignment}`,
      justification && `${componentPrefix}-${justification}`,
      config.direction === 'rtl' && `${componentPrefix}-rtl`,
      className
    ]}
  style={[
      componentTheme.style,
      margin && `margin-inline:${margin}`,
      rowGap !== undefined && `row-gap:${rowGap}`,
      style
    ].filter(
      Boolean
    ).join(
      ';'
    )}>
  {@render children?.()}
</div>
