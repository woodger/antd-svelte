<script lang="ts" generics="T = unknown">
  import { onDestroy, untrack } from 'svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getUploadPrefixCss } from './upload-prefix.engine';
  import type { UploadProps, UploadFile } from './upload.types';
  import { createUploadController } from './upload-controller.engine';
  import { filterUploadFile } from './upload.engine';
  import { uploadRequest } from './upload-request.dom';
  import { collectUploadDirectoryFiles } from './upload-directory.dom';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useForm } from './form-context';
  import UploadListItem from './UploadListItem.svelte';
  let {
    prefixCls: customizePrefixCls,
    fileList,
    defaultFileList = [],
    name = 'file',
    action = '',
    method = 'post',
    data = {},
    headers,
    withCredentials,
    accept = '',
    multiple = false,
    directory = false,
    pastable = false,
    capture,
    disabled,
    beforeUpload,
    customRequest,
    onChange,
    onRemove,
    onDrop,
    onPreview,
    onDownload,
    maxCount,
    openFileDialogOnClick = true,
    hasControlInside = true,
    showUploadList = true,
    listType = 'text',
    locale,
    type = 'select',
    previewFile,
    isImageUrl,
    iconRender,
    itemRender,
    progress = { size: [-1, 2], showInfo: false },
    children,
    id,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...attributes
  }: UploadProps<T> = $props();
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('upload', customizePrefixCls));
  let prefixCss = $derived(getUploadPrefixCss(componentPrefix));
  // В браузере сохраняются строковые attributes Source; SSR канонизирует boolean attribute.
  let directoryAttributes = $derived<Record<string, string>>(directory
    ? { directory: 'directory', webkitdirectory: 'webkitdirectory' } : {});
  const componentTheme = useComponentTheme('Upload');
  const form = useForm();
  const generatedId = $props.id();
  let counter = 0;
  let internalList = $state.raw<UploadFile<T>[]>(untrack(() => [...defaultFileList]));
  let files = $derived(fileList ?? internalList);
  let blocked = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let dragState = $state(false);
  let strings = $derived(
    {
      uploading: 'Uploading...',
      removeFile: 'Remove file',
      downloadFile: 'Download file',
      previewFile: 'Preview file',
      uploadError: 'Upload error',
      ...config.locale.upload,
      ...locale
    }
  );
  let listOptions = $derived(typeof showUploadList === 'object' ? showUploadList : {});
  let card = $derived(listType === 'picture-card' || listType === 'picture-circle');
  // Bridge нужен и на trigger: локальный prefix должен перекрывать значение wrapper.
  let triggerStyle = $derived([componentTheme.style, style].filter(Boolean).join(';') || undefined);
  const controller = createUploadController({
    props: () => ({
      name,
      action,
      method,
      data,
      headers,
      withCredentials,
      beforeUpload,
      customRequest,
      onChange,
      onRemove,
      maxCount
    }),
    files: () => files,
    setFiles: next => {
      if (fileList === undefined)
        internalList = next;
    },
    defaultRequest: uploadRequest,
    uid: () => `rc-upload-${generatedId}-${++counter}`
  });
  onDestroy(controller.dispose);
  $effect(() => {
    if (!pastable || blocked || !nativeElement) return;

    const owner = nativeElement.ownerDocument;
    owner.addEventListener('paste', handlePaste);
    return () => owner.removeEventListener('paste', handlePaste);
  });
  export function abort(file?: UploadFile<T> | string) {
    controller.abort(file);
  }
  function openDialog(event: MouseEvent | KeyboardEvent) {
    if (blocked || !openFileDialogOnClick || !children || event.defaultPrevented) return;
    if (event instanceof KeyboardEvent) {
      if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
    }
    inputElement?.click();
  }
  function changed(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    const selected = [...event.currentTarget.files ?? []].filter(
      file => filterUploadFile(file, accept, directory)
    );
    event.currentTarget.value = '';
    void controller.upload(selected);
  }
  function transferFiles(transfer: DataTransfer | null) {
    const all = [...transfer?.files ?? []];
    // rc-upload single paste/drop берёт первый исходный файл до accept filtering.
    return multiple ? all.filter(file => filterUploadFile(file, accept, true)) : all.slice(0, 1);
  }
  async function uploadTransfer(transfer: DataTransfer | null) {
    const selected = directory
      ? await collectUploadDirectoryFiles(
        transfer?.items ?? [],
        file => filterUploadFile(file, accept, directory)
      )
      : transferFiles(transfer);
    if (blocked || !nativeElement) return;

    await controller.upload(selected);
  }
  function handlePaste(event: ClipboardEvent) {
    if (!pastable || blocked) return;

    const transfer = event.clipboardData;
    const hasFiles = Boolean(transfer?.files.length)
      || [...transfer?.items ?? []].some(item => item.kind === 'file');
    if (!hasFiles) return;

    event.preventDefault();
    void uploadTransfer(transfer);
  }
  function drag(event: DragEvent) {
    event.preventDefault();
    dragState = !blocked && event.type === 'dragover';
    if (event.type !== 'drop') return;
    onDrop?.(event);
    if (blocked) return;
    void uploadTransfer(event.dataTransfer);
  }
