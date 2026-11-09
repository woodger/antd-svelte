<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { ImageProps, ImagePreviewConfig, ImageElementData } from './image.types';
  import { useConfig } from './config-context';
  import { getImagePrefixCss } from './image-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { useImageGroup } from './image-group-context';
  import { checkImageSource } from './image-status.dom';
  import ImagePreview from './ImagePreview.svelte';

  let {
    prefixCls: customizePrefixCls,
    previewPrefixCls,
    src,
    alt,
    width,
    height,
    preview = true,
    fallback,
    placeholder,
    class: className = '',
    style,
    rootClassName = '',
    styles,
    classNames,
    onError,
    onLoad,
    onClick,
    onKeyDown,
    tabindex,
    nativeElement = $bindable(),
    imageElement = $bindable(),
    ...attributes
  }: ImageProps = $props();
  const context = useConfig();
  let componentPrefix = $derived(context.getPrefixCls('image', customizePrefixCls));
  let prefixCss = $derived(getImagePrefixCss(componentPrefix, previewPrefixCls));
  const componentTheme = useComponentTheme('Image');
  const group = useImageGroup();
  const id = $props.id();
  let config = $derived<ImagePreviewConfig>(typeof preview === 'object' ? preview : {});
  let canPreview = $derived(Boolean(preview) && !(typeof placeholder === 'function' && !src));
  let previewSource = $derived(config.src ?? src ?? undefined);
  let internalOpen = $state(untrack(() => Boolean(config.open)));
  let actualOpen = $derived(config.open ?? internalOpen);
  let status = $state<'loading' | 'normal' | 'error'>(
    untrack(() => typeof placeholder === 'function' ? 'loading' : 'normal')
  );
  let displayed = $derived(status === 'error' && fallback ? fallback : src);
  let previousSource = untrack(() => src);
  let previousOpen = untrack(() => config.open);
  let unregister: (() => void) | undefined;
  let common = $derived<ImageElementData>({
    src: previewSource,
    alt,
    crossorigin: attributes.crossorigin,
    decoding: attributes.decoding,
    draggable: attributes.draggable,
    loading: attributes.loading,
    referrerpolicy: attributes.referrerpolicy,
    sizes: attributes.sizes,
    srcset: attributes.srcset,
    usemap: attributes.usemap,
    fetchpriority: attributes.fetchpriority
  });
  $effect(() => {
    const next = src;
    if (!nativeElement) return;
    if (previousSource !== next) {
      status = typeof placeholder === 'function' ? 'loading' : 'normal';
      previousSource = next;
    }
    return checkImageSource(next ?? undefined, nativeElement.ownerDocument, () => {
      status = 'error';
    });
  });
  $effect(() => {
    const next = config.open;
    if (next !== previousOpen)
      internalOpen = Boolean(next);
    previousOpen = next;
  });
  $effect(() => {
    if (imageElement?.complete
      && (imageElement.naturalWidth
        || imageElement.naturalHeight)
      && status === 'loading')
      status = 'normal';
  });
  $effect(() => {
    const data = common;
    const enabled = canPreview;
    if (group)
      unregister = untrack(() => group.register(id, { data, canPreview: enabled }));
  });
  onDestroy(() => unregister?.());
  function requestOpen(next: boolean) {
    internalOpen = next;
    config.onOpenChange?.(next);
  }
  function activate() {
    if (group)
      group.preview(id, previewSource); else requestOpen(true);
  }
  function click(event: MouseEvent) {
    if (canPreview)
      activate();
    onClick?.(event);
  }
  function keydown(event: KeyboardEvent) {
    onKeyDown?.(event);
    if (canPreview && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      activate();
    }
  }
  function dimension(value: string | number | undefined) {
    return typeof value === 'number' ? `${value}px` : value;
  }
</script>

<style>
  .image-trigger { margin: 0; padding: 0; border: 0; background: none; color: inherit; font: inherit; vertical-align: middle; }
  .image-trigger:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`image-prefix:${componentPrefix}:${previewPrefixCls ?? `${componentPrefix}-preview`}`} />{/if}<svelte:element this={canPreview ? 'button' : 'div'} data-ant-image-prefix={componentPrefix} bind:this={nativeElement} type={canPreview ? 'button' : undefined} role={canPreview ? 'button' : undefined}
  class={[
      `image-trigger ${componentPrefix} ant-image-css-var`,
      componentTheme.className,
      rootClassName,
      status === 'error' && `${componentPrefix}-error`
    ]}
  style={[
      componentTheme.style,
      width !== undefined && `width:${dimension(width)}`,
      height !== undefined && `height:${dimension(height)}`,
      styles?.root
    ].filter(
      Boolean
    ).join(
      ';'
    )}
  tabindex={canPreview ? tabindex ?? 0 : tabindex} aria-label={canPreview
      ? attributes['aria-label'] ?? alt ?? context.locale.image?.preview ?? 'Image preview'
      : attributes['aria-label']}
  onclick={click} onkeydown={keydown}>
  {#if !(typeof placeholder === 'function' && !src)}
    {#key displayed}<img {...attributes} bind:this={imageElement} src={displayed || undefined} {alt} {width} {height}
      class={[
          `${componentPrefix}-img`,
          placeholder === true && `${componentPrefix}-img-placeholder`,
          className
        ]} style={[height !== undefined
            && `height:${dimension(height)}`, style].filter(
              Boolean
            ).join(
              ';'
            )}
      onload={event => {
          if (event.currentTarget !== imageElement || !event.currentTarget.isConnected) return;
          if (!(status === 'error' && fallback))
            status = 'normal';
          onLoad?.(event);
        }}
      onerror={event => {
          if (event.currentTarget !== imageElement || !event.currentTarget.isConnected) return;
          status = 'error';
          onError?.(event);
        }} />{/key}
  {/if}
  {#if typeof placeholder === 'function' && (!src || status === 'loading')}<div class={`${componentPrefix}-placeholder`} aria-hidden="true">{@render placeholder()}</div>{/if}
  {#if canPreview && config.cover !== false}
    <div class={[
        `${componentPrefix}-cover`,
        `${componentPrefix}-cover-${typeof config.cover === 'object'
          ? config.cover.placement ?? 'center'
          : 'center'}`
      ]} aria-hidden="true">
      {#if typeof config.cover === 'function'}{@render config.cover()}{:else if typeof config.cover === 'object' && config.cover.coverNode}{@render config.cover.coverNode()}{/if}
    </div>
  {/if}
</svelte:element>
{#if canPreview && !group}<ImagePreview imagePrefix={componentPrefix} previewPrefix={previewPrefixCls} open={actualOpen} image={{ url: previewSource, alt: alt ?? undefined, width, height }} config={config} className={classNames?.popup?.root} {fallback} imageAttributes={common} onClose={() => requestOpen(false)} />{/if}
