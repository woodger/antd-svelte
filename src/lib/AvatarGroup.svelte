<script lang="ts">
  import Avatar from './Avatar.svelte';
  import AvatarGroupOverflow from './AvatarGroupOverflow.svelte';
  import { getAvatarGroupItems } from './avatar-group.engine';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectFeedbackFocus } from './feedback.dom';
  import { getAvatarPrefixCss } from './avatar-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { ruRU } from './types';
  import type { AvatarGroupProps } from './avatar-group.types';

  let {
    items = [],
    size,
    shape,
    max,
    maxCount,
    maxStyle,
    maxPopoverPlacement,
    maxPopoverTrigger,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    rootClassName,
    prefixCls,
    style,
    nativeElement = $bindable()
  }: AvatarGroupProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Avatar');
  let rootStyle = $derived([componentTheme.style, style].filter(Boolean).join(';') || undefined);
  let host = $derived(nativeElement);
  let prefix = $derived(prefixCls || 'ant-avatar');
  let prefixCss = $derived(getAvatarPrefixCss(prefix));
  // Upstream использует truthy fallback, в том числе для count=0 и пустого style.
  let resolvedMax = $derived({
    ...max,
    count: max?.count || maxCount,
    style: max?.style || maxStyle,
    popover: {
      ...max?.popover,
      placement: max?.popover?.placement || maxPopoverPlacement,
      trigger: max?.popover?.trigger || maxPopoverTrigger
    }
  });
  let layout = $derived(getAvatarGroupItems(items, resolvedMax.count));
  let strings = $derived({ ...ruRU.avatarGroup, ...config.locale.avatarGroup });
  $effect(() => {
    const node = host;
    if (!node) return;

    return connectFeedbackFocus(node, focused => {
      // Popup может находиться вне группы после getPopupContainer.
      const surface = focused.closest<HTMLElement>('.ant-popover');
      const controls = node.querySelector('.ant-avatar-group-more')
        ?.getAttribute('aria-controls')?.split(/\s+/) ?? [];
      return Boolean(surface && controls.includes(surface.id));
    });
  });
</script>

<style>
  [data-ant-avatar-group] { align-items: center; flex-wrap: wrap; row-gap: 8px; max-width: 100%; padding-inline-start: calc(-1 * var(--ant-avatar-group-overlapping)); vertical-align: middle; }
  [data-ant-avatar-group] > :global(*) { margin-inline-start: var(--ant-avatar-group-overlapping); }
  [data-ant-avatar-group] :global(.ant-avatar) { --ant-avatar-group-border-color: var(--ant-color-bg-container); }
  .ant-avatar-group-overflow { display: inline-flex; flex-shrink: 0; }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`avatar-prefix:${prefix}`} />{/if}

<div bind:this={nativeElement} data-ant-avatar-group="" {id} role="group" aria-label={ariaLabel ?? (ariaLabelledby ? undefined : strings.label)} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction} class={[
    `${prefix}-group`,
    'ant-avatar-css-var',
    componentTheme.className,
    config.direction === 'rtl' && `${prefix}-group-rtl`,
    className,
    rootClassName
  ]} style={rootStyle}>
  {#each layout.visible as { key, label, text, ...item } (key)}
    {#snippet textContent()}{text}{/snippet}
    <Avatar {...item} alt={item.alt ?? label} size={item.size ?? size}
      shape={item.shape ?? shape} children={item.children ?? (text ? textContent : undefined)} />
  {/each}
  {#if layout.hidden.length}<span class="ant-avatar-group-overflow"><AvatarGroupOverflow items={layout.hidden} {size} {shape} max={resolvedMax} {prefix} /></span>{/if}
</div>