</script>
<style>
  [data-ant-upload-control]:focus-visible { outline:2px solid var(--ant-color-primary);outline-offset:2px; }
</style>
{#snippet trigger()}
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex — tabindex появляется только вместе с role=button. -->
  <span data-ant-upload-control class={[
      componentPrefix,
      type === 'drag' && `${componentPrefix}-btn`,
      blocked && `${componentPrefix}-disabled`
    ]} role={hasControlInside ? undefined : 'button'} tabindex={!blocked && !hasControlInside ? 0 : undefined} aria-disabled={blocked || undefined}
    onclick={openDialog} onkeydown={openDialog} ondrop={event => {
        if (type === 'select')
          drag(event);
      }} ondragover={event => event.preventDefault()}>
    <input {...attributes} {...directoryAttributes} bind:this={inputElement} id={children && !blocked ? id : undefined} type="file" {name} accept={typeof accept === 'string' ? accept : accept.format} {multiple} {capture} disabled={blocked} style="display:none" onchange={changed} onclick={event => event.stopPropagation()} />
    {#if children}{#if type === 'drag'}<div class={`${componentPrefix}-drag-container`}>{@render children()}</div>{:else}{@render children()}{/if}{/if}
  </span>
{/snippet}
{#snippet list()}
  {#if showUploadList}<div data-ant-upload-list data-ant-upload-list-type={listType} class={`${componentPrefix}-list ${componentPrefix}-list-${listType}`}>
    {#each files as file (file.uid)}<UploadListItem prefixCls={componentPrefix} {file} {listType} options={listOptions} fileList={files} locale={strings} disabled={blocked} onRemove={file => {
        void controller.remove(file);
      }} {onPreview} {onDownload} {previewFile} {isImageUrl} {iconRender} {itemRender} {progress} />{/each}
    {#if card && children}{@render selectTrigger()}{/if}
  </div>{/if}
{/snippet}
{#snippet selectTrigger()}
  <div data-ant-upload-control class={[
      `${componentPrefix} ${componentPrefix}-select`,
      blocked && `${componentPrefix}-disabled`,
      !children && `${componentPrefix}-hidden`
    ]} style={triggerStyle}>{@render trigger()}</div>
{/snippet}
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`upload-prefix:${componentPrefix}`} />{/if}<span data-ant-upload-root data-ant-upload-prefix={componentPrefix} bind:this={nativeElement} dir={config.direction} style={componentTheme.style} class={[
    `${componentPrefix}-wrapper ant-upload-css-var`,
    componentTheme.className,
    config.direction === 'rtl' && `${componentPrefix}-rtl`,
    card && `${componentPrefix}-${listType}-wrapper`,
    className,
    rootClassName
  ]}>
  {#if type === 'drag'}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div data-ant-upload-control data-ant-upload-prefix={componentPrefix} class={[
        `${componentPrefix} ${componentPrefix}-drag`,
        files.some(file => file.status === 'uploading') && `${componentPrefix}-drag-uploading`,
        dragState && `${componentPrefix}-drag-hover`,
        blocked && `${componentPrefix}-disabled`,
        config.direction === 'rtl' && `${componentPrefix}-rtl`
      ]} style={triggerStyle} ondrop={drag} ondragover={drag} ondragleave={drag}>{@render trigger()}</div>
    {@render list()}
  {:else}
    {#if !card || !showUploadList}{@render selectTrigger()}{/if}{@render list()}
  {/if}
</span>
