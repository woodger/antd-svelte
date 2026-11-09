<script lang="ts" generics="T = unknown">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { getUploadMotionItems } from './upload-motion.engine';
  import type { UploadFile, UploadListOptions, UploadLocale, UploadProps } from './upload.types';
  import UploadListItem from './UploadListItem.svelte';

  let {
    prefixCls,
    files,
    listType,
    options,
    locale,
    disabled,
    onRemove,
    onPreview,
    onDownload,
    previewFile,
    isImageUrl,
    iconRender,
    itemRender,
    progress,
    class: className,
    style,
    itemClass,
    itemStyle,
    appendAction
  }: Pick<UploadProps<T>,
    'listType' | 'onPreview' | 'onDownload' | 'previewFile' | 'isImageUrl' | 'iconRender'
    | 'itemRender' | 'progress'
  > & {
    prefixCls: string;
    files: readonly UploadFile<T>[];
    options: UploadListOptions<T>;
    locale: Required<UploadLocale>;
    disabled: boolean;
    onRemove: (file: UploadFile<T>) => void;
    class?: string;
    style?: string;
    itemClass?: string;
    itemStyle?: string;
    appendAction?: Snippet<[motionAppear: boolean]>;
  } = $props();
  let items = $state.raw(untrack(() => getUploadMotionItems([], files)));
  let ready = $state(false);

  onMount(() => {
    ready = true;
  });
  $effect.pre(() => {
    const previous = untrack(() => items);
    items = getUploadMotionItems(previous, files);
  });

  function finishLeave(key: string) {
    items = items.filter(item => item.key !== key || item.status !== 'remove');
  }
</script>

<div data-ant-upload-list data-ant-upload-list-type={listType}
  class={[`${prefixCls}-list ${prefixCls}-list-${listType}`, className]} {style}>
  {#each items as item (item.key)}
    <UploadListItem {prefixCls} file={item.file} {listType} {options} fileList={files}
      {locale} {disabled} {onRemove} {onPreview} {onDownload} {previewFile} {isImageUrl}
      {iconRender} {itemRender} {progress} {itemClass} {itemStyle}
      visible={item.status !== 'remove'} motionAppear={ready}
      onMotionEnd={() => finishLeave(item.key)} />
  {/each}
  {@render appendAction?.(ready)}
</div>
