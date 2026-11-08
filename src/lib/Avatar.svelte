<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useToken } from './theme-context.svelte';
  import { createBreakpoint } from './grid-breakpoint.model.svelte.js';
  import { getGridMediaQueries, gridBreakpoints, gridResponsiveValue } from './grid.engine';
  import { resolveAvatarSize, normalizeAvatarGap } from './avatar.engine';
  import { connectAvatarText } from './avatar.dom';
  import { getAvatarPrefixCss } from './avatar-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { AvatarProps } from './avatar.types';
  import type { GridBreakpoint } from './grid.types';

  let {
    src,
    srcSet,
    alt,
    crossOrigin,
    draggable,
    shape = 'circle',
    size,
    gap = 4,
    icon,
    children,
    onError,
    onClick,
    onclick,
    nativeElement = $bindable(),
    id,
    title,
    role,
    dir,
    inert,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-hidden': ariaHidden = false,
    class: className = '',
    rootClassName,
    prefixCls,
    style,
    ...attributes
  }: AvatarProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Avatar');
  const theme = useToken();
  const breakpoint = createBreakpoint();
  let host = $derived(nativeElement);
  let prefix = $derived(config.getPrefixCls('avatar', prefixCls));
  let prefixCss = $derived(getAvatarPrefixCss(prefix));
  let imageSnippet = $derived(typeof src === 'function' ? src : undefined);
  let sourceSrc = $derived(typeof src === 'string' ? src : undefined);
  let sourceSet = $derived(srcSet);
  let source = $derived({ src: sourceSrc, srcSet: sourceSet });
  let failed = $state.raw<typeof source>();
  let hasImage = $derived(Boolean(imageSnippet) || Boolean(source.src) && failed !== source);
  let resolvedSize = $derived(resolveAvatarSize(size, config.componentSize));
  let responsive = $derived(typeof resolvedSize === 'object'
    && Object.keys(resolvedSize).some(key => gridBreakpoints.includes(key as GridBreakpoint)));
  let responsiveSize = $derived(typeof resolvedSize === 'object'
    ? gridResponsiveValue(resolvedSize, breakpoint.screens) : undefined);
  $effect(() => {
    const view = host?.ownerDocument.defaultView;
    // useBreakpoint 6.6.8 обновляет подписку по refreshOnChange, а не при смене token object.
    if (responsive && view) {
      return breakpoint.connect(view, untrack(() => getGridMediaQueries(theme.token)));
    }
  });
  let rootStyle = $derived(
    [
      componentTheme.style && `${componentTheme.style};`,
      typeof resolvedSize === 'number'
        ? `width: ${resolvedSize}px; height: ${resolvedSize}px; font-size: ${icon
          ? resolvedSize / 2
          : 18}px;`
        : '',
      responsiveSize
        ? `width: ${responsiveSize}px; height: ${responsiveSize}px; font-size: ${icon || children
          ? responsiveSize / 2 : 18}px;`
        : '',
      config.avatar?.style && `${config.avatar.style};`,
      style
    ].filter(
      Boolean
    ).join(
      ' '
    )
    || undefined
  );
  let resolvedGap = $derived(normalizeAvatarGap(gap));
  let named = $derived(Boolean(ariaLabel || ariaLabelledby || alt));
  let hidden = $derived(ariaHidden || !imageSnippet && !named);

  function watchImage(node: HTMLImageElement, request: typeof source) {
    let reported = false;
    const error = () => {
      if (reported || request !== source) return;

      reported = true;
      const fallback = onError?.() !== false;
      if (fallback && request === source)
        failed = request;
    };
    node.addEventListener('error', error);
    if (node.complete && node.naturalWidth === 0)
      untrack(error);
    return () => {
      reported = true;
      node.removeEventListener('error', error);
    };
  }
  function fitText(node: HTMLSpanElement) {
    const container = host;
    const distance = resolvedGap;
    if (container) return connectAvatarText(container, node, distance);
  }
</script>

<style>
  .ant-avatar-css-var { flex-shrink: 0; }
  [data-ant-avatar-string] { display: inline-block; flex: none; transform-origin: center; white-space: nowrap; }
  .ant-avatar-icon-content { box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; width: 1em; height: 1em; }
  .ant-avatar-icon-content :global(svg) { width: 1em; height: 1em; }
  @media (prefers-reduced-motion: reduce) { .ant-avatar-css-var, [data-ant-avatar-string] { animation: none; transition: none; } }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`avatar-prefix:${prefix}`} />{/if}

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions (Avatar.onClick сохраняет span; keyboard behavior принадлежит владельцу.) -->
<span {...attributes} bind:this={nativeElement} {id} {title}
  role={role ?? (!hidden && named ? imageSnippet ? 'group' : 'img' : undefined)}
  aria-label={ariaLabel ?? (ariaLabelledby ? undefined : alt || undefined)}
  aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby}
  aria-hidden={hidden || undefined} inert={inert || imageSnippet && ariaHidden || undefined}
  dir={dir ?? config.direction} onclick={onclick ?? onClick} class={[
    prefix,
    'ant-avatar-css-var',
    componentTheme.className,
    `${prefix}-${shape}`,
    resolvedSize === 'small' && `${prefix}-sm`,
    resolvedSize === 'large' && `${prefix}-lg`,
    hasImage && `${prefix}-image`,
    icon && `${prefix}-icon`,
    config.avatar?.class,
    className,
    rootClassName
  ]} style={rootStyle}>
  {#if imageSnippet}{@render imageSnippet()}{:else if hasImage}{#key source}{@const request = source}<img src={request.src} srcset={request.srcSet} alt="" aria-hidden="true" {draggable} crossorigin={crossOrigin} {@attach node => watchImage(node, request)} />{/key}{:else if icon}<span class="ant-avatar-icon-content" aria-hidden="true" inert>{@render icon()}</span>{:else}<span class={`${prefix}-string`} data-ant-avatar-string="" aria-hidden="true" inert {@attach fitText}>{@render children?.()}</span>{/if}
</span>
