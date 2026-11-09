<script lang="ts" generics="T = unknown">
  import { onMount } from 'svelte';
  import type {
    UploadFile,
    UploadLocale,
    UploadProps,
    UploadListOptions,
    UploadItemRenderActions
  } from './upload.types';
  import { getUploadErrorMessage, resolveUploadLinkProps, uploadIsImage } from './upload.engine';
  import { previewImage } from './upload-preview.dom';
  import Button from './Button.svelte';
  import UploadIcon from './UploadIcon.svelte';
  import Progress from './Progress.svelte';
  import Tooltip from './Tooltip.svelte';
  let {
    prefixCls,
    file,
    listType = 'text',
    options,
    locale,
    disabled,
    onRemove,
    onPreview,
    onDownload,
    previewFile = previewImage,
    isImageUrl = uploadIsImage,
    iconRender,
    itemRender,
    progress = { size: [-1, 2], showInfo: false },
    itemClass,
    itemStyle,
    fileList
  }: {
    prefixCls: string;
    file: UploadFile<T>;
    listType: UploadProps<T>['listType'];
    options: UploadListOptions<T>;
    locale: Required<UploadLocale>;
    disabled: boolean;
    onRemove: (file: UploadFile<T>) => void;
    onPreview?: UploadProps<T>['onPreview'];
    onDownload?: UploadProps<T>['onDownload'];
    previewFile?: UploadProps<T>['previewFile'];
    isImageUrl?: UploadProps<T>['isImageUrl'];
    iconRender?: UploadProps<T>['iconRender'];
    itemRender?: UploadProps<T>['itemRender'];
    progress?: UploadProps<T>['progress'];
    itemClass?: string;
    itemStyle?: string;
    fileList: readonly UploadFile<T>[];
  } = $props();
  let thumbnail = $state('');
  let showProgress = $state(false);
  let picture = $derived(listType !== 'text');
  let card = $derived(listType === 'picture-card' || listType === 'picture-circle');
  let source = $derived(file.thumbUrl || thumbnail || file.url);
  let image = $derived(isImageUrl({ ...file, thumbUrl: file.thumbUrl ?? thumbnail }));
  let linkAttributes = $derived(resolveUploadLinkProps(file.linkProps));
  let message = $derived(getUploadErrorMessage(file.response, file.error, locale.uploadError));
  function show(
    flag: boolean | ((file: UploadFile<T>) => boolean) | undefined,
    fallback: boolean
  ) {
    return typeof flag === 'function' ? flag(file) : flag ?? fallback;
  }
  function preview(event?: MouseEvent, currentFile = file) {
    if (onPreview) {
      event?.preventDefault();
      onPreview(currentFile);
    }
  }
  function download(currentFile: UploadFile<T>) {
    if (onDownload) {
      onDownload(currentFile);
    } else if (currentFile.url) {
      window.open(currentFile.url, '_blank', 'noopener');
    }
  }
  function handleNameClick(event: MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement; }) {
    linkAttributes.onclick?.(event);

    if (!event.defaultPrevented) preview(event);
  }
  let renderActions = $derived.by<UploadItemRenderActions>(() => {
    const currentFile = file;

    return {
      download: () => download(currentFile),
      preview: event => preview(event, currentFile),
      remove: () => onRemove(currentFile)
    };
  });
  onMount(() => {
    const timer = setTimeout(() => {
      showProgress = true;
    }, 300);
    return () => clearTimeout(timer);
  });
  $effect(() => {
    thumbnail = '';
    const original = file.originFileObj;
    if (!picture || file.thumbUrl !== undefined || !original) return;
    let active = true;
    void Promise.resolve(previewFile(original)).then(value => {
      if (active)
        thumbnail = value || '';
    });
    return () => {
      active = false;
    };
  });
</script>
<style>
  [data-ant-upload-item-container] :global(.ant-tooltip-trigger) { display:block; }
  :global([data-ant-upload-list-type="picture-card"]) [data-ant-upload-item-container] :global(.ant-tooltip-trigger),
  :global([data-ant-upload-list-type="picture-circle"]) [data-ant-upload-item-container] :global(.ant-tooltip-trigger) { height:100%; }
  button[data-ant-upload-item-name] { padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:inherit;cursor:pointer; }
  [data-ant-upload-item-name]:focus-visible { outline:2px solid var(--ant-color-primary); }
