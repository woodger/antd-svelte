<script lang="ts">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { spaceEntries, spaceGap, spaceHasContent, spaceOrientation } from './space.engine';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { SpaceContent, SpaceProps, SpaceSlots } from './space.types';

  let {
    items,
    children,
    size: customizeSize,
    orientation,
    vertical,
    align,
    separator,
    wrap,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: SpaceProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Space');
  let size = $derived(customizeSize === undefined ? config.space?.size ?? 'small' : customizeSize);
  let entries = $derived(spaceEntries(items, children));
  let latest = $derived(
    entries.reduce((index, item, next) => spaceHasContent(item.children) ? next : index, 0)
  );
  let actualOrientation = $derived(spaceOrientation(orientation, vertical));
  let actualAlign = $derived(
    align ?? (actualOrientation === 'horizontal' ? 'center' : undefined)
  );
  let actualSeparator = $derived(separator);
  let gap = $derived(spaceGap(size));
  let info = $derived(
    {
      props: {
        ...rest,
        items,
        children,
        size,
        orientation: actualOrientation,
        vertical,
        align: actualAlign,
        separator,
        wrap,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let semantics = $derived.by(() => {
    const contextClasses = config.space?.classNames;
    const contextStyles = config.space?.styles;
    const inheritedClasses = typeof contextClasses === 'function'
      ? contextClasses(info) : contextClasses;
    const inheritedStyles = typeof contextStyles === 'function'
      ? contextStyles(info) : contextStyles;
    const localClasses = typeof classNames === 'function' ? classNames(info) : classNames;
    const localStyles = typeof styles === 'function' ? styles(info) : styles;
    const classes: SpaceSlots = {};
    const slots: SpaceSlots = {};

    for (const slot of ['root', 'item', 'separator'] as const) {
      classes[slot] = [inheritedClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      const layers = [
        inheritedStyles?.[slot], slot === 'root' && config.space?.style,
        localStyles?.[slot], slot === 'root' && style
      ];
      if (layers.some(value => typeof value === 'string'))
        slots[slot] = layers.filter(Boolean).join(';');
    }

    return { classes, styles: slots };
  });
  let classes = $derived(semantics.classes);
  let slots = $derived(semantics.styles);
  let retainedFocus: HTMLElement | undefined;
  $effect.pre(() => {
    const host = nativeElement;
    const focused = host?.ownerDocument.activeElement;
    retainedFocus = entries.length
      && host
      && focused instanceof HTMLElement
      && host.contains(
        focused
      )
      ? focused
      : undefined;
  });
  $effect(() => {
    const host = nativeElement;
    const focused = retainedFocus;
    retainedFocus = undefined;
    // Keyed DOM сохраняется, но перемещение input через before() сбрасывает фокус браузера.
    if (entries.length
      && host
      && focused?.isConnected
      && host.contains(focused)
      && host.ownerDocument.activeElement === host.ownerDocument.body
      && focused.getClientRects().length
      && !focused.matches(':disabled')
      && !focused.closest(
        '[inert]'
      )
      && host.ownerDocument.defaultView!.getComputedStyle(
        focused
      ).visibility === 'visible')
      focused.focus({ preventScroll: true });
  });
  $effect(() => {
    if (nativeElement) return connectFeedbackFocus(nativeElement);
  });
</script>

{#snippet value(node: SpaceContent)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
{#if entries.length}
  <div {...rest} bind:this={nativeElement} dir={config.direction} class={[
      'ant-space ant-space-css-var',
      componentTheme.className,
      config.space?.class,
      `ant-space-${actualOrientation}`,
      config.direction === 'rtl' && 'ant-space-rtl',
      actualAlign && `ant-space-align-${actualAlign}`,
      gap.classes,
      className,
      rootClassName,
      classes.root
    ]}
    style={[componentTheme.style, wrap && 'flex-wrap:wrap', gap.style, slots.root].filter(
        Boolean
      ).join(
        ';'
      )}>
    {#each entries as item, index (item.key)}
      {#if spaceHasContent(item.children)}
        <div class={['ant-space-item', classes.item]} style={slots.item}>{@render value(item.children)}</div>
        {#if index < latest && actualSeparator}<span class={['ant-space-item-separator', classes.separator]} style={slots.separator}>{@render value(actualSeparator)}</span>{/if}
      {/if}
    {/each}
  </div>
{/if}
