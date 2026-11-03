<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getTagColor } from './tag-color.engine';
  import { getTagClose } from './tag-close.engine';
  import { getTagPrefixCss } from './tag-prefix.engine';
  import { connectTagStyle } from './tag-style.dom';
  import { useWave } from './wave.svelte';
  import { connectWaveLink } from './wave.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import Icon from './Icon.svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { TagProps, TagSemantic } from './tag.types';

  let { nativeElement = $bindable(), ...props }: TagProps = $props();
  let {
    children,
    icon,
    closeLabel,
    disabled,
    onClose,
    onClick,
    onclick,
    id,
    dir,
    role,
    href,
    target,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-disabled': ariaDisabled,
    class: className = '',
    style,
    rootClassName,
    prefixCls,
    classNames,
    styles
  } = $derived(props);
  const config = useConfig();
  const componentTheme = useComponentTheme('Tag');
  const wave = useWave('Tag', () => blocked);
  const generatedId = $props.id();
  let host = $derived(nativeElement);
  let prefix = $derived(prefixCls || 'ant-tag');
  let prefixCss = $derived(getTagPrefixCss(prefix));
  let waveLink = $state(false);
  let closed = $state(false);
  let active = true;
  let closing = false;
  let blocked = $derived(disabled ?? config.componentDisabled);
  let close = $derived(getTagClose(props, config.tag));
  let showClose = $derived(close.visible);
  const owned = new Set([
    'children', 'icon', 'closeIcon', 'closable', 'closeLabel', 'disabled', 'onClose',
    'onClick', 'onclick', 'id', 'dir', 'role', 'href', 'target', 'aria-label',
    'aria-labelledby', 'aria-describedby', 'aria-disabled', 'class', 'style', 'rootClassName',
    'classNames', 'styles', 'color', 'variant', 'bordered', 'prefixCls'
  ]);
  let attributes = $derived(Object.fromEntries(Object.entries(props)
    .filter(([key]) => !owned.has(key))));
  let color = $derived(getTagColor(props, config.tag?.variant));
  let info = $derived({ props: {
    ...props,
    color: color.color,
    variant: color.variant,
    disabled: blocked
  } });
  const resolve = (value: TagSemantic | undefined) =>
    (typeof value === 'function' ? value(info) : value) ?? {};
  let contextClasses = $derived(resolve(config.tag?.classNames));
  let localClasses = $derived(resolve(classNames));
  let contextStyles = $derived(resolve(config.tag?.styles));
  let localStyles = $derived(resolve(styles));
  let rootStyle = $derived([
    componentTheme.style,
    !blocked && color.style.map(([name, value]) => `${name}:${value}`).join(';'),
    contextStyles.root,
    config.tag?.style,
    localStyles.root,
    style
  ].filter(Boolean).join(';') || undefined);
  let iconStyle = $derived([contextStyles.icon, localStyles.icon].filter(Boolean).join(';') || undefined);
  let contentStyle = $derived(
    [contextStyles.content, localStyles.content].filter(Boolean).join(';') || undefined
  );
  let closeStyle = $derived(
    [contextStyles.close, localStyles.close].filter(Boolean).join(';') || undefined
  );
  let contentId = $derived(`ant-tag-content-${generatedId}`);
  let rootAttributes = $derived({
    ...attributes,
    id,
    role: role ?? (!href && (ariaLabel || ariaLabelledby) ? 'group' as const : undefined),
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-disabled': href && blocked ? true : ariaDisabled,
    dir: dir ?? config.direction,
    href: blocked ? undefined : href,
    target,
    'data-ant-tag-color': color.internal ? color.color
      : props.color === undefined ? 'default' : undefined,
    'data-ant-tag-variant': color.variant,
    'data-ant-tag-disabled': blocked ? '' : undefined
  });
  let rootClasses = $derived([
    prefix,
    'ant-tag-css-var',
    componentTheme.className,
    config.tag?.class,
    contextClasses.root,
    localClasses.root,
    color.internal && `${prefix}-${color.color}`,
    props.color === undefined && !color.internal && `${prefix}-default`,
    `${prefix}-${color.variant}`,
    blocked && `${prefix}-disabled`,
    config.theme.mode === 'dark' && !componentTheme.className && 'ant-tag-dark',
    config.direction === 'rtl' && `${prefix}-rtl`,
    className,
    rootClassName
  ]);

  function rootStyles(node: HTMLElement) {
    const update = connectTagStyle(node);
    $effect(() => update([
      componentTheme.style,
      blocked ? undefined : color.style,
      contextStyles.root,
      config.tag?.style,
      localStyles.root,
      style
    ]));
  }

  function iconStyles(node: HTMLSpanElement) {
    const update = connectTagStyle(node);
    $effect(() => update([contextStyles.icon, localStyles.icon]));
  }

  function contentStyles(node: HTMLSpanElement) {
    const update = connectTagStyle(node);
    $effect(() => update(icon ? [contextStyles.content, localStyles.content] : []));
  }

  function closeStyles(node: HTMLButtonElement) {
    const update = connectTagStyle(node);
    $effect(() => update([contextStyles.close, localStyles.close]));
  }

  onDestroy(() => {
    active = false;
  });
  $effect(() => {
    const node = host;
    if (node && showClose) return connectFeedbackFocus(node);
  });
  $effect(() => {
    const node = host;
    if (node) return connectWaveLink(node, value => { waveLink = value; });
  });

  function handleClick(
    event: MouseEvent & { currentTarget: EventTarget & (HTMLSpanElement | HTMLAnchorElement); }
  ) {
    if (!blocked) (onclick ?? onClick)?.(event);
  }

  function handleClose(event: MouseEvent) {
    event.stopPropagation();
    if (!active || closed || closing || blocked || !showClose || event.defaultPrevented) return;

    const linked = Boolean(href);
    closing = true;
    try {
      onClose?.(event);
    } finally {
      closing = false;
    }
    if (!event.defaultPrevented) {
      if (linked) event.preventDefault();
      if (active) closed = true;
    }
  }

  function connectClose(node: HTMLButtonElement) {
    function handleCloseKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      if (!event.repeat) node.click();
    }

    // Прямой listener останавливает всплытие до нативных обработчиков родителя.
    node.addEventListener('click', handleClose);
    node.addEventListener('keydown', handleCloseKeyDown);
    return () => {
      node.removeEventListener('click', handleClose);
      node.removeEventListener('keydown', handleCloseKeyDown);
    };
  }
