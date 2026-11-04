<script lang="ts" generics="Props extends object = {}">
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getFlexPrefixCss } from './flex-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { FlexComponentProps, FlexRootProps } from './flex.types';

  let {
    children,
    orientation,
    vertical,
    wrap,
    justify,
    align,
    flex,
    gap,
    prefixCls,
    component = 'div',
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: FlexComponentProps<Props> = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Flex');
  let prefix = $derived(prefixCls || 'ant-flex');
  let prefixCss = $derived(getFlexPrefixCss(prefix));
  let isVertical = $derived(orientation ? orientation === 'vertical'
    : vertical ?? config.flex?.vertical ?? false);
  let wrapping = $derived(wrap === true ? 'wrap' : wrap);
  let alignment = $derived(align || (isVertical ? 'stretch' : undefined));
  let presetGap = $derived(
    typeof gap === 'string' && ['small', 'medium', 'middle', 'large'].includes(gap)
  );
  let rootStyle = $derived([
    componentTheme.style,
    config.flex?.style,
    style,
    flex != null && `flex:${flex}`,
    gap != null && !presetGap && `gap:${typeof gap === 'number' ? `${gap}px` : gap}`
  ].filter(value => value !== undefined && value !== null && value !== false).join(';'));
  let rootProps = $derived({
    ...rest,
    dir: config.direction,
    class: [
      prefix,
      'ant-flex-css-var',
      componentTheme.className,
      className,
      rootClassName,
      config.flex?.class,
      isVertical && `${prefix}-vertical`,
      config.direction === 'rtl' && `${prefix}-rtl`,
      wrapping && `${prefix}-wrap-${wrapping}`,
      alignment && `${prefix}-align-${alignment}`,
      justify && `${prefix}-justify-${justify}`,
      presetGap && `${prefix}-gap-${gap}`
    ],
    style: rootStyle,
    'data-ant-flex-prefix': prefixCss ? prefix : undefined
  });
  let Root = $derived(typeof component === 'string' ? undefined : component);
  // Необязательный ref forwarding: accessor не попадает в DOM spread корня без $bindable.
  // После удаления layout-полей TS теряет связь rest с generic Props.
  let componentProps = $derived(Object.defineProperty({ ...rootProps, children }, 'nativeElement', {
    get: () => nativeElement,
    set: (next: HTMLElement | undefined) => { nativeElement = next; },
    configurable: true
  }) as unknown as Props & FlexRootProps);
</script>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`flex-prefix:${prefix}`} />{/if}{#if typeof component === 'string'}<svelte:element this={component}
  {...rootProps}
  bind:this={nativeElement}
>{#if children}{@render children()}{/if}</svelte:element>{:else if Root}<Root {...componentProps} />{/if}
