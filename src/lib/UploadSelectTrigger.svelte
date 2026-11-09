<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { useToken } from './theme-context.svelte';
  import { createUploadMotion, type UploadItemMotionState } from './upload-motion.dom';

  let {
    prefixCls,
    disabled,
    visible,
    animated = false,
    motionAppear = false,
    class: className,
    style,
    children
  }: {
    prefixCls: string;
    disabled: boolean;
    visible: boolean;
    animated?: boolean;
    motionAppear?: boolean;
    class?: string;
    style?: string;
    children: Snippet;
  } = $props();
  const tokens = useToken();
  const appear = untrack(() => motionAppear);
  let root = $state<HTMLDivElement>();
  let motion = $state<ReturnType<typeof createUploadMotion>>();
  let motionState = $state<UploadItemMotionState>({});
  let motionStyle = $derived(animated
    ? motionState.className ? 'pointer-events:none' : !visible ? 'display:none' : undefined
    : undefined);
  let rootStyle = $derived(
    [motionState.style, motionStyle, style].filter(Boolean).join(';') || undefined
  );

  $effect(() => {
    if (!root || !animated) return;
    const controller = createUploadMotion(root, next => { motionState = next; }, () => {});
    motion = controller;
    return () => {
      controller.destroy();
      motion = undefined;
    };
  });
  $effect.pre(() => {
    const controller = motion;
    const next = visible;
    const name = `${prefixCls}-animate-inline`;
    const enabled = tokens.token.motion;
    untrack(() => controller?.sync({
      visible: next,
      motionName: name,
      collapse: false,
      enabled,
      appear
    }));
  });
</script>

<div data-ant-upload-control bind:this={root} class={[
    `${prefixCls} ${prefixCls}-select`,
    disabled && `${prefixCls}-disabled`,
    !visible && `${prefixCls}-hidden`,
    className,
    motionState.className
  ]} style={rootStyle}>{@render children()}</div>
