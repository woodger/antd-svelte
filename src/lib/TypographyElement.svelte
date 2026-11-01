<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useConfig } from './config-context';
  import type { TypographySlots } from './typography.types';

  let {
    component = 'article',
    prefixCls,
    direction,
    class: className,
    rootClassName,
    classNames = {},
    styles = {},
    style,
    children,
    nativeElement = $bindable(),
    attributes = {},
    clamp,
    controlClamp = false
  }: {
    component?: keyof HTMLElementTagNameMap;
    prefixCls: string;
    direction: 'ltr' | 'rtl';
    class?: string;
    rootClassName?: string;
    classNames?: TypographySlots;
    styles?: TypographySlots;
    style?: string;
    children?: Snippet;
    nativeElement?: HTMLElement;
    attributes?: Record<string, unknown>;
    clamp?: number;
    controlClamp?: boolean;
  } = $props();
  const config = useConfig();
</script>

{#snippet content()}{@render children?.()}{/snippet}
{#if controlClamp}
  <svelte:element this={component} {...attributes} bind:this={nativeElement}
    class={[prefixCls, direction === 'rtl' && `${prefixCls}-rtl`, className, rootClassName,
      'ant-typography-css-var', config.theme.compact && 'ant-typography-compact', classNames.root]}
    style={[styles.root, style].filter(Boolean).join(';')} style:-webkit-line-clamp={clamp ?? null}>
    {@render content()}
  </svelte:element>
{:else}
  <svelte:element this={component} {...attributes} bind:this={nativeElement}
  class={[prefixCls, direction === 'rtl' && `${prefixCls}-rtl`, className, rootClassName,
    'ant-typography-css-var', config.theme.compact && 'ant-typography-compact', classNames.root]}
  style={[styles.root, style].filter(Boolean).join(';')}>
    {@render content()}
  </svelte:element>
{/if}
