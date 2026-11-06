<script lang="ts" generics="T = unknown, K extends ListyKey = ListyKey">
  import { tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { captureListyFocus } from './listy.dom';
  import { listyItemHeight } from './listy.engine';
  import type { ListyKey, ListyProps, ListySemantic } from './listy.types';
  import ListyRaw from './ListyRaw.svelte';
  import ListyVirtual from './ListyVirtual.svelte';

  let {
    ref = $bindable(),
    nativeElement = $bindable(),
    ...rawProps
  }: ListyProps<T, K> = $props();
  let {
    items = [],
    rowKey,
    itemRender,
    group,
    sticky,
    height,
    virtual,
    onScroll,
    onscroll,
    classNames,
    styles,
    prefixCls = 'ant-listy',
    class: className,
    rootClassName,
    style,
    ...attributes
  } = $derived(rawProps);

  const config = useConfig();
  const tokens = useDesignTokenContext();
  const componentTheme = useComponentTheme('Listy');
  let contextClasses = $derived(resolve(config.listy?.classNames));
  let localClasses = $derived(resolve(classNames));
  let contextStyles = $derived(resolve(config.listy?.styles));
  let localStyles = $derived(resolve(styles));
  let mergedClasses = $derived({
    root: join([config.listy?.class, contextClasses.root, localClasses.root,
      rootClassName, className, 'ant-listy-css-var', componentTheme.className], ' '),
    item: join([contextClasses.item, localClasses.item], ' '),
    groupHeader: join([contextClasses.groupHeader, localClasses.groupHeader], ' ')
  });
  let mergedStyles = $derived({
    root: join([
      componentTheme.style,
      tokens.enabled ? 'line-height:var(--ant-line-height)' : undefined,
      contextStyles.root, config.listy?.style, localStyles.root, style
    ], ';'),
    item: join([contextStyles.item, localStyles.item], ';'),
    groupHeader: join([contextStyles.groupHeader, localStyles.groupHeader], ';')
  });
  let forwarded = $derived(Object.fromEntries(Object.entries(attributes).filter(([name]) =>
    name === 'id' || name === 'role' || name === 'tabindex'
      || name.startsWith('aria-') || name.startsWith('data-')
  )));
  let shared = $derived({
    items,
    rowKey,
    itemRender,
    group,
    sticky,
    height,
    itemHeight: tokens.enabled ? listyItemHeight(tokens.state.token) : config.theme.compact ? 36 : 46,
    prefixCls,
    direction: config.direction,
    classNames: mergedClasses,
    styles: mergedStyles,
    onScroll: onScroll ?? onscroll,
    attributes: forwarded
  });

  function join(values: (string | undefined)[], separator: string) {
    return values.filter(Boolean).join(separator) || undefined;
  }

  function resolve(value: ListySemantic | undefined) {
    return (typeof value === 'function' ? value({ props: { ...rawProps } }) : value) ?? {};
  }

  $effect.pre(() => {
    void items;
    void rowKey;
    void group;
    const root = nativeElement;
    if (!root) return;
    const restore = untrack(() => captureListyFocus(root));
    let active = true;
    void tick().then(() => {
      if (active && nativeElement === root) restore?.();
    });
    return () => { active = false; };
  });
</script>

<style>
  :global(.ant-listy :focus-visible) { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { :global(.ant-listy .ant-listy-item) { transition: none; } }
</style>

{#if virtual ?? config.virtual ?? false}
  <ListyVirtual {...shared} bind:ref bind:nativeElement />
{:else}
  <ListyRaw {...shared} bind:ref bind:nativeElement />
{/if}
