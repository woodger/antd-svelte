<script lang="ts">
  import { untrack } from 'svelte';
  import Avatar from './Avatar.svelte';
  import Popover from './Popover.svelte';
  import { useConfig } from './config-context';
  import { ruRU } from './types';
  import type { AvatarGroupItem, AvatarGroupMax } from './avatar-group.types';
  import type { AvatarShape, AvatarSize } from './avatar.types';

  let { items, size, shape, max, prefix }: {
    items: readonly AvatarGroupItem[];
    size?: AvatarSize;
    shape?: AvatarShape;
    max?: AvatarGroupMax;
    prefix: string;
  } = $props();
  const config = useConfig();
  let popover = $derived(max?.popover ?? {});
  let innerOpen = $state<boolean | undefined>(untrack(() => popover.defaultOpen ?? false));
  let previousOpen = untrack(() => popover.open);
  let open = $derived(Boolean(popover.open !== undefined ? popover.open : innerOpen));
  let visited = $state(false);
  let strings = $derived({ ...ruRU.avatarGroup, ...config.locale.avatarGroup });
  let title = $derived('title' in popover ? popover.title : strings.hiddenLabel);
  let content = $derived('content' in popover ? popover.content : hiddenItems);

  $effect.pre(() => {
    const next = popover.open;

    // Как useControlledState: удаление controlled open не возвращает defaultOpen.
    if (!Object.is(next, previousOpen)) innerOpen = next;
    previousOpen = next;

    if (open || popover.forceRender) visited = true;
  });
</script>

<style>
  .ant-avatar-group-more { display: inline-flex; padding: 0; margin: 0; border: 0; border-radius: 50%; background: transparent; color: inherit; font: inherit; vertical-align: middle; cursor: pointer; }
  .ant-avatar-group-more:focus-visible { position: relative; z-index: 1; outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-avatar-group-list { display: grid; gap: var(--ant-avatar-group-space); padding: 0; margin: 0; list-style: none; max-width: 100%; }
  .ant-avatar-group-list li { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .ant-avatar-group-name { min-width: 0; overflow-wrap: anywhere; }
  @media (prefers-reduced-motion: reduce) { .ant-avatar-group-more { transition: none; animation: none; } }
</style>

{#snippet hiddenItems()}<ul class="ant-avatar-group-list" aria-label={strings.hiddenLabel}>{#each items as { key, label, text, ...item } (key)}
{#snippet textContent()}{text}{/snippet}
<li><Avatar {...item} size={item.size ?? size} shape={item.shape ?? shape}
  aria-hidden={typeof item.src === 'function' ? item['aria-hidden'] : true}
  children={item.children ?? (text ? textContent : undefined)} /><span class="ant-avatar-group-name">{label}</span></li>{/each}</ul>{/snippet}
{#snippet popupTitle()}{#if visited && typeof title === 'function'}{@render title()}{/if}{/snippet}
{#snippet popupContent()}{#if visited && typeof content === 'function'}{@render content()}{/if}{/snippet}
<Popover
  {...popover}
  bind:open={() => open, next => innerOpen = next}
  title={typeof title === 'function' ? popupTitle : title}
  content={typeof content === 'function' ? popupContent : content}
  destroyOnHidden={'destroyOnHidden' in popover ? popover.destroyOnHidden : true}
  trigger={popover.trigger ?? ['hover', 'click']}
  placement={popover.placement ?? 'top'}
  aria-label={'aria-label' in popover ? popover['aria-label']
    : 'title' in popover || popover['aria-labelledby'] ? undefined : strings.hiddenLabel}
  popupClass={[`${prefix}-group-popover`, popover.popupClass].filter(Boolean).join(' ')}
>
  <button type="button" class="ant-avatar-group-more" aria-label={`${strings.overflow}: ${items.length}`}><Avatar {size} {shape} style={max?.style} aria-hidden>+{items.length}</Avatar></button>
</Popover>
