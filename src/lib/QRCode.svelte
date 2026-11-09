<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { getQRCodePrefixCss } from './qrcode-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import {
    encodeQRCode,
    excavateQRCode,
    qrCodeAttributes,
    qrCodeDimensions,
    qrCodeImage,
    qrCodeMargin,
    qrCodePath
  } from './qrcode.engine';
  import { drawQRCode } from './qrcode.draw';
  import { qrCodeRuRU } from './qrcode.locale';
  import type { QRCodeProps, QRCodeSemantic, StatusRenderInfo } from './qrcode.types';
  import Button from './Button.svelte';
  import Spin from './Spin.svelte';

  let {
    value,
    prefixCls,
    type = 'canvas',
    icon,
    size = 160,
    iconSize,
    color,
    errorLevel = 'M',
    status = 'active',
    bordered = true,
    onRefresh,
    bgColor = 'transparent',
    marginSize,
    boostLevel,
    statusRender,
    children,
    class: className,
    rootClassName,
    style,
    classNames,
    styles,
    onclick,
    onClick,
    nativeElement = $bindable(),
    ...attributes
  }: QRCodeProps = $props();

  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('qrcode', prefixCls));
  let prefixCss = $derived(getQRCodePrefixCss(componentPrefix));
  const componentTheme = useComponentTheme('QRCode');
  const tokens = useDesignTokenContext();
  let canvas = $state<HTMLCanvasElement>();
  let image = $state<HTMLImageElement>();
  let code = $derived(value ? encodeQRCode(value, errorLevel, boostLevel) : undefined);
  let modules = $derived(code?.getModules() ?? []);
  let margin = $derived(qrCodeMargin(marginSize));
  let numCells = $derived(modules.length + margin * 2);
  let placement = $derived(qrCodeImage(modules, size, margin, icon ? {
    src: icon,
    height: typeof iconSize === 'number' ? iconSize : iconSize?.height ?? 40,
    width: typeof iconSize === 'number' ? iconSize : iconSize?.width ?? 40,
    excavate: true,
    crossOrigin: 'anonymous'
  } : undefined));
  let foreground = $derived(color ?? (tokens.enabled ? tokens.state.token.colorText ?? '#000000'
    : config.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)'));
  // Удалённый source alias не должен восстанавливаться из legacy CSS defaults.
  let inheritedText = $derived(tokens.enabled && tokens.state.token.colorText === undefined
    ? tokens.state.prefix === 'ant' ? '--ant-color-text:initial'
      : `--ant-color-text:var(--${tokens.state.prefix}-color-text)`
    : undefined);
  let foregroundPath = $derived(qrCodePath(
    placement?.excavation ? excavateQRCode(modules, placement.excavation) : modules,
    margin
  ));
  let splitAttributes = $derived(qrCodeAttributes(attributes));
  let dimensions = $derived(qrCodeDimensions(style));
  let drawingStyle = $derived([
    dimensions.width && `width:${dimensions.width}`,
    dimensions.height && `height:${dimensions.height}`
  ].filter(Boolean).join(';') || undefined);
  let locale = $derived({ ...qrCodeRuRU, ...config.locale.qrcode });
  let statusInfo = $derived({ status, locale, onRefresh } as StatusRenderInfo);
  let info = $derived({
    props: {
      ...attributes,
      value,
      prefixCls,
      type,
      icon,
      size,
      iconSize,
      color,
      errorLevel,
      status,
      bordered,
      onRefresh,
      bgColor,
      marginSize,
      boostLevel,
      statusRender,
      children,
      class: className,
      rootClassName,
      style,
      classNames,
      styles,
      onclick,
      onClick,
      nativeElement
    }
  });
  const resolve = (setting?: QRCodeSemantic) =>
    typeof setting === 'function' ? setting(info) : setting;
  let contextClasses = $derived(resolve(config.qrcode?.classNames));
  let localClasses = $derived(resolve(classNames));
  let contextStyles = $derived(resolve(config.qrcode?.styles));
  let localStyles = $derived(resolve(styles));
  let rootStyle = $derived([
    inheritedText,
    componentTheme.style,
    `background-color:${bgColor}`,
    contextStyles?.root,
    config.qrcode?.style,
    localStyles?.root,
    style,
    `width:${dimensions.width ?? `${size}px`}`,
    `height:${dimensions.height ?? `${size}px`}`
  ].filter(Boolean).join(';'));
  let drawing = $derived({
    ...info.props,
    modules,
    margin,
    numCells,
    image: placement,
    size,
    bgColor,
    color: foreground
  });

  function handleImageLoad(event: Event) {
    if (canvas && event.currentTarget === image)
      drawQRCode(canvas, drawing, image);
  }

  $effect(() => {
    const node = canvas;
    const iconElement = image;
    const settings = drawing;

    if (node)
      untrack(() => drawQRCode(node, settings, iconElement));
  });
</script>

<style>
  .anticon { display: inline-flex; align-items: center; color: inherit; font-style: normal; line-height: 0; text-align: center; text-transform: none; vertical-align: -0.125em; }
  .anticon svg { display: inline-block; }
</style>

{#snippet reloadIcon()}
  <span class="anticon anticon-reload" aria-hidden="true"><svg
    viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" focusable="false"
  ><path d="M909.1 209.3l-56.4 44.1C775.8 155.1 656.2 92 521.9 92 290 92 102.3 279.5 102 511.5 101.7 743.7 289.8 932 521.9 932c181.3 0 335.8-115 394.6-276.1 1.5-4.2-.7-8.9-4.9-10.3l-56.7-19.5a8 8 0 00-10.1 4.8c-1.8 5-3.8 10-5.9 14.9-17.3 41-42.1 77.8-73.7 109.4A344.77 344.77 0 01655.9 829c-42.3 17.9-87.4 27-133.8 27-46.5 0-91.5-9.1-133.8-27A341.5 341.5 0 01279 755.2a342.16 342.16 0 01-73.7-109.4c-17.9-42.4-27-87.4-27-133.9s9.1-91.5 27-133.9c17.3-41 42.1-77.8 73.7-109.4 31.6-31.6 68.4-56.4 109.3-73.8 42.3-17.9 87.4-27 133.8-27 46.5 0 91.5 9.1 133.8 27a341.5 341.5 0 01109.3 73.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 003 14.1l175.6 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c-.1-6.6-7.8-10.3-13-6.2z" /></svg></span>
{/snippet}

{#if value}
  {#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`qrcode-prefix:${componentPrefix}`} />{/if}<div
    bind:this={nativeElement}
    {...splitAttributes.root}
    onclick={onclick ?? onClick}
    data-ant-qrcode-prefix={prefixCss ? componentPrefix : undefined}
    class={[
      componentPrefix, 'ant-qrcode-css-var',
      componentTheme.className,
      className,
      rootClassName,
      config.qrcode?.class,
      contextClasses?.root,
      localClasses?.root,
      !bordered && `${componentPrefix}-borderless`
    ]}
    style={rootStyle}
  >
    {#if status !== 'active'}<div
      class={[`${componentPrefix}-cover`, contextClasses?.cover, localClasses?.cover]}
      style={[contextStyles?.cover, localStyles?.cover].filter(Boolean).join(';') || undefined}
    >
      {#if statusRender}{@render statusRender(statusInfo)}
      {:else if status === 'expired'}
        <p class={`${componentPrefix}-expired`}>{locale.expired}</p>
        {#if onRefresh}<Button type="link" icon={reloadIcon} onclick={onRefresh}>{locale.refresh}</Button>{/if}
      {:else if status === 'loading'}<Spin />
      {:else if status === 'scanned'}<p class={`${componentPrefix}-scanned`}>{locale.scanned}</p>{/if}
    </div>{/if}
    {#if type === 'canvas'}
      <canvas
        bind:this={canvas}
        width={size}
        height={size}
        role="img"
        {...splitAttributes.drawing}
        style={drawingStyle}
      ></canvas>
      {#if icon}{#key icon}<img
        bind:this={image}
        alt="QR-Code"
        src={icon}
        style="display:none"
        onload={handleImageLoad}
        crossorigin="anonymous"
      />{/key}{/if}
    {:else}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${numCells} ${numCells}`}
        role="img"
        {...splitAttributes.drawing}
        style={drawingStyle}
      ><path
        fill={bgColor}
        d={`M0,0 h${numCells}v${numCells}H0z`}
        shape-rendering="crispEdges"
      /><path fill={foreground} d={foregroundPath} shape-rendering="crispEdges" />
        {#if icon && placement}<image
          href={icon}
          height={placement.h}
          width={placement.w}
          x={placement.x + margin}
          y={placement.y + margin}
          preserveAspectRatio="none"
          opacity={placement.opacity}
          crossorigin={placement.crossOrigin}
        />{/if}
      </svg>
    {/if}
  </div>
{/if}
