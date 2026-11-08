<script lang="ts">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getSpaceAddonPrefixCss } from './space-addon-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import type { SpaceAddonProps } from './space-compact.types';
  let {
    prefixCls,
    children,
    variant = 'outlined',
    disabled,
    status,
    class: className = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: SpaceAddonProps = $props();
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('space-addon', prefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let prefixCss = $derived(getSpaceAddonPrefixCss(componentPrefix, rootPrefix));
  const componentTheme = useComponentTheme('Addon');
  const compact = useCompact();
  let classes = $derived(compactClasses(componentPrefix, config.direction, compact));
</script>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`space-addon-prefix:${componentPrefix}:${rootPrefix}`} />{/if}
<div {...rest} bind:this={nativeElement} dir={config.direction}
  data-ant-space-addon-prefix={prefixCss ? componentPrefix : undefined}
  data-ant-space-addon-vars={prefixCss ? rootPrefix.replace(/\./g, '') : undefined}
  class={[
    `${componentPrefix} ant-space-addon-css-var`,
    componentTheme.className,
    classes,
    `${componentPrefix}-variant-${variant}`,
    compact?.size && `${componentPrefix}-${compact.size}`,
    disabled && `${componentPrefix}-disabled`,
    status && `${componentPrefix}-status-${status}`,
    className
  ]} style={[componentTheme.style, style].filter(Boolean).join(';') || undefined}>
  {@render children?.()}
</div>
