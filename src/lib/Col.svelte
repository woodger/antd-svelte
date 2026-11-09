<script lang="ts">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { getGridMediaScope } from './grid-style.engine';
  import { getGridColPrefixCss, getGridColPrefixScope } from './grid-col-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useGridRow } from './grid-context';
  import { gridColClasses, gridHalfGutter, parseGridFlex } from './grid.engine';
  import type { ColProps } from './grid.types';

  let {
    children,
    span,
    order,
    offset,
    push,
    pull,
    flex,
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
    xxxl,
    prefixCls: customizePrefixCls,
    class: className = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: ColProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Grid');
  const designTokens = useDesignTokenContext();
  let componentPrefix = $derived(config.getPrefixCls('col', customizePrefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let prefixScope = $derived(getGridColPrefixScope(
    componentPrefix, rootPrefix, designTokens.state.token
  ));
  let prefixCss = $derived(getGridColPrefixCss(
    componentPrefix, rootPrefix, designTokens.state.token
  ));
  let mediaScope = $derived(designTokens.enabled
    ? getGridMediaScope(designTokens.state.token) : undefined);
  let styleScope = $derived(prefixScope ?? mediaScope);
  const row = useGridRow();
  let responsive = $derived(
    gridColClasses(
      { span, order, offset, push, pull, xs, sm, md, lg, xl, xxl, xxxl },
      componentPrefix, rootPrefix
    )
  );
  let padding = $derived(gridHalfGutter(row?.gutter[0]));
  let hasFlex = $derived(Boolean(flex) || flex === 0);
</script>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`grid-col-prefix:${prefixScope}`} />{/if}<div {...rest} {...responsive.attributes} bind:this={nativeElement} dir={config.direction} class={[
    `${componentPrefix} ant-grid-css-var`,
    componentTheme.className,
    styleScope && ['ant-grid-custom-media', styleScope],
    responsive.classes,
    config.direction === 'rtl' && `${componentPrefix}-rtl`,
    className
  ]}
  style={[
      componentTheme.style,
      padding && `padding-inline:${padding}`,
      hasFlex && `flex:${parseGridFlex(flex!)}`,
      hasFlex && row?.wrap === false && 'min-width:0',
      style,
      responsive.variables
    ].filter(
      Boolean
    ).join(
      ';'
    )}>
  {@render children?.()}
</div>
