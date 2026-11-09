<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getAlertPrefixCss } from './alert-prefix.engine';
  import { resolveAlertClose } from './alert.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import RenderContent from './RenderContent.svelte';
  import { closeAlert, focusAfterAlert } from './alert.dom';
  import type { AlertContent, AlertProps, AlertSemanticSlots } from './alert.types';

  let {
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: AlertProps = $props();
  let {
    type,
    variant,
    title,
    description,
    showIcon,
    icon,
    action,
    banner = false,
    role = 'alert',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-live': ariaLive,
    'aria-atomic': ariaAtomic = true,
    'aria-hidden': ariaHidden,
    class: className = '',
    style,
    prefixCls,
    rootClassName,
    classNames,
    styles,
    onClick,
    onMouseEnter,
    onMouseLeave
  } = $derived(props);

  const config = useConfig();
  const componentTheme = useComponentTheme('Alert');
  let root = $state<HTMLDivElement>();
  let phase = $state<'open' | 'closing' | 'closed'>('open');
  let disposeMotion: (() => void) | undefined;
  let active = true;
  let prefix = $derived(config.getPrefixCls('alert', prefixCls));
  let prefixCss = $derived(getAlertPrefixCss(prefix));
  let resolvedVariant = $derived(variant ?? config.alert?.variant ?? 'outlined');
  let resolvedType = $derived(type ?? (banner ? 'warning' : 'info'));
  let hasIcon = $derived(banner && showIcon === undefined ? true : showIcon);
  let closeConfig = $derived(resolveAlertClose(props, config.alert));
  let resolvedIcon = $derived(icon ?? config.alert?.[`${resolvedType}Icon`]);
  let attributes = $derived(Object.fromEntries(Object.entries(props).filter(([name]) =>
    name.startsWith('aria-') || name.startsWith('data-')
  )));
  let semantics = $derived.by(() => {
    const info = { props: { ...props, prefixCls: prefix, variant: resolvedVariant,
      type: resolvedType, showIcon: hasIcon, closable: closeConfig.enabled } };
    const contextClasses = config.alert?.classNames;
    const contextStyles = config.alert?.styles;
    const inheritedClasses = typeof contextClasses === 'function'
      ? contextClasses(info) : contextClasses;
    const inheritedStyles = typeof contextStyles === 'function'
      ? contextStyles(info) : contextStyles;
    const localClasses = typeof classNames === 'function' ? classNames(info) : classNames;
    const localStyles = typeof styles === 'function' ? styles(info) : styles;
    const classes: AlertSemanticSlots = {};
    const slots: AlertSemanticSlots = {};

    for (const slot of ['root', 'icon', 'section', 'title', 'description', 'actions', 'close'] as const) {
      classes[slot] = [inheritedClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      slots[slot] = [
        inheritedStyles?.[slot], slot === 'root' && config.alert?.style,
        localStyles?.[slot], slot === 'root' && style
      ].filter(Boolean).join(';');
    }

    return { classes, styles: slots };
  });
  const statusIcon = {
    success: 'check-circle-filled',
    info: 'info-circle-filled',
    warning: 'exclamation-circle-filled',
    error: 'close-circle-filled'
  } as const;

  function isRenderable(value: AlertContent | undefined) {
    return value !== undefined && value !== null && value !== false && value !== '';
  }

  onMount(() => {
    ref = { nativeElement: root! };

    return () => {
      nativeElement = undefined;
      ref = undefined;
    };
  });

  $effect(() => { nativeElement = root; });

  onDestroy(() => {
    active = false;
    disposeMotion?.();
  });

  function handleClose(event: MouseEvent) {
    const node = root;
    if (!active || !node || phase !== 'open' || !closeConfig.enabled || closeConfig.disabled) return;

    const ownedFocus = node.contains(node.ownerDocument.activeElement);
    const onClose = closeConfig.onClose;
    const afterClose = closeConfig.afterClose;
    phase = 'closing';
    try {
      onClose?.(event);
    }
    finally {
      if (active && node.isConnected) {
        focusAfterAlert(node, ownedFocus);
        disposeMotion = closeAlert(node, () => {
          phase = 'closed';
          // afterClose видит уже удалённое содержимое и не вызывается после unmount.
          void tick().then(() => {
            if (active)
              afterClose?.();
          });
        });
      }
    }
  }
</script>

<style>
  [data-ant-alert] { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  [data-ant-alert][data-show="false"] { overflow: hidden; }
  [data-ant-alert-part="actions"] { min-width: 0; max-width: 50%; }
  [data-ant-alert-part="close"] { display: inline-flex; flex: none; align-items: center; justify-content: center; min-width: 24px; min-height: 24px; color: var(--ant-color-icon); }
  [data-ant-alert-part="close"]:hover:not(:disabled) { color: var(--ant-color-icon-hover); }
  .anticon-close { display: inline-flex; }
  [data-ant-alert-part="close"]:hover:not(:disabled) .anticon-close { color: var(--ant-color-icon-hover); }
  @media (max-width: 575px) {
    [data-ant-alert] { flex-wrap: wrap; align-items: flex-start; }
    [data-ant-alert-part="actions"] { order: 1; flex: 0 0 100%; max-width: 100%; margin-inline-start: 0; margin-block-start: var(--ant-margin-xs); }
  }
  @media (prefers-reduced-motion: reduce) { [data-ant-alert-part="close"] .anticon-close { transition: none; } }
</style>

{#if phase !== 'closed'}
  {#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`alert-prefix:${prefix}`} />{/if}<div {...attributes} bind:this={root} {id} {role} data-ant-alert
    data-ant-alert-prefix={prefixCss ? prefix : undefined} dir={config.direction}
    aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby}
    aria-live={ariaLive} aria-atomic={ariaAtomic}
    aria-hidden={phase === 'closing' ? true : ariaHidden}
    inert={phase === 'closing'} data-show={phase === 'open'} class={[
      prefix, 'ant-alert-css-var', `${prefix}-${resolvedType}`, `${prefix}-${resolvedVariant}`,
      isRenderable(description) && `${prefix}-with-description`, !hasIcon && `${prefix}-no-icon`,
      banner && `${prefix}-banner`, config.direction === 'rtl' && `${prefix}-rtl`,
      phase === 'closing' && `${prefix}-closing`, config.alert?.class, className,
      rootClassName, semantics.classes.root, componentTheme.className
    ]} style={[componentTheme.style, semantics.styles.root].filter(Boolean).join(';') || undefined}
    onclick={onClick} onmouseenter={onMouseEnter} onmouseleave={onMouseLeave}>
    {#if hasIcon}<span class={[`${prefix}-icon`, semantics.classes.icon]}
      data-ant-alert-part="icon" style={semantics.styles.icon || undefined} aria-hidden="true">
      {#if resolvedIcon !== undefined && resolvedIcon !== null}<RenderContent value={resolvedIcon} />
      {:else}<Icon name={statusIcon[resolvedType]} />{/if}
    </span>{/if}
    <div class={[`${prefix}-section`, semantics.classes.section]} data-ant-alert-part="section"
      style={semantics.styles.section || undefined}>
      {#if isRenderable(title)}<div class={[`${prefix}-title`, semantics.classes.title]}
        data-ant-alert-part="title" style={semantics.styles.title || undefined}>
        <RenderContent value={title} /></div>{/if}
      {#if isRenderable(description)}<div class={[`${prefix}-description`, semantics.classes.description]}
        data-ant-alert-part="description" style={semantics.styles.description || undefined}>
        <RenderContent value={description} /></div>{/if}
    </div>
    {#if isRenderable(action)}<div class={[`${prefix}-actions`, semantics.classes.actions]}
      data-ant-alert-part="actions" style={semantics.styles.actions || undefined}>
      <RenderContent value={action} /></div>{/if}
    {#if closeConfig.enabled}<button type="button" {...closeConfig.attributes}
      class={[`${prefix}-close-icon`, semantics.classes.close]} data-ant-alert-part="close"
      style={semantics.styles.close || undefined}
      disabled={phase === 'closing' || closeConfig.disabled}
      aria-label={closeConfig.attributes['aria-label'] ?? config.locale.closeText}
      onclick={handleClose}><span
        class={closeConfig.icon === true || closeConfig.icon === undefined ? 'anticon-close' : undefined}
        aria-hidden="true">
        {#if closeConfig.icon === true || closeConfig.icon === undefined}<Icon name="close" />
        {:else}<RenderContent value={closeConfig.icon} />{/if}
      </span></button>{/if}
  </div>
{/if}
