<script lang="ts">
  import { onMount } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectFeedbackFocus } from './feedback.dom';
  import { getResultPrefixCss } from './result-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import RenderContent from './RenderContent.svelte';
  import Icon from './Icon.svelte';
  import ResultImage from './ResultImage.svelte';
  import type { ResultContent, ResultProps, ResultSemanticSlots } from './result.types';

  let {
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: ResultProps = $props();
  let {
    status = 'info',
    title,
    subTitle,
    icon,
    extra,
    children,
    headingLevel = 2,
    id,
    role,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style,
    prefixCls,
    rootClassName,
    classNames,
    styles
  } = $derived(props);
  const config = useConfig();
  const componentTheme = useComponentTheme('Result');
  const icons = {
    success: 'check-circle-filled',
    error: 'close-circle-filled',
    info: 'exclamation-circle-filled',
    warning: 'warning-filled'
  } as const;
  let host = $state<HTMLDivElement>();
  let prefix = $derived(prefixCls || 'ant-result');
  let prefixCss = $derived(getResultPrefixCss(prefix));
  let kind = $derived(
    String(status) as 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500'
  );
  let exception = $derived(kind === '403' || kind === '404' || kind === '500' ? kind : undefined);
  let attributes = $derived(Object.fromEntries(Object.entries(props).filter(([name]) =>
    name.startsWith('aria-') || name.startsWith('data-')
  )));
  let semantics = $derived.by(() => {
    const info = { props: { ...props, status } };
    const contextClasses = config.result?.classNames;
    const contextStyles = config.result?.styles;
    const inheritedClasses = typeof contextClasses === 'function'
      ? contextClasses(info) : contextClasses;
    const inheritedStyles = typeof contextStyles === 'function'
      ? contextStyles(info) : contextStyles;
    const localClasses = typeof classNames === 'function' ? classNames(info) : classNames;
    const localStyles = typeof styles === 'function' ? styles(info) : styles;
    const classes: ResultSemanticSlots = {};
    const slots: ResultSemanticSlots = {};

    for (const slot of ['root', 'title', 'subTitle', 'body', 'extra', 'icon'] as const) {
      classes[slot] = [inheritedClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      slots[slot] = [
        inheritedStyles?.[slot],
        slot === 'root' && config.result?.style,
        localStyles?.[slot],
        slot === 'root' && style
      ].filter(Boolean).join(';');
    }

    return { classes, styles: slots };
  });

  function isRenderable(value: ResultContent | undefined) {
    return value !== undefined && value !== null && value !== false && value !== '';
  }

  onMount(() => {
    nativeElement = host;
    ref = { nativeElement: host! };

    return () => {
      nativeElement = undefined;
      ref = undefined;
    };
  });

  $effect(() => {
    const node = host;
    const interactive = Boolean(extra
      || children)
      || typeof title === 'function'
      || typeof subTitle === 'function'
      || Array.isArray(title)
      || Array.isArray(subTitle);
    if (node && interactive) return connectFeedbackFocus(node);
  });
</script>

<style>
  [data-ant-result] { min-width: 0; max-width: 100%; padding-inline: clamp(16px, 4vw, 32px); }
  [data-ant-result-part="title"] { font-weight: 400; }
  [data-ant-result-part="title"], [data-ant-result-part="subTitle"], [data-ant-result-part="body"] { min-width: 0; overflow-wrap: anywhere; }
  [data-ant-result-part="icon"] { min-width: 0; max-width: 100%; }
  [data-ant-result-part="icon"] :global(svg) { max-width: 100%; }
  [data-ant-result-image] { max-width: 100%; height: auto; }
  [data-ant-result-image] :global(svg) { display: block; width: 100%; height: auto; }
  [data-ant-result-part="extra"] { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--ant-padding-xs); min-width: 0; }
  [data-ant-result-part="extra"] > :global(*) { max-width: 100%; margin-inline-end: 0; }
  [data-ant-result-part="body"] { padding: var(--ant-padding-lg) clamp(16px, 5vw, 40px); }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`result-prefix:${prefix}`} />{/if}<div
  {...attributes} bind:this={host} {id} data-ant-result
  data-ant-result-prefix={prefixCss ? prefix : undefined}
  role={role ?? (ariaLabel || ariaLabelledby ? 'group' : undefined)}
  aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby}
  dir={config.direction} class={[
    'ant-result-css-var', prefix, `${prefix}-${kind}`,
    className, config.result?.class, rootClassName,
    config.direction === 'rtl' && `${prefix}-rtl`, componentTheme.className, semantics.classes.root
  ]} style={[componentTheme.style, semantics.styles.root].filter(Boolean).join(';') || undefined}>
  {#if exception || (icon !== false && icon !== null)}<div
    class={[`${prefix}-icon`, exception && `${prefix}-image`, semantics.classes.icon]}
    data-ant-result-part="icon" data-ant-result-image={exception ? '' : undefined}
    style={semantics.styles.icon || undefined} aria-hidden="true" inert>
    {#if exception}<ResultImage status={exception} />
    {:else if isRenderable(icon)}<RenderContent value={icon} />
    {:else}<span class={['anticon', `anticon-${icons[kind as keyof typeof icons].replace('-filled', '')}`]}>
      <Icon name={icons[kind as keyof typeof icons]} />
    </span>{/if}
  </div>{/if}
  {#if isRenderable(title)}<svelte:element this={`h${headingLevel}`}
    class={[`${prefix}-title`, semantics.classes.title]} data-ant-result-part="title"
    style={semantics.styles.title || undefined}><RenderContent value={title} /></svelte:element>{/if}
  {#if isRenderable(subTitle)}<div class={[`${prefix}-subtitle`, semantics.classes.subTitle]}
    data-ant-result-part="subTitle" style={semantics.styles.subTitle || undefined}>
    <RenderContent value={subTitle} />
  </div>{/if}
  {#if isRenderable(extra)}<div class={[`${prefix}-extra`, semantics.classes.extra]}
    data-ant-result-part="extra" style={semantics.styles.extra || undefined}>
    <RenderContent value={extra} />
  </div>{/if}
  {#if isRenderable(children)}<div class={[`${prefix}-body`, semantics.classes.body]}
    data-ant-result-part="body" style={semantics.styles.body || undefined}>
    <RenderContent value={children} />
  </div>{/if}
</div>
