<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { resolveSkeletonLayout } from './skeleton.engine';
  import { createSkeletonFocus } from './skeleton.dom';
  import { getSkeletonPrefixCss } from './skeleton-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { ruRU } from './types';
  import type { SkeletonProps, SkeletonSemanticInfo, SkeletonSemanticSlots } from './skeleton.types';

  let {
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: SkeletonProps = $props();
  let {
    loading = true,
    active = false,
    round = false,
    avatar = false,
    title = true,
    paragraph = true,
    children,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-hidden': ariaHidden,
    class: className = '',
    style,
    prefixCls,
    rootClassName,
    classNames,
    styles
  } = $derived(props);
  const config = useConfig();
  const componentTheme = useComponentTheme('Skeleton');
  const focus = createSkeletonFocus();
  let host = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let placeholder = $state<HTMLDivElement>();
  let prefix = $derived(config.getPrefixCls('skeleton', prefixCls));
  let prefixCss = $derived(getSkeletonPrefixCss(prefix));
  let layout = $derived(resolveSkeletonLayout({ avatar, title, paragraph }));
  let strings = $derived({ ...ruRU.skeleton, ...config.locale.skeleton });
  let label = $derived(ariaLabel ?? (ariaLabelledby ? undefined : strings.loadingText));
  let semanticInfo = $derived<SkeletonSemanticInfo>({ props: { ...props, avatar, title, paragraph } });
  let semantics = $derived.by(() => {
    const contextClasses = config.skeleton?.classNames;
    const contextStyles = config.skeleton?.styles;
    const inheritedClasses = typeof contextClasses === 'function'
      ? contextClasses(semanticInfo) : contextClasses;
    const inheritedStyles = typeof contextStyles === 'function'
      ? contextStyles(semanticInfo) : contextStyles;
    const localClasses = typeof classNames === 'function' ? classNames(semanticInfo) : classNames;
    const localStyles = typeof styles === 'function' ? styles(semanticInfo) : styles;
    const classes: SkeletonSemanticSlots = {};
    const slots: SkeletonSemanticSlots = {};

    for (const slot of ['root', 'header', 'section', 'avatar', 'title', 'paragraph'] as const) {
      classes[slot] = [inheritedClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      slots[slot] = [inheritedStyles?.[slot], slot === 'root' && config.skeleton?.style,
        localStyles?.[slot]].filter(Boolean).join(';');
    }
    return { classes, styles: slots };
  });
  let parts = $derived.by(() => {
    const settings = {
      avatar: avatar && typeof avatar === 'object' ? avatar : {},
      title: title && typeof title === 'object' ? title : {},
      paragraph: paragraph && typeof paragraph === 'object' ? paragraph : {}
    };

    return Object.fromEntries((['avatar', 'title', 'paragraph'] as const).map(slot => {
      const options = settings[slot];
      return [slot, {
        prefix: Object.hasOwn(options, 'prefixCls') ? options.prefixCls : `${prefix}-${slot}`,
        class: Object.hasOwn(options, 'class') ? options.class : semantics.classes[slot]
      }];
    })) as Record<'avatar' | 'title' | 'paragraph', { prefix?: string; class?: string; }>;
  });
  const api = { get nativeElement() { return placeholder ?? null; } };

  onMount(() => {
    ref = api;
    return () => { ref = undefined; };
  });
  $effect(() => {
    nativeElement = placeholder;
    return () => { nativeElement = undefined; };
  });

  $effect.pre(() => {
    const node = host;
    const container = content;
    const busy = loading;
    if (node)
      untrack(() => focus.update(node, container, busy));
  });
  onDestroy(() => focus.destroy());
</script>

<style>
  .ant-skeleton-host, .ant-skeleton-content { min-width: 0; max-width: 100%; }
  .ant-skeleton-host:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  [data-ant-skeleton-main] { display: flex; min-width: 0; max-width: 100%; }
  [data-ant-skeleton-main] [data-ant-skeleton-part="header"] { display: block; flex: 0 1 auto; min-width: 0; max-width: 50%; }
  [data-ant-skeleton-main] [data-ant-skeleton-part="header"]:only-child { max-width: 100%; padding-inline-end: 0; }
  [data-ant-skeleton-main] [data-ant-skeleton-part="header"] [data-ant-skeleton-part="avatar"] { max-width: 100%; height: auto; aspect-ratio: 1; }
  [data-ant-skeleton-main] [data-ant-skeleton-part="section"] { display: block; flex: 1; min-width: 0; }
  [data-ant-skeleton-part="title"], [data-ant-skeleton-part="paragraph"] > li { max-width: 100%; }
  [data-ant-skeleton-part="title"] { margin-block: 1em; }
  .loading-status { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  @media (prefers-reduced-motion: reduce) {
    [data-ant-skeleton-main][data-ant-skeleton-active] [data-ant-skeleton-part="title"], [data-ant-skeleton-main][data-ant-skeleton-active] [data-ant-skeleton-part="paragraph"] > li, [data-ant-skeleton-main][data-ant-skeleton-active] [data-ant-skeleton-part="avatar"] { animation: none; background: var(--ant-skeleton-gradient-from-color); }
  }
</style>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Отрицательный tabindex нужен для фокуса при замене children каркасом.) -->
<div bind:this={host} {id} role={ariaHidden ? undefined : 'group'} aria-label={label} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} aria-hidden={ariaHidden || undefined} tabindex={children ? -1 : undefined} dir={config.direction} class={['ant-skeleton-host', className]} {style}>
  {#if loading && !ariaHidden}<span class="loading-status" role="status" aria-live="polite" aria-atomic="true">{strings.loadingText}</span>{/if}
  <div bind:this={content} class="ant-skeleton-content" aria-busy={loading}>
    {#if loading}
      {#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`skeleton-main-prefix:${prefix}`} />{/if}<div
        bind:this={placeholder} data-ant-skeleton-main data-ant-skeleton-active={active || undefined}
        data-ant-skeleton-prefix={prefixCss ? prefix : undefined} class={[
          prefix, 'ant-skeleton-css-var',
          componentTheme.className,
          layout.avatar && `${prefix}-with-avatar`,
          active && `${prefix}-active`,
          round && `${prefix}-round`,
          config.direction === 'rtl' && `${prefix}-rtl`,
          semantics.classes.root, config.skeleton?.class, rootClassName
        ]} style={[componentTheme.style, semantics.styles.root].filter(Boolean).join(';') || undefined}
        aria-hidden="true">
        {#if layout.avatar}<div class={[semantics.classes.header, `${prefix}-header`]}
          data-ant-skeleton-part="header" style={semantics.styles.header}>
          <span class={[
            parts.avatar.prefix,
            `${parts.avatar.prefix}-${layout.avatar.shape}`,
            !layout.avatar.width && layout.avatar.size === 'small' && `${parts.avatar.prefix}-sm`,
            !layout.avatar.width && layout.avatar.size === 'large' && `${parts.avatar.prefix}-lg`,
            parts.avatar.class
          ]} data-ant-skeleton-part="avatar"
            style={[layout.avatar.width && `width: ${layout.avatar.width};line-height: ${layout.avatar.width}`,
              semantics.styles.avatar].filter(Boolean).join(';') || undefined}></span>
        </div>{/if}
        {#if layout.title || layout.paragraph}<div class={[`${prefix}-section`, semantics.classes.section]}
          data-ant-skeleton-part="section" style={semantics.styles.section}>
          {#if layout.title}<div class={[parts.title.prefix, parts.title.class]}
            data-ant-skeleton-part="title" style={[layout.title.width && `width: ${layout.title.width}`,
              semantics.styles.title].filter(Boolean).join(';') || undefined}></div>{/if}{#if layout.paragraph}<ul
            class={[parts.paragraph.prefix, parts.paragraph.class]} data-ant-skeleton-part="paragraph"
            style={semantics.styles.paragraph}>{#each layout.paragraph.widths as width, index (index)}<li
              style:width></li>{/each}</ul>{/if}
        </div>{/if}
      </div>
    {:else if children}{@render children()}{/if}
  </div>
</div>
