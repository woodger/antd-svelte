<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import RenderContent from './RenderContent.svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { getCollapsePrefixCss } from './collapse-prefix.engine';
  import CollapsePanel from './CollapsePanel.svelte';
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
    items: sourceItems = [],
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
  let items = $derived(normalizeCollapseItems(sourceItems));
  let openKeys = $derived(getCollapseKeys(activeKey ?? initialDefault, accordion));
  let resolvedSize = $derived(size ?? config.componentSize);
  let region = $derived(accordion || items.length <= 6);

  $effect.pre(() => {
    const container = root;
    const current = items;
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
    const target = getCollapseFocusKey(items, repairKey, openKeys, collapsible);
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
    const { key, label, ...panelProps } = item;

    return {
      ...panelProps, panelKey: key, header: label, isActive: open,
      accordion: props.accordion, collapsible: item.collapsible ?? props.collapsible,
      prefixCls: prefix, destroyOnHidden: item.destroyOnHidden ?? rootDestroy,
      classNames: { ...semantics.classes, ...classNames },
      styles: { ...semantics.styles, ...styles },
      onItemClick: key => {
        if (getCollapseTrigger(item, collapsible) !== 'disabled') toggle(key);
      }
    };
  }

  function toggle(key: string, event?: MouseEvent) {
    const item = items.find((entry) => entry.key === key);
    if (!active
      || event?.defaultPrevented
      || !item
      || getCollapseTrigger(item, collapsible) === 'disabled') return;

    const next = toggleCollapseKey(activeKey ?? initialDefault, key, accordion);
    activeKey = [...next];
    onChange?.(next);
    item.onItemClick?.(key);
  }
</script>

<style>
  [data-ant-collapse] { min-width: 0; max-width: 100%; --ant-collapse-toggle-padding: var(--ant-collapse-header-padding); --ant-collapse-extra-spacing: var(--ant-padding); }
  [data-ant-collapse][data-size="small"] { --ant-collapse-toggle-padding: var(--ant-collapse-header-padding-sm); --ant-collapse-extra-spacing: var(--ant-padding-sm); }
  [data-ant-collapse][data-size="large"] { --ant-collapse-toggle-padding: var(--ant-collapse-header-padding-lg); --ant-collapse-extra-spacing: var(--ant-padding-lg); }
  [data-ant-collapse] > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] { padding: 0; align-items: center; cursor: default; }
  .ant-collapse-heading { flex: 1; min-width: 0; margin: 0; font: inherit; color: inherit; }
  .ant-collapse-trigger { display: flex; align-items: flex-start; width: 100%; min-width: 0; margin: 0; padding: var(--ant-collapse-toggle-padding); border: 0; border-radius: inherit; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
  .ant-collapse-trigger:disabled { cursor: not-allowed; }
  .ant-collapse-trigger:focus-visible, [data-ant-collapse]:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -3px; }
  [data-ant-collapse-part="title"] { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  [data-ant-collapse] > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] [data-ant-collapse-part="icon"] { height: 1lh; }
  [data-ant-collapse][data-size="small"][data-placement="start"] > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] [data-ant-collapse-part="icon"] { margin-inline-start: calc(var(--ant-padding-sm) - var(--ant-padding-xs)); }
  [data-ant-collapse][data-size="large"][data-placement="start"] > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] [data-ant-collapse-part="icon"] { margin-inline-start: calc(var(--ant-padding-lg) - var(--ant-padding)); }
  .ant-collapse-trigger-icon { pointer-events: none; cursor: default; }
  .ant-collapse-trigger-icon [data-ant-collapse-part="icon"] { pointer-events: auto; cursor: pointer; }
  [data-ant-collapse-part="extra"] { flex: none; min-width: 0; max-width: 45%; margin-inline-end: var(--ant-collapse-extra-spacing); overflow-wrap: anywhere; }
  .ant-collapse-empty { padding: var(--ant-padding-sm); color: var(--ant-color-text-description); }
  @media (prefers-reduced-motion: reduce) { [data-ant-collapse] > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"], [data-ant-collapse] > [data-ant-collapse-part="item"] > [data-ant-collapse-part="header"] [data-ant-collapse-part="arrow"] { animation: none; transition: none; } }
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
  {#each items as item (item.key)}
    {@const mode = getCollapseTrigger(item, collapsible)}
    {@const open = openKeys.includes(item.key)}
    {@const itemClasses = {
      header: [semantics.classes.header, item.classNames?.header].filter(Boolean).join(' '),
      title: [semantics.classes.title, item.classNames?.title].filter(Boolean).join(' '),
      body: [semantics.classes.body, item.classNames?.body].filter(Boolean).join(' '),
      icon: [semantics.classes.icon, item.classNames?.icon].filter(Boolean).join(' ')
    }}
    {@const itemStyles = {
      header: [semantics.styles.header, item.styles?.header].filter(Boolean).join(';'),
      title: [semantics.styles.title, item.styles?.title].filter(Boolean).join(';'),
      body: [semantics.styles.body, item.styles?.body].filter(Boolean).join(';'),
      icon: [semantics.styles.icon, item.styles?.icon].filter(Boolean).join(';')
    }}
    <div {...Object.fromEntries(Object.entries(item).filter(([name]) =>
      name.startsWith('aria-') || name.startsWith('data-')
    ))} id={item.id} data-collapse-key={item.key} data-ant-collapse-part="item" class={[
      `${prefix}-item`, open && `${prefix}-item-active`,
      mode === 'disabled' && `${prefix}-item-disabled`, item.class
    ]} style={item.style}>
      <div data-ant-collapse-part="header" class={[
        `${prefix}-header`, mode === 'icon' && `${prefix}-collapsible-icon`
      ]}>
        <svelte:element this={`h${headingLevel}`} class="ant-collapse-heading">
          <button type="button" id={itemId(item.key, 'header')} data-collapse-trigger={item.key}
            aria-expanded={open} aria-controls={itemId(item.key, 'panel')}
            disabled={mode === 'disabled'} class={[
              'ant-collapse-trigger', mode === 'icon' && 'ant-collapse-trigger-icon',
              itemClasses.header
            ]} style={itemStyles.header || undefined} onclick={(event) => toggle(item.key, event)}>
            {#if item.showArrow !== false}<span class={[`${prefix}-expand-icon`, itemClasses.icon]}
              data-ant-collapse-part="icon" style={itemStyles.icon || undefined} aria-hidden="true">
              {#if resolvedExpandIcon}<span class={`${prefix}-arrow`} data-ant-collapse-part="arrow">
                {@render resolvedExpandIcon(expandIconInfo(item, open, itemClasses, itemStyles))}</span>
              {:else}<span class={`${prefix}-arrow`} data-ant-collapse-part="arrow"
                style:transform={`rotate(${open ? 90 : config.direction === 'rtl' ? 180 : 0}deg)`}>
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
  {:else}<div class="ant-collapse-empty">{config.locale.emptyText}</div>{/each}
</div>
