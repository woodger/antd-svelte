<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import { on } from 'svelte/events';
  import type { MenuEntry } from './menu.engine';
  import { menuSubMenu } from './menu.engine';
  import type { MenuTheme } from './menu.types';
  import { useMenu } from './menu-context';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import { connectComponentTheme } from './theme-component.dom';
  import type { TooltipPlacement } from './tooltip.types';
  import MenuList from './MenuList.svelte';
  import MenuPopupContent from './MenuPopupContent.svelte';

  let { entry, theme }: { entry: MenuEntry; theme: MenuTheme; } = $props();
  const context = useMenu();
  let item = $derived(menuSubMenu(entry));
  let actualTheme = $derived(item.theme ?? theme);
  let opened = $derived(context.open.includes(entry.key));
  let blocked = $derived(context.disabled || Boolean(item.disabled));
  let childrenActive = $state(false);
  let active = $derived(!blocked && (context.active === entry.key
    || context.mode !== 'inline' && (childrenActive
      || entry.children.some(child => contains(child, context.active)))));
  const nestedStyle = $derived(context.componentTheme.className
    ? `${context.componentTheme.inheritedStyle};color:inherit;font:inherit` : undefined);
  let selected = $derived(
    context.selected.some(key => entry.children.some(child => contains(child, key)))
  );
  let title = $state<HTMLButtonElement>();
  let popup = $state<HTMLDivElement>();
  let popupContainer = $state<HTMLElement | ShadowRoot>();
  let client = $state(false);
  let shown = $state(false);
  let popupPlacement = $state<TooltipPlacement>();
  const placementClass = $derived.by(() => {
    if (!context.componentTheme.className) return undefined;

    const horizontal = context.mode === 'horizontal' && !entry.parent;
    const side = popupPlacement ?? (horizontal ? 'bottom'
      : context.direction === 'rtl' ? 'left' : 'right');
    const rtl = context.direction === 'rtl';
    const name = side === 'left' ? `${rtl ? 'right' : 'left'}Top`
      : side === 'right' ? `${rtl ? 'left' : 'right'}Top` : `${side}Left`;

    return `ant-menu-submenu-placement-${name}`;
  });
  let mounted = $state(untrack(() => opened || context.forceRender));
  let popupMounted = $state(untrack(() => context.mode !== 'inline'
    && (opened || context.forceRender)
    || context.forceRender && Boolean(context.getPopupContainer)));
  let containerUsed = $state(untrack(() => Boolean(context.getPopupContainer)));
  let timer: ReturnType<typeof setTimeout> | undefined;
  onMount(() => { client = true; });

  function resolveContainer(trigger?: HTMLElement) {
    const target = context.getPopupContainer!(trigger!);
    popupContainer = target;
    return target;
  }
  $effect.pre(() => {
    const getter = context.getPopupContainer;
    if (!getter) popupContainer = undefined;
    // Обычное Menu открывает Trigger после RAF; forceRender допускает первый undefined.
    else if (context.forceRender && !title && !getter.length) resolveContainer(undefined);
  });
  const portal = createPopupContainer(() => ({
    open: context.mode !== 'inline' && opened || context.forceRender,
    rendered: popupMounted && (context.mode !== 'inline' || client && containerUsed),
    reference: title,
    getPopupContainer: context.getPopupContainer ? resolveContainer : undefined,
    themeStyle: context.componentTheme.style
  }));

  function contains(node: MenuEntry, key: string | null): boolean {
    return key !== null && (node.key === key || node.children.some(child => contains(child, key)));
  }
  function register(element: HTMLButtonElement) {
    return { destroy: context.register(entry.key, element) };
  }
  function connectEvents(element: HTMLUListElement) {
    const keyboard = on(element, 'keydown', event => {
      const root = context.nativeElement;
      if (!root || root.contains(element)) return;

      // Portal сохраняет currentTarget корневого callback и исходный target события.
      const descriptor = Object.getOwnPropertyDescriptor(event, 'currentTarget');
      Object.defineProperty(event, 'currentTarget', { configurable: true, value: root });
      try {
        context.keydown(event as KeyboardEvent & { currentTarget: HTMLUListElement; });
      } finally {
        if (descriptor) Object.defineProperty(event, 'currentTarget', descriptor);
        else Reflect.deleteProperty(event, 'currentTarget');
      }
    });
    // Svelte сначала вызывает delegated child handlers внутри ShadowRoot, сохраняя domEvent.target.
    const click = on(element, 'click', () => {});
    return () => {
      keyboard();
      click();
    };
  }

  $effect(() => {
    if (opened || context.forceRender)
      mounted = true;
    if (context.getPopupContainer) containerUsed = true;
    if (context.mode !== 'inline' && (opened || context.forceRender)
      || context.forceRender && context.getPopupContainer) popupMounted = true;
  });
  $effect(() => context.registerHover(entry.key, hover));
  $effect(() => {
    if (!opened || context.mode === 'inline' || !popup || !title) return;

    const horizontal = context.mode === 'horizontal' && !entry.parent;
    return connectPopup(popup, title, {
      placement: horizontal ? 'bottom' : context.direction === 'rtl' ? 'left' : 'right',
      align: horizontal ? (context.direction === 'rtl' ? 'right' : 'left') : 'top',
      autoAdjustOverflow: true,
      maxWidth: '100vw',
      matchAnchorWidth: horizontal,
      gap: () => untrack(() => context.componentTheme.className ? 0 : undefined),
      // Исходное Menu оставляет controlled popup открытым даже при itemHeight=0.
      allowZeroSize: () => untrack(() => Boolean(context.componentTheme.className)),
      preserveFocus: false,
      onPlacement: next => { popupPlacement = next; },
      onVisibilityChange: next => {
        shown = next;
      },
      onDismiss: reason => {
        context.setOpen(entry, false);
        if (reason === 'escape')
          context.focusItem(entry.key);
      }
    });
  });
  $effect(() => {
    if (blocked || context.mode === 'inline' || context.trigger !== 'hover')
      cancel();
  });

  function cancel() {
    if (timer !== undefined)
      clearTimeout(timer);
    timer = undefined;
  }
  function hover(next: boolean) {
    childrenActive = next;
    cancel();
    if (blocked || context.mode === 'inline' || context.trigger !== 'hover') return;

    timer = setTimeout(() => {
      timer = undefined;
      context.setOpen(entry, next);
    }, Math.max(0, next ? context.openDelay : context.closeDelay) * 1000);
  }
  onDestroy(cancel);