</script>

<style>
  .ant-tag-css-var { display: inline-flex; align-items: center; min-width: 0; max-width: 100%; white-space: normal; vertical-align: middle; --ant-tag-default-color: var(--ant-color-text); }
  .ant-tag-dark { --ant-tag-default-bg: var(--ant-color-fill-tertiary); }
  .ant-tag-dark[data-ant-tag-color="default"][data-ant-tag-variant="solid"]:not([data-ant-tag-disabled]) { background-color: var(--ant-color-text); color: var(--ant-color-bg-container); }
  .ant-tag-dark[data-ant-tag-color="blue"] { --ant-tag-accent: var(--ant-blue-6); --ant-tag-dark-color: var(--ant-blue-4); }
  .ant-tag-dark[data-ant-tag-color="purple"] { --ant-tag-accent: var(--ant-purple-6); --ant-tag-dark-color: var(--ant-purple-4); }
  .ant-tag-dark[data-ant-tag-color="cyan"] { --ant-tag-accent: var(--ant-cyan-6); --ant-tag-dark-color: var(--ant-cyan-4); }
  .ant-tag-dark[data-ant-tag-color="green"] { --ant-tag-accent: var(--ant-green-6); --ant-tag-dark-color: var(--ant-green-4); }
  .ant-tag-dark[data-ant-tag-color="magenta"] { --ant-tag-accent: var(--ant-magenta-6); --ant-tag-dark-color: var(--ant-magenta-4); }
  .ant-tag-dark[data-ant-tag-color="pink"] { --ant-tag-accent: var(--ant-pink-6); --ant-tag-dark-color: var(--ant-pink-4); }
  .ant-tag-dark[data-ant-tag-color="red"] { --ant-tag-accent: var(--ant-red-6); --ant-tag-dark-color: var(--ant-red-4); }
  .ant-tag-dark[data-ant-tag-color="orange"] { --ant-tag-accent: var(--ant-orange-6); --ant-tag-dark-color: var(--ant-orange-4); }
  .ant-tag-dark[data-ant-tag-color="yellow"] { --ant-tag-accent: var(--ant-yellow-6); --ant-tag-dark-color: var(--ant-yellow-4); }
  .ant-tag-dark[data-ant-tag-color="volcano"] { --ant-tag-accent: var(--ant-volcano-6); --ant-tag-dark-color: var(--ant-volcano-4); }
  .ant-tag-dark[data-ant-tag-color="geekblue"] { --ant-tag-accent: var(--ant-geekblue-6); --ant-tag-dark-color: var(--ant-geekblue-4); }
  .ant-tag-dark[data-ant-tag-color="lime"] { --ant-tag-accent: var(--ant-lime-6); --ant-tag-dark-color: var(--ant-lime-4); }
  .ant-tag-dark[data-ant-tag-color="gold"] { --ant-tag-accent: var(--ant-gold-6); --ant-tag-dark-color: var(--ant-gold-4); }
  .ant-tag-dark[data-ant-tag-color="success"] { --ant-tag-accent: var(--ant-color-success); --ant-tag-dark-color: var(--ant-color-success); }
  .ant-tag-dark[data-ant-tag-color="processing"] { --ant-tag-accent: var(--ant-color-info); --ant-tag-dark-color: var(--ant-color-info); }
  .ant-tag-dark[data-ant-tag-color="error"] { --ant-tag-accent: var(--ant-color-error); --ant-tag-dark-color: var(--ant-color-error); }
  .ant-tag-dark[data-ant-tag-color="warning"] { --ant-tag-accent: var(--ant-color-warning); --ant-tag-dark-color: var(--ant-color-warning); }
  .ant-tag-dark:not([data-ant-tag-color="default"]):not([data-ant-tag-variant="solid"]):not([data-ant-tag-disabled]) { color: var(--ant-tag-dark-color); background-color: color-mix(in srgb, var(--ant-tag-accent) 15%, var(--ant-color-bg-container)); }
  .ant-tag-dark[data-ant-tag-variant="outlined"]:not([data-ant-tag-color="default"]):not([data-ant-tag-disabled]) { border-color: color-mix(in srgb, var(--ant-tag-accent) 40%, var(--ant-color-bg-container)); }
  .ant-tag-content { box-sizing: border-box; min-width: 0; overflow-wrap: anywhere; }
  .ant-tag-icon { box-sizing: border-box; display: inline-flex; flex: none; align-items: center; }
  .ant-tag-icon :global(svg) { max-width: 1em; max-height: 1em; }
  /* Нативная кнопка требует явного letter-spacing, который source span наследует. */
  [data-ant-tag-close] { display: inline-flex; align-items: center; justify-content: center; flex: none; min-width: 20px; min-height: 20px; border: 0; padding: 0; background: transparent; font: inherit; letter-spacing: inherit; }
  [data-ant-tag-close]:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -2px; border-radius: var(--ant-border-radius-sm); }
  [data-ant-tag-close]:disabled { cursor: not-allowed; }
  .ant-tag-dark [data-ant-tag-close] { color: inherit; }
  @media (prefers-reduced-motion: reduce) { .ant-tag-css-var, [data-ant-tag-close] { transition: none; } }
