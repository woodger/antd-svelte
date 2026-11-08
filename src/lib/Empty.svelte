<script lang="ts">
  import { onMount } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectFeedbackFocus } from './feedback.dom';
  import { getEmptyPrefixCss } from './empty-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import BuiltinImage from './EmptyImage.svelte';
  import { ruRU } from './types';
  import type { EmptyProps, EmptySemanticSlots } from './empty.types';

  let {
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: EmptyProps = $props();
  let {
    image,
    description,
    children,
    id,
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
  const componentTheme = useComponentTheme('Empty');
  let host = $state<HTMLDivElement>();
  let prefix = $derived(config.getPrefixCls('empty', prefixCls));
  let prefixCss = $derived(getEmptyPrefixCss(prefix));
  let mergedImage = $derived(image ?? config.empty?.image ?? 'default');
  let strings = $derived({ ...ruRU.empty, ...config.locale.empty });
  let content = $derived(description === undefined ? strings.description : description);
  let hasDescription = $derived(content !== undefined && content !== null
    && content !== false && content !== '');
  let hasChildren = $derived(children !== undefined && children !== null
    && children !== false && children !== '');
  let semantics = $derived.by(() => {
    const info = { props };
    const contextClasses = config.empty?.classNames;
    const contextStyles = config.empty?.styles;
    const inheritedClasses = typeof contextClasses === 'function'
      ? contextClasses(info) : contextClasses;
    const inheritedStyles = typeof contextStyles === 'function'
      ? contextStyles(info) : contextStyles;
    const localClasses = typeof classNames === 'function' ? classNames(info) : classNames;
    const localStyles = typeof styles === 'function' ? styles(info) : styles;
    const classes: EmptySemanticSlots = {};
    const slots: EmptySemanticSlots = {};

    for (const slot of ['root', 'image', 'description', 'footer'] as const) {
      classes[slot] = [inheritedClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      slots[slot] = [
        inheritedStyles?.[slot],
        slot === 'root' && config.empty?.style,
        localStyles?.[slot],
        slot === 'root' && style
      ].filter(Boolean).join(';');
    }

    return { classes, styles: slots };
  });

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
    const interactive = typeof children === 'function' || typeof description === 'function';
    if (node && interactive) return connectFeedbackFocus(node);
  });
</script>

<style>
  [data-ant-empty] { min-width: 0; max-width: 100%; }
  [data-ant-empty-part="description"] { min-width: 0; overflow-wrap: anywhere; }
  [data-ant-empty-part="image"] { min-width: 0; max-width: 100%; }
  [data-ant-empty-part="image"] :global(img), [data-ant-empty-part="image"] :global(svg) { max-width: 100%; max-height: 100%; object-fit: contain; }
  [data-ant-empty-part="footer"] { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; min-width: 0; }
  [data-ant-empty-part="footer"] > :global(*) { max-width: 100%; }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`empty-prefix:${prefix}`} />{/if}<div
  bind:this={host} {id} data-ant-empty data-ant-empty-prefix={prefixCss ? prefix : undefined}
  role={ariaLabel || ariaLabelledby ? 'group' : undefined}
  aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby}
  dir={config.direction} class={[
    componentTheme.className, 'ant-empty-css-var', prefix, config.empty?.class,
    mergedImage === 'simple' && `${prefix}-normal`,
    config.direction === 'rtl' && `${prefix}-rtl`,
    className, rootClassName, semantics.classes.root
  ]} style={[componentTheme.style, semantics.styles.root].filter(Boolean).join(';') || undefined}>
  {#if mergedImage !== false}<div class={[`${prefix}-image`, semantics.classes.image]}
    data-ant-empty-part="image" style={semantics.styles.image || undefined} aria-hidden="true" inert>
    {#if mergedImage === 'default' || mergedImage === 'simple'}<BuiltinImage
      simple={mergedImage === 'simple'} />
    {:else if typeof mergedImage === 'string'}<img src={mergedImage} draggable={false}
      alt={typeof content === 'string' ? content : 'empty'} />
    {:else if typeof mergedImage === 'function'}{@render mergedImage()}
    {:else if typeof mergedImage !== 'boolean'}{mergedImage ?? ''}{/if}
  </div>{/if}
  {#if hasDescription}<div class={[`${prefix}-description`, semantics.classes.description]}
    data-ant-empty-part="description" style={semantics.styles.description || undefined}>
    {#if typeof content === 'function'}{@render content()}
    {:else if typeof content !== 'boolean'}{content}{/if}
  </div>{/if}
  {#if hasChildren}<div class={[`${prefix}-footer`, semantics.classes.footer]}
    data-ant-empty-part="footer" style={semantics.styles.footer || undefined}>
    {#if typeof children === 'function'}{@render children()}
    {:else if typeof children !== 'boolean'}{children}{/if}
  </div>{/if}
</div>
