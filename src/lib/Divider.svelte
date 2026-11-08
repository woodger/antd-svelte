<script lang="ts">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getDividerPrefixCss } from './divider-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { DividerProps, DividerOrientation, DividerSemanticInfo } from './divider.types';

  let {
    children,
    prefixCls,
    orientation,
    vertical,
    titlePlacement,
    dashed = false,
    variant = 'solid',
    size,
    plain = false,
    class: className = '',
    rootClassName = '',
    style,
    classNames,
    styles,
    nativeElement = $bindable(),
    ...rest
  }: DividerProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Divider');
  let prefix = $derived(config.getPrefixCls('divider', prefixCls));
  let prefixCss = $derived(getDividerPrefixCss(prefix));
  let direction = $derived<DividerOrientation>(
    orientation === 'horizontal' || orientation === 'vertical'
      ? orientation : typeof vertical === 'boolean'
        ? vertical ? 'vertical' : 'horizontal'
        : 'horizontal'
  );
  let placement = $derived(titlePlacement ?? 'center');
  let logicalPlacement = $derived<'start' | 'end' | 'center'>(
    placement === 'left' ? config.direction === 'rtl' ? 'end' : 'start'
      : placement === 'right'
        ? config.direction === 'rtl' ? 'start' : 'end'
        : placement as 'start' | 'end' | 'center'
  );
  let mergedSize = $derived(size ?? config.explicitComponentSize);
  let hasChildren = $derived(
    children !== undefined && children !== null && children !== false && children !== ''
  );
  let semanticInfo = $derived<DividerSemanticInfo>({
    props: {
      ...rest,
      children,
      prefixCls,
      orientation: direction,
      vertical,
      titlePlacement: logicalPlacement,
      dashed,
      variant,
      size: mergedSize,
      plain,
      class: className,
      rootClassName,
      style,
      classNames,
      styles
    }
  });
  let classes = $derived.by(() => {
    const context = config.divider?.classNames;
    const inherited = typeof context === 'function' ? context(semanticInfo) : context;
    const local = typeof classNames === 'function' ? classNames(semanticInfo) : classNames;

    return {
      root: [inherited?.root, local?.root].filter(Boolean).join(' '),
      rail: [inherited?.rail, local?.rail].filter(Boolean).join(' '),
      content: [inherited?.content, local?.content].filter(Boolean).join(' ')
    };
  });
  let semanticStyles = $derived.by(() => {
    const context = config.divider?.styles;
    const inherited = typeof context === 'function' ? context(semanticInfo) : context;
    const local = typeof styles === 'function' ? styles(semanticInfo) : styles;

    return {
      root: [inherited?.root, config.divider?.style, local?.root].filter(Boolean).join(';'),
      rail: [inherited?.rail, local?.rail].filter(Boolean).join(';'),
      content: [inherited?.content, local?.content].filter(Boolean).join(';')
    };
  });
</script>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`divider-prefix:${prefix}`} />{/if}<div
  {...rest}
  bind:this={nativeElement}
  role="separator"
  aria-orientation={direction}
  data-ant-divider-prefix={prefixCss ? prefix : undefined}
  dir={config.direction}
  class={[
      prefix,
      'ant-divider-css-var',
      config.divider?.class,
      componentTheme.className,
      `${prefix}-${direction}`,
      hasChildren && [`${prefix}-with-text`, `${prefix}-with-text-${logicalPlacement}`],
      dashed && `${prefix}-dashed`,
      variant !== 'solid' && `${prefix}-${variant}`,
      plain && `${prefix}-plain`,
      config.direction === 'rtl' && `${prefix}-rtl`,
      mergedSize === 'medium' && `${prefix}-md`,
      mergedSize === 'small' && `${prefix}-sm`,
      !hasChildren && [`${prefix}-rail`, classes.rail],
      className,
      rootClassName,
      classes.root
    ]}
  style={[componentTheme.style, semanticStyles.root, !hasChildren
      && semanticStyles.rail, style].filter(
        Boolean
      ).join(
        ';'
      )}
>
  {#if hasChildren && direction !== 'vertical'}
    <div class={[`${prefix}-rail ${prefix}-rail-start`, classes.rail]} style={semanticStyles.rail}></div>
    <span class={[`${prefix}-inner-text`, classes.content]} style={semanticStyles.content}>{#if typeof children === 'function'}{@render children()}{:else}{children}{/if}</span>
    <div class={[`${prefix}-rail ${prefix}-rail-end`, classes.rail]} style={semanticStyles.rail}></div>
  {/if}
</div>
