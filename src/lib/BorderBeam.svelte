<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { createBorderBeamRuntime } from './border-beam.dom';
  import type { BorderBeamProps } from './border-beam.types';

  let {
    target,
    children,
    color,
    count = 1,
    duration,
    lineWidth,
    outset,
    size,
    class: className,
    style
  }: BorderBeamProps = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('BorderBeam');
  const tokens = useDesignTokenContext();
  let runtime = $state.raw<ReturnType<typeof createBorderBeamRuntime>>();
  let options = $derived({
    color: Array.isArray(color) ? color.map(item => ({ ...item })) : color,
    count,
    duration,
    lineWidth,
    outset,
    size,
    className: [
      'ant-border-beam',
      componentTheme.className,
      config.borderBeam?.class,
      className,
      'ant-border-beam-css-var'
    ].filter(Boolean).join(' '),
    // Portal target может находиться вне DOM scope владельца.
    themeStyle: tokens.enabled
      ? [tokens.element ? undefined : tokens.state.style, componentTheme.style].filter(Boolean)
        .join(';')
      : undefined,
    themeOrigin: tokens.enabled ? tokens.element : undefined,
    contextStyle: config.borderBeam?.style,
    style
  });

  $effect(() => {
    if (!(target instanceof HTMLElement)) return;

    const controller = createBorderBeamRuntime(target);
    runtime = controller;

    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });

  $effect(() => {
    const controller = runtime;
    const next = options;

    untrack(() => controller?.configure(next));
  });
</script>

{#if typeof children === 'function'}{@render children()}{:else if typeof children !== 'boolean'}{children ?? ''}{/if}
