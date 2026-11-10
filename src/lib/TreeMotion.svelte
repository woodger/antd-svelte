<script lang="ts">
  import { flushSync, untrack, type Snippet } from 'svelte';
  import { createTreeGroupMotion, type TreeGroupMotionState } from './tree-motion.dom';
  import type { TreeMotionConfig } from './tree-motion.types';

  let { prefixCls, show, motion, enabled, children, onEnd }: {
    prefixCls: string;
    show: boolean;
    motion: TreeMotionConfig;
    enabled: boolean;
    children: Snippet;
    onEnd: () => void;
  } = $props();
  let root = $state<HTMLDivElement>();
  let runtime = $state<ReturnType<typeof createTreeGroupMotion>>();
  let motionState = $state<TreeGroupMotionState>({ running: false });
  let visible = $derived(Object.hasOwn(motion, 'visible') ? motion.visible ?? true : show);
  let config = $derived({ ...motion, motionAppear: show });
  let present = $derived(visible || motionState.running || motion.forceRender || motion.removeOnLeave === false);
  let hiddenClass = $derived(!visible && !motionState.running && motion.removeOnLeave === false
    ? motion.leavedClassName : undefined);
  let hidden = $derived(!visible && !motionState.running && !hiddenClass);

  $effect(() => {
    const node = root;
    if (!node) return;
    const controller = createTreeGroupMotion(node, (next, commit) => {
      if (commit) flushSync(() => { motionState = next; });
      else motionState = next;
    }, next => { if (next === show) onEnd(); }, show ? undefined : true);
    runtime = controller;
    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });
  $effect.pre(() => {
    const controller = runtime;
    const next = visible;
    const options = config;
    const motionEnabled = enabled;
    untrack(() => controller?.sync(next, options, motionEnabled));
  });
</script>

<div bind:this={root} class={[
  `${prefixCls}-treenode-motion`, motionState.className,
  !motionState.running && (hiddenClass || motion.eventProps?.className)
]} style={motionState.running ? motionState.style : hidden ? 'display:none' : motion.eventProps?.style}>
  {#if present}{@render children()}{/if}
</div>
