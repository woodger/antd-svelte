<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { getCollapsePrefixCss } from './collapse-prefix.engine';
  import CollapseItemView from './CollapseItemView.svelte';
  import { provideCollapse } from './collapse-context';
  import { retainCollapseFocus } from './collapse.dom';
  import { useConfig } from './config-context';
  import {
    getCollapseFocusKey,
    getCollapseKeys,
    getCollapseTrigger,
    normalizeCollapseItems,
    toggleCollapseKey
  } from './collapse.engine';
  import type {
    CollapseActiveKey, CollapseExpandIconInfo, CollapseItem, CollapseProps, CollapseSemanticSlots
  } from './collapse.types';

  let {
    activeKey = $bindable<CollapseActiveKey | undefined>(),
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: CollapseProps = $props();
  let {
    items: sourceItems,
    children,
    defaultActiveKey,
    onChange,
    accordion = false,
    collapsible = 'header',
    expandIconPlacement,
    expandIconPosition,
    expandIcon,
    size,
    bordered = true,
    ghost = false,
    destroyOnHidden,
    destroyInactivePanel,
    headingLevel = 3,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    class: className = '',
    style,
    prefixCls,
    rootClassName,
    classNames,
    styles
  } = $derived(props);

  const config = useConfig();
  const componentTheme = useComponentTheme('Collapse');
  const generatedId = $props.id();
  const initialDefault = untrack(() => getCollapseKeys(defaultActiveKey));
  let root = $state<HTMLDivElement>();
  let repairFocus = false;
  let repairKey: string | undefined;
  let retainedFocus: HTMLElement | undefined;
  let active = true;
  let prefix = $derived(prefixCls || 'ant-collapse');
  let prefixCss = $derived(getCollapsePrefixCss(prefix));
  let placement = $derived(expandIconPlacement ?? expandIconPosition ?? 'start');
  let rootDestroy = $derived(destroyOnHidden ?? destroyInactivePanel ?? false);
  let resolvedExpandIcon = $derived(expandIcon ?? config.collapse?.expandIcon);
  let attributes = $derived(Object.fromEntries(Object.entries(props).filter(([name]) =>
    name.startsWith('aria-') || name.startsWith('data-')
  )));
  let semantics = $derived.by(() => {
    const info = { props: { ...props, activeKey, size: resolvedSize, bordered,
      expandIconPlacement: placement } };
    const contextClasses = config.collapse?.classNames;
    const contextStyles = config.collapse?.styles;
    const inheritedClasses = typeof contextClasses === 'function'
      ? contextClasses(info) : contextClasses;
    const inheritedStyles = typeof contextStyles === 'function'
      ? contextStyles(info) : contextStyles;
    const localClasses = typeof classNames === 'function' ? classNames(info) : classNames;
    const localStyles = typeof styles === 'function' ? styles(info) : styles;
    const classes: CollapseSemanticSlots = {};
    const slots: CollapseSemanticSlots = {};

    for (const slot of ['root', 'header', 'title', 'body', 'icon'] as const) {
      classes[slot] = [inheritedClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      slots[slot] = [
        inheritedStyles?.[slot], slot === 'root' && config.collapse?.style,
        localStyles?.[slot], slot === 'root' && style
      ].filter(Boolean).join(';');
    }

    return { classes, styles: slots };
  });
  let rootId = $derived(id ?? `ant-collapse-${generatedId}`);
  let members = $state.raw(new Map<symbol, {
    item: () => CollapseItem & { key: string };
    element: () => HTMLDivElement | undefined;
  }>());
  let nextIndex = 0;
  let legacy = $derived(!Array.isArray(sourceItems) && Boolean(children));
  let items = $derived(normalizeCollapseItems(sourceItems ?? []));
  let focusedItems = $derived.by(() => {
    if (!legacy) return items;
    const positions = Array.from(root?.children ?? []);
    return [...members.values()].sort((left, right) =>
      positions.indexOf(left.element()!) - positions.indexOf(right.element()!)
    ).map(member => member.item());
  });
  let openKeys = $derived(getCollapseKeys(activeKey ?? initialDefault, accordion));
  let resolvedSize = $derived(size ?? config.componentSize);
  let region = $derived(accordion || !legacy && items.length <= 6);

  provideCollapse({
    get prefix() { return prefix; },
    get direction() { return config.direction; },
    get headingLevel() { return headingLevel; },
    get collapsible() { return props.collapsible; },
    get destroyOnHidden() { return rootDestroy; },
    get region() { return region; },
    get classes() { return semantics.classes; },
    get styles() { return semantics.styles; },
    get openKeys() { return openKeys; },
    get expandIcon() { return resolvedExpandIcon; },
    itemId,
    toggle,
    iconInfo: expandIconInfo,
    register(item, element) {
      const id = Symbol();
      const index = nextIndex++;
      // SSR выводится напрямую: registry нужен только для client focus и toggle lookup.
      untrack(() => members.set(id, { item, element }));
      let mounted = false;
      return {
        index,
        mount() {
          mounted = true;
          members = new Map(untrack(() => members));
        },
        destroy() {
          untrack(() => {
            members.delete(id);
            if (mounted) members = new Map(members);
          });
        }
      };
    }
  });

  $effect(() => legacy && root ? retainCollapseFocus(root) : undefined);

  $effect.pre(() => {
    const container = root;
    const current = focusedItems;
    const open = openKeys;
    const modes = current.map((item) => getCollapseTrigger(item, collapsible));
    repairFocus = false;
    retainedFocus = undefined;
    if (!container) return;

    const focused = container.ownerDocument.activeElement;
    if (focused === container) {
      repairKey = getCollapseFocusKey(current, undefined, open, collapsible);
      repairFocus = repairKey !== undefined;
      return;
    }

    const panels = Array.from(container.children).filter(
      (element): element is HTMLElement => element instanceof HTMLElement
        && element.hasAttribute(
          'data-collapse-key'
        )
    );
    const previous = panels.find((element) => element.contains(focused));
    if (!previous || !(focused instanceof HTMLElement)) return;

    const key = previous.dataset.collapseKey;
    const index = current.findIndex((item) => item.key === key);
    const trigger = previous.querySelector('[data-collapse-trigger]');
    const content = previous.querySelector(':scope > [data-collapse-panel]');
    const extra = previous.querySelector(':scope > [data-ant-collapse-part="header"] > [data-ant-collapse-part="extra"]');
    if (index === -1
      || focused === trigger
      && modes[index] === 'disabled'
      || content?.contains(
        focused
      )
      && !open.includes(
        key!
      )
      || extra?.contains(
        focused
      )
      && !current[index]?.extra) {
      repairFocus = true;
      repairKey = key;
    } else if (panels.length !== current.length
      || current.some(
        (item, position) => item.key !== panels[position]?.dataset.collapseKey
      ))
      retainedFocus = focused;
  });

  $effect(() => {
    const container = root;
    const target = getCollapseFocusKey(focusedItems, repairKey, openKeys, collapsible);
    const previous = retainedFocus;
    retainedFocus = undefined;
    if (!container) return;

    if (repairFocus) {
      repairFocus = false;
      untrack(() => focusHeader(target));
    }
    else if (previous?.isConnected
      && previous.getClientRects().length
      && !previous.matches(
        ':disabled'
      )
      && container.ownerDocument.activeElement === container.ownerDocument.body)
      untrack(() => previous.focus({ preventScroll: true }));
  });

  onMount(() => {
    ref = root;

    return () => {
      nativeElement = undefined;
      ref = undefined;
    };
  });

  $effect(() => { nativeElement = root; });

  onDestroy(() => {
    active = false;
  });

  function itemId(key: string, kind: 'header' | 'panel' | 'label') {
    const encoded = Array.from(key, (character) => character.codePointAt(0)!.toString(16)).join(
      '-'
    );
    return `${rootId}-${kind}-${encoded || 'empty'}`;
  }

  function focusHeader(key: string | undefined) {
    const panel = Array.from(root?.children ?? []).find(
      (element) => element instanceof HTMLElement && element.dataset.collapseKey === key
    );
    const button = panel?.querySelector<HTMLButtonElement>('[data-collapse-trigger]');
    (button && !button.disabled ? button : root)?.focus({ preventScroll: true });
  }

  function expandIconInfo(
    item: CollapseItem & { key: string },
    open: boolean,
    classNames: CollapseSemanticSlots,
    styles: CollapseSemanticSlots
  ): CollapseExpandIconInfo {
    const { key, label, ref: _ref, ...panelProps } = item;

    return {
      ...panelProps, panelKey: key, header: label, isActive: open,
      accordion: props.accordion, collapsible: item.collapsible ?? props.collapsible,
      prefixCls: prefix, destroyOnHidden: item.destroyOnHidden ?? rootDestroy,
      classNames: { ...semantics.classes, ...classNames },
      styles: { ...semantics.styles, ...styles },
      onItemClick: key => {
        if (getCollapseTrigger(item, collapsible) !== 'disabled') toggle(key, undefined, item);
      }
    };
  }

  function toggle(key: string, event?: MouseEvent, sourceItem?: CollapseItem) {
    const item = focusedItems.find((entry) => entry.key === key);
    if (!active
      || event?.defaultPrevented
      || !item
      || getCollapseTrigger(item, collapsible) === 'disabled') return;

    const next = toggleCollapseKey(activeKey ?? initialDefault, key, accordion);
    activeKey = [...next];
    onChange?.(next);
    (sourceItem ?? item).onItemClick?.(key);
  }
</script>

<style>
  [data-ant-collapse] { min-width: 0; max-width: 100%; --ant-collapse-toggle-padding: var(--ant-collapse-header-padding); --ant-collapse-extra-spacing: var(--ant-padding); }
  [data-ant-collapse][data-size="small"] { --ant-collapse-toggle-padding: var(--ant-collapse-header-padding-sm); --ant-collapse-extra-spacing: var(--ant-padding-sm); }
  [data-ant-collapse][data-size="large"] { --ant-collapse-toggle-padding: var(--ant-collapse-header-padding-lg); --ant-collapse-extra-spacing: var(--ant-padding-lg); }
  .ant-collapse-empty { padding: var(--ant-padding-sm); color: var(--ant-color-text-description); }
  [data-ant-collapse]:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -3px; }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`collapse-prefix:${prefix}`} />{/if}
<div {...attributes} bind:this={root} id={rootId} role="group" aria-label={ariaLabel}
  aria-labelledby={ariaLabelledby} tabindex="-1" dir={config.direction} data-ant-collapse
  data-ant-collapse-prefix={prefixCss ? prefix : undefined} data-size={resolvedSize}
  data-placement={placement} class={[
    prefix, 'ant-collapse-css-var', `${prefix}-icon-placement-${placement}`,
    resolvedSize !== 'middle' && `${prefix}-${resolvedSize}`,
    !bordered && `${prefix}-borderless`, ghost && `${prefix}-ghost`,
    config.direction === 'rtl' && `${prefix}-rtl`, config.collapse?.class, className,
    rootClassName, semantics.classes.root, componentTheme.className
  ]} style={[componentTheme.style, semantics.styles.root].filter(Boolean).join(';') || undefined}>
  {#if legacy}{@render children?.()}
  {:else}{#each items as item (item.key)}
    <CollapseItemView {item} />
  {:else}<div class="ant-collapse-empty">{config.locale.emptyText}</div>{/each}{/if}
</div>
