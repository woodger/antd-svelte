<script lang="ts">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getSkeletonPrefixCss } from './skeleton-prefix.engine';
  import type { Snippet } from 'svelte';
  import type { SkeletonAvatarSize, SkeletonElementProps } from './skeleton.types';

  let {
    kind,
    prefixCls,
    class: className,
    rootClassName,
    classNames,
    style,
    styles,
    size,
    shape,
    block,
    active,
    internalClassName,
    children
  }: SkeletonElementProps & {
    kind: 'avatar' | 'button' | 'input' | 'node' | 'image';
    size?: SkeletonAvatarSize;
    shape?: 'circle' | 'square' | 'round' | 'default';
    block?: boolean;
    internalClassName?: string;
    children?: Snippet;
  } = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Skeleton');
  let prefix = $derived(config.getPrefixCls('skeleton', prefixCls));
  let prefixCss = $derived(getSkeletonPrefixCss(prefix));
  let mergedSize = $derived(size ?? config.componentSize);
  let contentClass = $derived(kind === 'node' && internalClassName
    ? internalClassName : `${prefix}-${kind}`);
  let numericSize = $derived(typeof mergedSize === 'number' && !Number.isNaN(mergedSize)
    ? `width:${mergedSize}px;height:${mergedSize}px;line-height:${mergedSize}px` : undefined);
  let contentStyle = $derived([numericSize, styles?.content, style].filter(Boolean).join(';'));
</script>

<style>
  @media (prefers-reduced-motion: reduce) {
    [data-ant-skeleton-element][data-ant-skeleton-active] > [data-ant-skeleton-content] { animation: none; }
  }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`skeleton-prefix:${prefix}`} />{/if}<div
  class={[
    prefix, `${prefix}-element`, 'ant-skeleton-css-var',
    active && `${prefix}-active`,
    (kind === 'button' || kind === 'input') && block && `${prefix}-block`,
    componentTheme.className, classNames?.root, className, rootClassName
  ]} style={[componentTheme.style, styles?.root].filter(Boolean).join(';') || undefined}
  data-ant-skeleton-element={kind} data-ant-skeleton-active={active || undefined}
  data-ant-skeleton-prefix={prefixCss ? prefix : undefined}>
  {#if kind === 'node' || kind === 'image'}
    <div class={[classNames?.content, contentClass]} data-ant-skeleton-content
      style={[styles?.content, style].filter(Boolean).join(';') || undefined}>
      {#if kind === 'image'}
        <svg viewBox="0 0 1098 1024" xmlns="http://www.w3.org/2000/svg"
          class={`${prefix}-image-svg`} aria-hidden="true" focusable="false">
          <title>Image placeholder</title>
          <path d="M365.7 329.1q0 45.8-32 77.7t-77.7 32-77.7-32-32-77.7 32-77.6 77.7-32 77.7 32 32 77.6M951 548.6v256H146.3V694.9L329 512l91.5 91.4L713 311zm54.8-402.3H91.4q-7.4 0-12.8 5.4T73 164.6v694.8q0 7.5 5.5 12.9t12.8 5.4h914.3q7.5 0 12.9-5.4t5.4-12.9V164.6q0-7.5-5.4-12.9t-12.9-5.4m91.4 18.3v694.8q0 37.8-26.8 64.6t-64.6 26.9H91.4q-37.7 0-64.6-26.9T0 859.4V164.6q0-37.8 26.8-64.6T91.4 73h914.3q37.8 0 64.6 26.9t26.8 64.6" class={`${prefix}-image-path`} />
        </svg>
      {:else}{@render children?.()}{/if}
    </div>
  {:else}
    <span class={[
      contentClass,
      mergedSize === 'large' && `${contentClass}-lg`,
      mergedSize === 'small' && `${contentClass}-sm`,
      shape && shape !== 'default' && `${contentClass}-${shape}`,
      classNames?.content
    ]} style={contentStyle || undefined} data-ant-skeleton-content></span>
  {/if}
</div>
