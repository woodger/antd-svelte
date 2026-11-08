<script lang="ts">
  import { useConfig } from './config-context';
  import { useLayout } from './layout-context';
  import { useComponentTheme } from './theme-component.svelte';
  import type { LayoutSectionProps } from './layout.types';
  let {
    tag,
    part,
    children,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: LayoutSectionProps & {
    tag: 'header' | 'footer' | 'main';
    part: 'header' | 'footer' | 'content';
  } = $props();
  const config = useConfig();
  // Секции наследуют переменные Layout, включая его style; standalone задаёт свой scope.
  const layout = useLayout();
  const componentTheme = useComponentTheme('Layout');
</script>

<svelte:element this={tag} {...rest} bind:this={nativeElement} dir={config.direction}
  data-ant-layout-part={part}
  class={['ant-layout-css-var', `ant-layout-${part}`, componentTheme.className, className, rootClassName]}
  style={[!layout && componentTheme.style, style].filter(Boolean).join(';')}>
  {@render children?.()}
</svelte:element>
