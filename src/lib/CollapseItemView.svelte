<script lang="ts">
  import { untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import RenderContent from './RenderContent.svelte';
  import CollapsePanel from './CollapsePanel.svelte';
  import { useCollapse } from './collapse-context';
  import { useConfig } from './config-context';
  import { getCollapseTrigger } from './collapse.engine';
  import { collapseItemAttributes } from './collapse-events.engine';
  import type { CollapseItem, CollapseSemanticSlots } from './collapse.types';

  let {
    item,
    nativeElement = $bindable()
  }: {
    item: CollapseItem & { key: string };
    nativeElement?: HTMLDivElement;
  } = $props();
  const parent = useCollapse();
  const config = useConfig();
  const generatedId = $props.id();
  let prefix = $derived(parent?.prefix || 'ant-collapse');
  let direction = $derived(parent?.direction ?? config.direction);
  let mode = $derived(getCollapseTrigger(item, parent?.collapsible));
  let open = $derived(parent?.openKeys.includes(item.key) ?? false);
  let headingLevel = $derived(parent?.headingLevel ?? 3);
  let region = $derived(parent?.region ?? false);
  let rootDestroy = $derived(parent?.destroyOnHidden ?? false);
  let resolvedExpandIcon = $derived(parent?.expandIcon);
  let attributes = $derived(collapseItemAttributes(item));
  let itemRef = $derived(item.ref);
  let itemClasses = $derived.by(() => {
    const result: CollapseSemanticSlots = {};
    for (const slot of ['header', 'title', 'body', 'icon'] as const) {
      result[slot] = [parent?.classes[slot], item.classNames?.[slot]]
        .filter(Boolean).join(' ');
    }
    return result;
  });
  let itemStyles = $derived.by(() => {
    const result: CollapseSemanticSlots = {};
    for (const slot of ['header', 'title', 'body', 'icon'] as const) {
      result[slot] = [parent?.styles[slot], item.styles?.[slot]]
        .filter(Boolean).join(';');
    }
    return result;
  });

  $effect(() => {
    const callback = itemRef;
    const node = nativeElement;
    if (!callback || !node) return;

    untrack(() => callback(node));
    return () => { untrack(() => callback(null)); };
  });

  function itemId(key: string, kind: 'header' | 'panel' | 'label') {
    return parent?.itemId(key, kind) ?? `ant-collapse-${generatedId}-${kind}`;
  }

  function handleToggle(event: MouseEvent) {
    if (parent) parent.toggle(item.key, event, item);
    else if (!event.defaultPrevented && mode !== 'disabled') item.onItemClick?.(item.key);
  }
</script>

<style>
  :global([data-ant-collapse]) > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] { padding: 0; align-items: center; cursor: default; }
  .ant-collapse-heading { flex: 1; min-width: 0; margin: 0; font: inherit; color: inherit; }
  .ant-collapse-trigger { display: flex; align-items: flex-start; width: 100%; min-width: 0; margin: 0; padding: var(--ant-collapse-toggle-padding); border: 0; border-radius: inherit; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
  .ant-collapse-trigger:disabled { cursor: not-allowed; }
  .ant-collapse-trigger:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -3px; }
  [data-ant-collapse-part="title"] { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  :global([data-ant-collapse]) > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] [data-ant-collapse-part="icon"] { height: 1lh; }
  :global([data-ant-collapse][data-size="small"][data-placement="start"]) > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] [data-ant-collapse-part="icon"] { margin-inline-start: calc(var(--ant-padding-sm) - var(--ant-padding-xs)); }
  :global([data-ant-collapse][data-size="large"][data-placement="start"]) > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] [data-ant-collapse-part="icon"] { margin-inline-start: calc(var(--ant-padding-lg) - var(--ant-padding)); }
  .ant-collapse-trigger-icon { pointer-events: none; cursor: default; }
  .ant-collapse-trigger-icon [data-ant-collapse-part="icon"] { pointer-events: auto; cursor: pointer; }
  [data-ant-collapse-part="extra"] { flex: none; min-width: 0; max-width: 45%; margin-inline-end: var(--ant-collapse-extra-spacing); overflow-wrap: anywhere; }
  @media (prefers-reduced-motion: reduce) { :global([data-ant-collapse]) > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"], :global([data-ant-collapse]) > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] [data-ant-collapse-part="arrow"] { animation: none; transition: none; } }
</style>

<div {...attributes} bind:this={nativeElement} id={item.id} data-collapse-key={item.key} data-ant-collapse-part="item" class={[
  `${prefix}-item`, open && `${prefix}-item-active`,
  mode === 'disabled' && `${prefix}-item-disabled`, item.class
]} style={item.style}>
  <div data-ant-collapse-part="header" class={[
    item.headerClass, `${prefix}-header`, mode === 'icon' && `${prefix}-collapsible-icon`
  ]}>
    <svelte:element this={`h${headingLevel}`} class="ant-collapse-heading">
      <button type="button" id={itemId(item.key, 'header')} data-collapse-trigger={item.key}
        aria-expanded={open} aria-controls={itemId(item.key, 'panel')}
        disabled={mode === 'disabled'} class={[
          'ant-collapse-trigger', mode === 'icon' && 'ant-collapse-trigger-icon',
          itemClasses.header
        ]} style={itemStyles.header || undefined} onclick={handleToggle}>
        {#if item.showArrow !== false}<span class={[`${prefix}-expand-icon`, itemClasses.icon]}
          data-ant-collapse-part="icon" style={itemStyles.icon || undefined} aria-hidden="true">
          {#if resolvedExpandIcon}<span class={`${prefix}-arrow`} data-ant-collapse-part="arrow">
            {@render resolvedExpandIcon(parent!.iconInfo(item, open, itemClasses, itemStyles))}</span>
          {:else}<span class={`${prefix}-arrow`} data-ant-collapse-part="arrow"
            style:transform={`rotate(${open ? 90 : direction === 'rtl' ? 180 : 0}deg)`}>
            <Icon name="right" /></span>{/if}
        </span>{/if}
        <span id={itemId(item.key, 'label')} class={[`${prefix}-title`, itemClasses.title]}
          data-ant-collapse-part="title" style={itemStyles.title || undefined}>
          <RenderContent value={item.label} /></span>
      </button>
    </svelte:element>
    {#if item.extra !== undefined && item.extra !== null && typeof item.extra !== 'boolean'}
      <div class={`${prefix}-extra`} data-ant-collapse-part="extra">
        <RenderContent value={item.extra} /></div>{/if}
  </div>
  <CollapsePanel id={itemId(item.key, 'panel')} labelledBy={itemId(item.key, 'header')}
    itemKey={item.key} {open} {region} children={item.children} forceRender={item.forceRender}
    destroyOnHidden={item.destroyOnHidden ?? rootDestroy} {prefix}
    bodyClass={itemClasses.body} bodyStyle={itemStyles.body} />
</div>