</script>

<style>
  .ant-menu-submenu-title { display: block; width: 100%; padding-block: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: inherit; }
  .ant-menu-submenu-title:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: -2px; }
  .menu-popup { position: fixed; margin: 0; border: 0; overflow: visible; background: transparent; }
  /* Horizontal vendor display не должен раскрывать forceSubMenuRender popup. */
  .menu-popup[hidden] { display: none; }
  .menu-popup:global(.ant-menu-source-theme) { border-radius: var(--ant-border-radius-lg); }
</style>

<li role="none" class={[
    'ant-menu-submenu',
    `ant-menu-submenu-${context.mode}`,
    opened && 'ant-menu-submenu-open',
    selected && 'ant-menu-submenu-selected',
    blocked && 'ant-menu-submenu-disabled',
    active && 'ant-menu-submenu-active',
    item.class
  ]}
  style={item.style} onmouseenter={() => {
      if (!blocked)
        context.activate(entry.key);
      context.hover(entry, true);
    }}
  onmouseleave={() => {
      if (context.active === entry.key)
        context.activate(null);
      context.hover(entry, false);
    }}>
  <button type="button" disabled={blocked} bind:this={title} use:register id={context.id(entry.key)} data-menu-id={context.id(entry.key)}
    class="ant-menu-submenu-title" role="menuitem" tabindex={blocked ? undefined : -1} aria-disabled={blocked || undefined}
    aria-haspopup="menu" aria-expanded={opened} aria-controls={`${context.id(entry.key)}-popup`}
    title={item.title
        ?? (context.collapsed && typeof item.label === 'string'
          ? item.label
          : undefined)}
    aria-label={context.collapsed && !entry.parent
        ? (item.title ?? (typeof item.label === 'string' ? item.label : undefined))
        : undefined}
    style={[
        context.componentTheme.className && (context.mode === 'horizontal' && !entry.parent
          ? 'width:auto;padding-inline:0'
          : 'width:stretch;min-width:var(--ant-menu-item-width);max-width:var(--ant-menu-item-width)'),
        context.mode === 'inline' && `padding-${context.direction === 'rtl'
          ? 'right' : 'left'}:${entry.level * context.inlineIndent}px`
      ].filter(Boolean).join(';') || undefined}
    onclick={event => {
        cancel();
        context.titleClick(entry, event);
      }} onkeydown={event => {
          if (event.key === ' ')
            event.preventDefault();
        }}
    onfocus={() => {
        if (!blocked)
          context.activate(entry.key);
      }}>
    {#if item.icon}<span class="ant-menu-item-icon">{@render item.icon()}</span>{#if !context.componentTheme.className}{' '}{/if}{/if}{#if context.collapsed && !entry.parent && !item.icon && typeof item.label === 'string'}
      <span class="ant-menu-inline-collapsed-noicon">{item.label.charAt(0)}</span>
    {:else}<span class="ant-menu-title-content">{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label ?? ''}{/if}</span>{/if}
    {#if context.mode !== 'horizontal' || entry.parent}<i class="ant-menu-submenu-arrow" aria-hidden="true"></i>{/if}
  </button>
  {#if mounted}
    {#if context.mode === 'inline'}
      <ul id={`${context.id(entry.key)}-popup`} role="menu" data-menu-list="true"
        class={[
            'ant-menu ant-menu-css-var ant-menu-sub ant-menu-inline',
            !opened && 'ant-menu-hidden',
            context.direction === 'rtl' && 'ant-menu-rtl'
          ]}
        style={nestedStyle}
        hidden={!opened}><MenuList entries={entry.children} {theme} /></ul>
    {/if}
  {/if}
  {#if popupMounted && (context.mode !== 'inline' || client && containerUsed)}
    {#key popupContainer}
      <div bind:this={popup} role="presentation" popover="manual"
        hidden={context.mode === 'inline' || !opened || !shown}
        class={[
            'menu-popup ant-menu ant-menu-css-var ant-menu-submenu ant-menu-submenu-popup',
            context.componentTheme.className,
            context.componentTheme.className && 'ant-menu-source-theme',
            placementClass,
            `ant-menu-${actualTheme}`,
            context.direction === 'rtl' && 'ant-menu-rtl',
            item.popupClassName
          ]}
        style={untrack(() => context.componentTheme.style)}
        onmouseenter={() => context.hover(entry, true)}
        onmouseleave={() => context.hover(entry, false)}
        {@attach portal}
        {@attach node => connectComponentTheme(node, context.componentTheme.style)}>
        <ul id={`${context.id(entry.key)}-popup`} role="menu" data-menu-list="true"
          class={[
              'ant-menu ant-menu-css-var ant-menu-sub',
              context.mode === 'inline' ? 'ant-menu-inline' : 'ant-menu-vertical',
              context.direction === 'rtl' && 'ant-menu-rtl'
            ]} style={nestedStyle} {@attach connectEvents}>
          <MenuPopupContent entries={entry.children} {theme}
            isInlineCopy={context.mode === 'inline'} />
        </ul>
      </div>
    {/key}
  {/if}
</li>
