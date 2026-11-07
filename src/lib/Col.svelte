<script lang="ts">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { getGridMediaScope } from './grid-style.engine';
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
    class: className = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: ColProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Grid');
  const designTokens = useDesignTokenContext();
  let mediaScope = $derived(designTokens.enabled
    ? getGridMediaScope(designTokens.state.token) : undefined);
  const row = useGridRow();
  let responsive = $derived(
    gridColClasses({ span, order, offset, push, pull, xs, sm, md, lg, xl, xxl, xxxl })
  );
  let padding = $derived(gridHalfGutter(row?.gutter[0]));
  let hasFlex = $derived(Boolean(flex) || flex === 0);
</script>

<div {...rest} bind:this={nativeElement} dir={config.direction} class={[
    'ant-col ant-grid-css-var',
    componentTheme.className,
    mediaScope && ['ant-grid-custom-media', mediaScope],
    responsive.classes,
    config.direction === 'rtl' && 'ant-col-rtl',
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