</style>
{#snippet fileIcon()}{#if iconRender}{@render iconRender(file, listType)}{:else}{#if file.status === 'uploading'}{#if card}{locale.uploading}{:else}<UploadIcon name="loading" />{/if}{:else}<UploadIcon name={picture ? image ? 'picture' : 'file' : 'paper-clip'} />{/if}{/if}{/snippet}
{#snippet downloadIcon()}{#if options.downloadIcon}{@render options.downloadIcon(file)}{:else}<UploadIcon name="download" />{/if}{/snippet}
{#snippet removeIcon()}{#if options.removeIcon}{@render options.removeIcon(file)}{:else}<UploadIcon name="delete" />{/if}{/snippet}
{#snippet previewIcon()}{#if options.previewIcon}{@render options.previewIcon(file)}{:else}<UploadIcon name="eye" />{/if}{/snippet}
{#snippet actions()}
  {#if card && show(options.showPreviewIcon, true) && source}<a href={file.url || source} target="_blank" rel="noopener noreferrer" aria-label={locale.previewFile} title={locale.previewFile} onclick={preview}>{@render previewIcon()}</a>{/if}
  {#if show(options.showDownloadIcon, false) && file.status === 'done'}<Button type="text" size="small" class={`${prefixCls}-list-item-action`} disabled={false} aria-label={locale.downloadFile} title={locale.downloadFile} onclick={() => download(file)} icon={downloadIcon} />{/if}
  {#if show(options.showRemoveIcon, !disabled)}<Button type="text" size="small" class={`${prefixCls}-list-item-action`} {disabled} aria-label={locale.removeFile} title={locale.removeFile} onclick={() => onRemove(file)} icon={removeIcon} />{/if}
{/snippet}
{#snippet item()}
<div class={[
    `${prefixCls}-list-item`,
    `${prefixCls}-list-item-${file.status ?? 'undefined'}`,
    itemClass
  ]} style={itemStyle}>
  {#if picture}
    {#if file.status === 'uploading' || !source}<div class={[
        `${prefixCls}-list-item-thumbnail`,
        file.status !== 'uploading' && `${prefixCls}-list-item-file`
      ]}>{@render fileIcon()}</div>
    {:else}<a class={[
        `${prefixCls}-list-item-thumbnail`,
        !image && `${prefixCls}-list-item-file`
      ]} href={file.url || source} target="_blank" rel="noopener noreferrer" onclick={preview}>{#if image}<img class={`${prefixCls}-list-item-image`} src={source} alt={file.name} crossorigin={file.crossOrigin} />{:else}{@render fileIcon()}{/if}</a>{/if}
  {:else}<div class={`${prefixCls}-icon`}>{@render fileIcon()}</div>{/if}
  {#if file.url}<a data-ant-upload-item-name class={`${prefixCls}-list-item-name`} title={file.name} target="_blank" rel="noopener noreferrer" {...linkAttributes} href={file.url} onclick={handleNameClick}>{file.name}{#if options.extra}<span class={`${prefixCls}-list-item-extra`}>{@render options.extra(file)}</span>{/if}</a>
  {:else if onPreview}<button type="button" data-ant-upload-item-name class={`${prefixCls}-list-item-name`} title={file.name} onclick={() => onPreview?.(file)}>{file.name}{#if options.extra}<span class={`${prefixCls}-list-item-extra`}>{@render options.extra(file)}</span>{/if}</button>
  {:else}<span data-ant-upload-item-name class={`${prefixCls}-list-item-name`} title={file.name}>{file.name}{#if options.extra}<span class={`${prefixCls}-list-item-extra`}>{@render options.extra(file)}</span>{/if}</span>{/if}
  {#if !card || file.status !== 'uploading'}<span class={[`${prefixCls}-list-item-actions`, listType === 'picture' && 'picture']}>{@render actions()}</span>{/if}
  {#if showProgress && file.status === 'uploading' && file.percent !== undefined}<div class={`${prefixCls}-list-item-progress`}><Progress type="line" percent={file.percent} aria-label={file['aria-label'] ?? (file['aria-labelledby'] ? undefined : `${locale.uploading} ${file.name}`)} aria-labelledby={file['aria-labelledby']} {...progress} /></div>{/if}
</div>
{/snippet}
{#snippet originNode()}{#if file.status === 'error'}<Tooltip title={message}>{@render item()}</Tooltip>{:else}{@render item()}{/if}{/snippet}<div data-ant-upload-item-container class={`${prefixCls}-list-item-container`}>{#if itemRender}{@render itemRender(originNode, file, fileList, renderActions)}{:else}{@render originNode()}{/if}</div>
