<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { useAnchor } from './anchor-context';
  import { useConfig } from './config-context';
  import type { AnchorItem } from './anchor.types';
  let {
    prefixCls,
    href,
    title,
    target,
    class: className = '',
    replace,
    targetOffset,
    children
  }: Omit<AnchorItem, 'key' | 'children'> & { children?: Snippet; } = $props();
  const context = useAnchor();
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls(
    'anchor',
    prefixCls === undefined ? context?.prefixCls : prefixCls
  ));
  $effect(() => {
    const link = href;
    const offset = targetOffset;
    return untrack(() => context?.register(link, offset));
  });
  function click(event: MouseEvent) {
    context?.click(event, href, title, targetOffset);
    if (event.defaultPrevented) return;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (replace) {
        event.preventDefault();
        window.location.replace(href);
      }
      return;
    }
    event.preventDefault();
    window.history[replace ? 'replaceState' : 'pushState'](null, '', href);
  }
</script>

<div class={[
    `${componentPrefix}-link`,
    className,
    context?.classNames.item,
    context?.activeLink === href && `${componentPrefix}-link-active`
  ]} style={context?.styles.item}>
  <a class={[
      `${componentPrefix}-link-title`,
      context?.classNames.itemTitle,
      context?.activeLink === href && `${componentPrefix}-link-title-active`
    ]} style={context?.styles.itemTitle}
    data-ant-anchor-link-title
    data-ant-anchor-title-active={context?.activeLink === href || undefined}
    {href} {target} title={typeof title === 'string' ? title : undefined} onclick={click}>
    {#if typeof title === 'function'}{@render title()}{:else if title !== true && title !== false}{title ?? ''}{/if}
  </a>
  {#if context?.direction !== 'horizontal'}{@render children?.()}{/if}
</div>
