<script lang="ts">
  import { useConfig } from './config-context';
  import { typographySemantics } from './typography-semantic.engine';
  import type { TypographyProps } from './typography.types';
  import TypographyContent from './TypographyContent.svelte';
  import TypographyElement from './TypographyElement.svelte';

  let { nativeElement = $bindable(), ...rawProps }: TypographyProps = $props();
  let {
    children,
    component,
    prefixCls: customizePrefixCls,
    direction,
    classNames,
    styles,
    class: className,
    rootClassName,
    style,
    onClick,
    onclick,
    onMouseEnter,
    onmouseenter,
    onMouseLeave,
    onmouseleave,
    ...attributes
  } = $derived(rawProps);
  const config = useConfig();
  let prefixCls = $derived(config.getPrefixCls('typography', customizePrefixCls));
  let resolvedDirection = $derived(direction ?? config.direction);
  let semantics = $derived(typographySemantics(
    config.typography,
    classNames,
    styles,
    { ...rawProps, prefixCls, direction: resolvedDirection }
  ));
</script>

<TypographyElement {component} {prefixCls} direction={resolvedDirection} class={className}
  {rootClassName} {style} attributes={{ ...attributes,
    onclick: onClick ?? onclick, onmouseenter: onMouseEnter ?? onmouseenter,
    onmouseleave: onMouseLeave ?? onmouseleave }} {...semantics} bind:nativeElement>
  <TypographyContent value={children} />
</TypographyElement>
