<script lang="ts" generics="T = unknown">
  import { untrack } from 'svelte';
  import type { UploadFile, UploadListProgressProps } from './upload.types';
  import { createUploadMotion, type UploadItemMotionState } from './upload-motion.dom';
  import { useConfig } from './config-context';
  import { useToken } from './theme-context.svelte';
  import Progress from './Progress.svelte';

  let {
    file,
    prefixCls,
    visible,
    progress,
    uploading
  }: {
    file: UploadFile<T>;
    prefixCls: string;
    visible: boolean;
    progress: UploadListProgressProps;
    uploading: string;
  } = $props();
  const config = useConfig();
  const tokens = useToken();
  const initiallyHidden = untrack(() => !visible);
  let present = $state(untrack(() => visible));
  let root = $state<HTMLDivElement>();
  let motion = $state<ReturnType<typeof createUploadMotion>>();
  let motionState = $state<UploadItemMotionState>({});
  let hadRoot = false;

  $effect.pre(() => {
    if (visible) present = true;
  });
  $effect(() => {
    if (!root) return;
    // После скрытого состояния новый DOM получает enter; только первое видимое появление — appear.
    const previous = hadRoot || initiallyHidden ? false : undefined;
    hadRoot = true;
    const controller = createUploadMotion(root, next => { motionState = next; }, () => {
      present = false;
    }, previous);
    motion = controller;
    return () => {
      controller.destroy();
      motion = undefined;
    };
  });
  $effect.pre(() => {
    const controller = motion;
    const next = visible;
    const name = `${config.getPrefixCls()}-fade`;
    const enabled = tokens.token.motion;
    untrack(() => controller?.sync({
      visible: next,
      motionName: name,
      collapse: false,
      enabled,
      appear: true
    }));
  });
</script>

{#if present}<div bind:this={root} class={[`${prefixCls}-list-item-progress`, motionState.className]}
  style={motionState.style}>{#if 'percent' in file}<Progress type="line" percent={file.percent}
    aria-label={file['aria-label'] ?? (file['aria-labelledby'] ? undefined : `${uploading} ${file.name}`)}
    aria-labelledby={file['aria-labelledby']} {...progress} />{/if}</div>{/if}
