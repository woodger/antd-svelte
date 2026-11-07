<script lang="ts" generics="Params extends Record<string, unknown> = Record<string, unknown>">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { breadcrumbEntries, breadcrumbHasContent, breadcrumbItems } from './breadcrumb.engine';
  import { breadcrumbSemantics } from './breadcrumb-semantic.engine';
  import BreadcrumbEntry from './BreadcrumbEntry.svelte';
  import type { BreadcrumbContent, BreadcrumbProps } from './breadcrumb.types';

  let {
    items,
    routes,
    params = {} as Params,
    separator,
    dropdownIcon,
    itemRender,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: BreadcrumbProps<
    Params
  > = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Breadcrumb');
  let mergedSeparator = $derived(separator ?? config.breadcrumb?.separator ?? '/');
  let mergedDropdownIcon = $derived(dropdownIcon ?? config.breadcrumb?.dropdownIcon);
  let mergedItems = $derived(breadcrumbItems(items, routes));
  let entries = $derived(breadcrumbEntries(mergedItems, params));
  let info = $derived(
    {
      props: {
        ...rest,
        items,
        routes,
        params,
        separator: mergedSeparator,
        dropdownIcon,
        itemRender,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let semantic = $derived(breadcrumbSemantics(config.breadcrumb, info.props));
  let classes = $derived(semantic.classes);
  let slots = $derived(semantic.styles);
</script>

<style>
  .ant-breadcrumb :global(:where(a)) { text-decoration:var(--ant-link-decoration, none); }
  .ant-breadcrumb :global(:where(a:hover, a:active)) { text-decoration:var(--ant-link-hover-decoration, none); }
  .ant-breadcrumb :global(:where(a:focus)) { text-decoration:var(--ant-link-focus-decoration, none); }
</style>

{#snippet value(node: BreadcrumbContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
<nav {...rest} bind:this={nativeElement} dir={config.direction} class={[
    'ant-breadcrumb ant-breadcrumb-css-var',
    componentTheme.className,
    componentTheme.className && 'ant-breadcrumb-source-theme',
    config.direction === 'rtl' && 'ant-breadcrumb-rtl',
    config.breadcrumb?.class,
    className,
    rootClassName,
    classes.root
  ]} style={[componentTheme.style, slots.root].filter(Boolean).join(';')}>
  <ol>{#each entries as entry, index (entry.item.key ?? index)}
    {#if entry.item.type === 'separator'}
      <li class={['ant-breadcrumb-separator', classes.separator]} style={slots.separator} aria-hidden="true">{@render value(entry.item.separator ?? '/')}</li>
    {:else if itemRender || entry.item.menu || entry.title !== null}
      <BreadcrumbEntry {entry} {params} routes={items ?? routes ?? []} {itemRender} dropdownIcon={mergedDropdownIcon} {classes} styles={slots} />
      {#if index < entries.length - 1 && breadcrumbHasContent(mergedSeparator)}<li class={['ant-breadcrumb-separator', classes.separator]} style={slots.separator} aria-hidden="true">{@render value(mergedSeparator)}</li>{/if}
    {/if}
  {/each}</ol>
</nav>
