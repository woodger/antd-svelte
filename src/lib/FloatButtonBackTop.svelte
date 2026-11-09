<script lang="ts">
  import { untrack } from 'svelte';
  import FloatButton from './FloatButton.svelte';
  import FloatButtonIcon from './FloatButtonIcon.svelte';
  import { useConfig } from './config-context';
  import { useFloatButton } from './float-button-context';
  import { createBackTopRuntime } from './float-button-back-top.dom';
  import { createFloatButtonMotion } from './float-button-motion.dom';
  import type { FloatButtonBackTopProps } from './float-button.types';
  let {
    target,
    visibilityHeight = 400,
    duration = 450,
    showProgress = false,
    icon,
    onclick,
    onClick,
    class: className = '',
    style,
    prefixCls: customizePrefixCls,
    nativeElement = $bindable(),
    ...rest
  }: FloatButtonBackTopProps = $props();
  const config = useConfig();
  const group = useFloatButton();
  let prefixCls = $derived(customizePrefixCls === undefined && group?.prefixCls
    ? group.prefixCls : config.getPrefixCls('float-btn', customizePrefixCls));
  let variablePrefix = $derived(config.getPrefixCls().replace(/\./g, ''));
  let visible = $state(untrack(() => visibilityHeight === 0));
  let present = $state(untrack(() => visibilityHeight === 0));
  let progress = $state(0);
  let runtime = $state.raw<ReturnType<typeof createBackTopRuntime>>();
  let motion = $state.raw<ReturnType<typeof createFloatButtonMotion>>();
  let motionState: boolean | undefined;
  const defaultTarget = () => nativeElement?.ownerDocument ?? window;
  let getTarget = $derived(target ?? defaultTarget);
  $effect(() => {
    const controller = createBackTopRuntime(window, state => {
      visible = state.visible;
      progress = state.progress;
    });
    runtime = controller;
    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });
  $effect(() => {
    getTarget();
    runtime?.configure({ getTarget, visibilityHeight, showProgress });
  });
  $effect(() => {
    if (visible)
      present = true;
  });
  $effect(() => {
    if (!nativeElement) return;
    const controller = createFloatButtonMotion(nativeElement, false, () => {
      present = false;
    }, motionState);
    motion = controller;
    return () => {
      controller.destroy();
      motion = undefined;
    };
  });
  $effect(() => {
    if (motion) {
      motion.sync(visible);
      motionState = visible;
    }
  });
</script>
{#snippet defaultIcon()}<FloatButtonIcon name="vertical-align-top" />{/snippet}
{#if present}
  <FloatButton {...rest} {prefixCls} icon={icon ?? config.floatButton?.backTopIcon ?? defaultIcon} bind:nativeElement
    class={[className, showProgress
        && `${prefixCls}-progress`].filter(Boolean).join(
          ' '
        )} style={[showProgress
            && `--${variablePrefix}-float-btn-progress:${progress}turn`, style].filter(
              Boolean
            ).join(
              ';'
            )}
    onclick={event => {
        runtime?.scrollToTop(duration);
        (onclick ?? onClick)?.(event);
      }} />
{/if}
