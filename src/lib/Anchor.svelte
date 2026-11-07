<script lang="ts">
  import { tick, untrack } from 'svelte';
  import Affix from './Affix.svelte';
  import AnchorItems from './AnchorItems.svelte';
  import { useConfig } from './config-context';
  import { setAnchor } from './anchor-context';
  import { createAnchorRuntime } from './anchor.dom';
  import { anchorSemantics } from './anchor-semantic.engine';
  import { revealAnchorLink } from './anchor-scroll.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import { useComponentTheme } from './theme-component.svelte';
  import type { AnchorProps } from './anchor.types';
  let {
    items,
    offsetTop,
    bounds,
    affix = true,
    showInkInFixed = false,
    getContainer,
    getCurrentAnchor,
    onClick,
    onChange,
    targetOffset,
    direction = 'vertical',
    replace,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: AnchorProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Anchor');
  // Spread props могут сбросить выходной ref; runtime сохраняет собственный DOM host.
  let host = $state<HTMLDivElement>();
  let activeLink = $state<string | null>(null);
  let ink = $state<HTMLSpanElement>();
  let runtime = $state.raw<ReturnType<typeof createAnchorRuntime>>();
  let registrations = $state.raw<readonly { href: string; targetOffset?: number; }[]>([]);
  // Cleanup effects могут читать прошлый rune snapshot; Map сохраняет актуальные регистрации.
  const registeredLinks = new Map<string, (typeof registrations)[number]>();
  const defaultContainer = () => window;
  let container = $derived(getContainer ?? config.getTargetContainer ?? defaultContainer);
  let info = $derived(
    {
      props: {
        ...rest,
        items,
        offsetTop,
        bounds,
        affix,
        showInkInFixed,
        getContainer,
        getCurrentAnchor,
        onClick,
        onChange,
        targetOffset,
        direction,
        replace,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let semantic = $derived(anchorSemantics(config.anchor, info.props));
  let classes = $derived(semantic.classes);
  let slots = $derived(semantic.styles);
  setAnchor({
    get activeLink() {
      return activeLink;
    },
    get direction() {
      return direction;
    },
    get classNames() {
      return classes;
    },
    get styles() {
      return slots;
    },
    register(href, targetOffset) {
      if (!registeredLinks.has(href) || targetOffset !== undefined)
        registeredLinks.set(href, { href, targetOffset });
      registrations = [...registeredLinks.values()];
      return () => {
        registeredLinks.delete(href);
        registrations = [...registeredLinks.values()];
      };
    },
    click(event, href, title, offset) {
      onClick?.(event, { title, href });
      runtime?.scrollTo(href, offset);
    }
  });
  $effect(() => {
    nativeElement = host;
    return () => { nativeElement = undefined; };
  });
  $effect(() => {
    if (!host) return;
    const controller = createAnchorRuntime(host, href => {
      activeLink = href;
    });
    runtime = controller;
    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });
  $effect(() => {
    const options = {
      getContainer: container,
      links: registrations,
      offsetTop,
      bounds,
      targetOffset,
      getCurrentAnchor,
      onChange
    };
    const controller = runtime;
    container();
    untrack(() => controller?.configure(options));
  });
  $effect(() => {
    // Semantic style заменяет inline attribute; измеряем после commit дочерних links/styles.
    void [
      activeLink, direction, registrations, getCurrentAnchor, classes, slots,
      className, rootClassName, config.anchor?.class
    ];
    const root = host;
    const indicator = ink;
    if (!root || !indicator) return;
    let active = true;

    void tick().then(() => {
      if (!active) return;
      const link = root.querySelector<HTMLElement>('.ant-anchor-link-title-active');
      if (!link) return;
      indicator.style.top = direction === 'horizontal'
        ? ''
        : `${link.offsetTop + link.clientHeight / 2}px`;
      indicator.style.height = direction === 'horizontal' ? '' : `${link.clientHeight}px`;
      indicator.style.left = direction === 'horizontal' ? `${link.offsetLeft}px` : '';
      indicator.style.width = direction === 'horizontal' ? `${link.clientWidth}px` : '';
      if (direction === 'horizontal')
        untrack(() => revealAnchorLink(link));
    });

    return () => {
      active = false;
    };
  });
  $effect(() => {
    if (host) return connectFeedbackFocus(host);
  });
</script>

<style>
  .ant-anchor-wrapper :global(.ant-anchor-link-title) { text-decoration:var(--ant-link-decoration, none); }
  .ant-anchor-wrapper :global(.ant-anchor-link-title:is(:hover,:active)) { text-decoration:var(--ant-link-hover-decoration, none); }
  .ant-anchor-wrapper :global(.ant-anchor-link-title:focus) { text-decoration:var(--ant-link-focus-decoration, none); }
</style>

{#snippet content()}
  <div {...rest} bind:this={host} dir={config.direction}
    class={[
        'ant-anchor-wrapper ant-anchor-css-var',
        componentTheme.className,
        componentTheme.className && 'ant-anchor-source-theme',
        direction === 'horizontal' && 'ant-anchor-wrapper-horizontal',
        config.direction === 'rtl' && 'ant-anchor-rtl',
        className,
        config.anchor?.class,
        rootClassName,
        classes.root
      ]}
    style={[
        componentTheme.style,
        `max-height:${offsetTop ? `calc(100vh - ${offsetTop}px)` : '100vh'}`,
        slots.root
      ].filter(
        Boolean
      ).join(
        ';'
      )}>
    <div class={['ant-anchor', !affix && !showInkInFixed && 'ant-anchor-fixed']}>
      <span bind:this={ink} class={[
          'ant-anchor-ink',
          classes.indicator,
          activeLink && 'ant-anchor-ink-visible'
        ]} style={slots.indicator}></span>
      <AnchorItems {items} {replace} />
    </div>
  </div>
{/snippet}
{#if affix}<Affix offsetTop={offsetTop} target={container} {...typeof affix === 'object' ? affix : {}}>{@render content()}</Affix>{:else}{@render content()}{/if}
