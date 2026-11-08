<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useToken } from './theme-context.svelte';
  import { presetColors } from './theme-token.types';
  import { connectBadgeRibbonStyle } from './badge-ribbon.dom';
  import { getBadgeRibbonPrefixCss } from './badge-ribbon-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { BadgeRibbonProps, BadgeRibbonSemantic } from './badge-ribbon.types';

  let { nativeElement = $bindable(), ...props }: BadgeRibbonProps = $props();
  let {
    text,
    children,
    color,
    placement = 'end',
    class: className,
    style,
    rootClassName,
    prefixCls,
    classNames,
    styles
  } = $derived(props);

  const config = useConfig();
  const componentTheme = useComponentTheme('Badge');
  const token = useToken();
  // Indicator наследует Badge aliases от wrapper без повторного сброса CSS-var scope.
  let indicatorHash = $derived(componentTheme.className ? token.hashId : undefined);
  let prefix = $derived(config.getPrefixCls('ribbon', prefixCls));
  let prefixCss = $derived(getBadgeRibbonPrefixCss(config.getPrefixCls()));
  let isPreset = $derived(presetColors.some(preset => preset === color));
  let info = $derived({ props: { ...props, placement } });
  const resolve = (value: BadgeRibbonSemantic | undefined) =>
    (typeof value === 'function' ? value(info) : value) ?? {};
  let contextClasses = $derived(resolve(config.ribbon?.classNames));
  let localClasses = $derived(resolve(classNames));
  let contextStyles = $derived(resolve(config.ribbon?.styles));
  let localStyles = $derived(resolve(styles));
  let rootStyle = $derived([
    componentTheme.style,
    contextStyles.root,
    localStyles.root
  ].filter(Boolean).join(';') || undefined);
  let indicatorStyle = $derived([
    color && !isPreset && `background:${color}`,
    contextStyles.indicator,
    config.ribbon?.style,
    localStyles.indicator,
    style
  ].filter(Boolean).join(';') || undefined);
  let contentStyle = $derived([
    contextStyles.content,
    localStyles.content
  ].filter(Boolean).join(';') || undefined);

  function rootStyles(node: HTMLDivElement) {
    const update = connectBadgeRibbonStyle(node);
    $effect(() => update([componentTheme.style, contextStyles.root, localStyles.root]));
  }

  function indicatorStyles(node: HTMLDivElement) {
    const update = connectBadgeRibbonStyle(node);
    $effect(() => update([
      contextStyles.indicator,
      config.ribbon?.style,
      localStyles.indicator,
      style
    ], color && !isPreset ? { property: 'background', value: color } : undefined));
  }

  function contentStyles(node: HTMLSpanElement) {
    const update = connectBadgeRibbonStyle(node);
    $effect(() => update([contextStyles.content, localStyles.content]));
  }

  function cornerStyles(node: HTMLDivElement) {
    const update = connectBadgeRibbonStyle(node);
    $effect(() => update([], color && !isPreset ? { property: 'color', value: color } : undefined));
  }
</script>

<style>
  /* Shared reset регистрируется upstream и при локальном prefixCls. */
  .ant-ribbon-wrapper-css-var { font-family: var(--ant-font-family); font-size: var(--ant-font-size); box-sizing: border-box; }
  .ant-ribbon-wrapper-css-var::before, .ant-ribbon-wrapper-css-var::after, .ant-ribbon-css-var, .ant-ribbon-content-css-var, .ant-ribbon-corner-css-var { box-sizing: border-box; }
  .ant-ribbon-css-var::before, .ant-ribbon-css-var::after, .ant-ribbon-content-css-var::before, .ant-ribbon-content-css-var::after, .ant-ribbon-corner-css-var::before, .ant-ribbon-corner-css-var::after { box-sizing: border-box; }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`ribbon-global-prefix:${config.getPrefixCls()}`} />{/if}
<div bind:this={nativeElement} class={[
    `${prefix}-wrapper`,
    'ant-ribbon-wrapper-css-var',
    rootClassName,
    componentTheme.className,
    contextClasses.root,
    localClasses.root
  ]} style={untrack(() => rootStyle)} {@attach rootStyles}>
  {#if typeof children === 'function'}{@render children()}{:else if typeof children !== 'boolean'}{children ?? ''}{/if}
  <div class={[
      prefix,
      'ant-ribbon-css-var',
      `${prefix}-placement-${placement}`,
      config.direction === 'rtl' && `${prefix}-rtl`,
      isPreset && `${prefix}-color-${color}`,
      className,
      config.ribbon?.class,
      contextClasses.indicator,
      localClasses.indicator,
      indicatorHash
    ]} style={untrack(() => indicatorStyle)} {@attach indicatorStyles}>
    <span class={[`${prefix}-content`, 'ant-ribbon-content-css-var', contextClasses.content,
      localClasses.content]}
      style={untrack(() => contentStyle)} {@attach contentStyles}>{#if typeof text === 'function'}{@render text()}{:else if typeof text !== 'boolean'}{text ?? ''}{/if}</span>
    <div class={[`${prefix}-corner`, 'ant-ribbon-corner-css-var']}
      style={untrack(() => color && !isPreset ? `color:${color}` : undefined)}
      {@attach cornerStyles}></div>
  </div>
</div>
