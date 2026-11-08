<script lang="ts">
  import { useConfig } from './config-context';
  import { useLayout } from './layout-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getLayoutSectionPrefixCss } from './layout-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { LayoutSectionProps } from './layout.types';
  let {
    tag,
    part,
    children,
    prefixCls,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: LayoutSectionProps & {
    tag: 'header' | 'footer' | 'main';
    part: 'header' | 'footer' | 'content';
  } = $props();
  const config = useConfig();
  // Секции наследуют переменные Layout, включая его style; standalone задаёт свой scope.
  const layout = useLayout();
  let componentPrefix = $derived(config.getPrefixCls(`layout-${part}`, prefixCls));
  let prefixCss = $derived(getLayoutSectionPrefixCss(componentPrefix, part, !layout));
  const componentTheme = useComponentTheme('Layout');
</script>

{#if prefixCss}
  <ThemeScopeStyle css={prefixCss} scope={`layout-${part}-prefix:${componentPrefix}`} />
{/if}
<svelte:element this={tag} {...rest} bind:this={nativeElement} dir={config.direction}
  data-ant-layout-part={part}
  data-ant-layout-prefix={prefixCss ? part : undefined}
  data-ant-layout-standalone={!layout ? '' : undefined}
  class={['ant-layout-css-var', componentPrefix, componentTheme.className, className, rootClassName]}
  style={[!layout && componentTheme.style, style].filter(Boolean).join(';')}>
  {@render children?.()}
</svelte:element>