</style>

{#snippet tagContent()}
  {#if icon}<span
    class={['ant-tag-icon anticon', contextClasses.icon, localClasses.icon]}
    style={untrack(() => iconStyle)}
    {@attach iconStyles}
    aria-hidden="true"
    inert
  >{@render icon()}</span>{/if}<span
    class={['ant-tag-content', icon && contextClasses.content, icon && localClasses.content]}
    style={untrack(() => icon ? contentStyle : undefined)}
    {@attach contentStyles}
    id={contentId}
  >{@render children()}</span>
  {#if showClose}<button
    {...close.attributes}
    type="button"
    class={[`${prefix}-close-icon`, contextClasses.close, localClasses.close]}
    data-ant-tag-close=""
    style={untrack(() => closeStyle)}
    {@attach closeStyles}
    disabled={blocked}
    aria-label={closeLabel ?? ('aria-label' in close.attributes
      ? close.attributes['aria-label'] : config.locale.closeText)}
    aria-describedby={'aria-describedby' in close.attributes
      ? close.attributes['aria-describedby'] : contentId}
    aria-disabled={'aria-disabled' in close.attributes
      ? close.attributes['aria-disabled'] : blocked || undefined}
    {@attach connectClose}
  ><span aria-hidden="true" inert>{#if typeof close.icon === 'function'}{@render close.icon()}{:else if close.icon === undefined}<Icon name="close" />{:else if typeof close.icon !== 'boolean'}{close.icon ?? ''}{/if}</span></button>{/if}
{/snippet}

<!-- Явные a/span не перемещают SSR-корень при hydration и сохраняют фокус. -->
{#if !closed}
  {#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`tag-prefix:${prefix}`} />{/if}
  {#if href}
    <a
      {...rootAttributes}
      bind:this={nativeElement}
      class={rootClasses}
      style={untrack(() => rootStyle)}
      {@attach rootStyles}
      {@attach onClick || onclick || waveLink ? wave : undefined}
      onclick={handleClick}
    >{@render tagContent()}</a>
  {:else}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions (Source Tag.onClick сохраняет span; клавиатурой управляют native link/close.) -->
    <span
      {...rootAttributes}
      bind:this={nativeElement}
      class={rootClasses}
      style={untrack(() => rootStyle)}
      {@attach rootStyles}
      {@attach onClick || onclick || waveLink ? wave : undefined}
      onclick={handleClick}
    >{@render tagContent()}</span>
  {/if}
{/if}
