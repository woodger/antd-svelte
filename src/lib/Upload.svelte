<script lang="ts" generics="T = unknown">
  import { onDestroy, untrack } from 'svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getUploadPrefixCss } from './upload-prefix.engine';
  import type { UploadProps, UploadFile, UploadSemanticInfo } from './upload.types';
  import { createUploadController } from './upload-controller.engine';
  import { filterUploadFile } from './upload.engine';
  import { uploadRequest } from './upload-request.dom';
  import { collectUploadDirectoryFiles } from './upload-directory.dom';
  import { getInlineStyleDeclarations } from './inline-style.engine';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useForm } from './form-context';
  import UploadList from './UploadList.svelte';
  let {
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...suppliedProps
  }: UploadProps<T> = $props();
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
    accept: customAccept,
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
    progress,
    classNames,
    styles,
    children,
    id,
    class: className = '',
    rootClassName = '',
    style,
    ...attributes
  } = $derived(suppliedProps);
  const config = useConfig();
  let accept = $derived(customAccept ?? config.upload?.accept ?? '');
  // Shared config не фиксирует response type отдельного Upload<T>.
  let request = $derived(
    customRequest || config.upload?.customRequest as UploadProps<T>['customRequest']
  );
  let mergedProgress = $derived(config.upload?.progress || progress
    ? { ...config.upload?.progress, ...progress } : undefined);
  let componentPrefix = $derived(config.getPrefixCls('upload', customizePrefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let prefixCss = $derived(getUploadPrefixCss(componentPrefix, rootPrefix));
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
  let semanticInfo = $derived({ props: {
    ...suppliedProps,
    listType,
    type,
    multiple,
    hasControlInside,
    disabled: blocked,
    showUploadList
  } });
  let semanticClasses = $derived(
    (typeof classNames === 'function' ? classNames(semanticInfo) : classNames) ?? {}
  );
  let semanticStyles = $derived(
    (typeof styles === 'function' ? styles(semanticInfo) : styles) ?? {}
  );
  let sharedClasses = $derived(
    (typeof config.upload?.classNames === 'function'
      ? config.upload.classNames(semanticInfo as UploadSemanticInfo)
      : config.upload?.classNames) ?? {}
  );
  let sharedStyles = $derived(
    (typeof config.upload?.styles === 'function'
      ? config.upload.styles(semanticInfo as UploadSemanticInfo)
      : config.upload?.styles) ?? {}
  );
  let rootStyle = $derived(
    [componentTheme.style, sharedStyles.root, semanticStyles.root].filter(Boolean).join(';')
      || undefined
  );
  // Trigger сбрасывает vendor defaults, сохраняя variables semantic root и их scope.
  let inheritedRootVariables = $derived(
    [...getInlineStyleDeclarations([sharedStyles.root, semanticStyles.root])]
      .filter(({ property }) => property.startsWith('--'))
      .map(({ property }) => `${property}:inherit`).join(';')
  );
  // Bridge нужен и на trigger: локальный prefix должен перекрывать значение wrapper.
  let triggerStyle = $derived(
    [
      componentTheme.style,
      inheritedRootVariables,
      sharedStyles.trigger,
      config.upload?.style,
      semanticStyles.trigger,
      style
    ]
      .filter(Boolean).join(';') || undefined
  );
  const controller = createUploadController({
    props: () => ({
      name,
      action,
      method,
      data,
      headers,
      withCredentials,
      beforeUpload,
      customRequest: request,
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
  {#if showUploadList}<UploadList prefixCls={componentPrefix} {files} {listType}
    options={listOptions} locale={strings} disabled={blocked} onRemove={file => {
        void controller.remove(file);
      }} {onPreview} {onDownload} {previewFile} {isImageUrl} {iconRender} {itemRender}
    progress={mergedProgress}
    class={[sharedClasses.list, semanticClasses.list].filter(Boolean).join(' ') || undefined}
    style={[sharedStyles.list, semanticStyles.list].filter(Boolean).join(';') || undefined}
    itemClass={[sharedClasses.item, semanticClasses.item].filter(Boolean).join(' ') || undefined}
    itemStyle={[sharedStyles.item, semanticStyles.item].filter(Boolean).join(';') || undefined}
    appendAction={card && children ? selectTrigger : undefined} />{/if}
{/snippet}
{#snippet selectTrigger()}
  <div data-ant-upload-control class={[
      `${componentPrefix} ${componentPrefix}-select`,
      blocked && `${componentPrefix}-disabled`,
      !children && `${componentPrefix}-hidden`,
      sharedClasses.trigger,
      semanticClasses.trigger
    ]} style={triggerStyle}>{@render trigger()}</div>
{/snippet}
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`upload-prefix:${componentPrefix}`} />{/if}<span data-ant-upload-root data-ant-upload-prefix={componentPrefix} bind:this={nativeElement} dir={config.direction} style={rootStyle} class={[
    `${componentPrefix}-wrapper ant-upload-css-var`,
    componentTheme.className,
    config.direction === 'rtl' && `${componentPrefix}-rtl`,
    card && `${componentPrefix}-${listType}-wrapper`,
    className,
    rootClassName,
    config.upload?.class,
    sharedClasses.root,
    semanticClasses.root
  ]}>
  {#if type === 'drag'}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div data-ant-upload-control data-ant-upload-prefix={componentPrefix} class={[
        `${componentPrefix} ${componentPrefix}-drag`,
        files.some(file => file.status === 'uploading') && `${componentPrefix}-drag-uploading`,
        dragState && `${componentPrefix}-drag-hover`,
        blocked && `${componentPrefix}-disabled`,
        config.direction === 'rtl' && `${componentPrefix}-rtl`,
        sharedClasses.trigger,
        semanticClasses.trigger
      ]} style={triggerStyle} ondrop={drag} ondragover={drag} ondragleave={drag}>{@render trigger()}</div>
    {@render list()}
  {:else}
    {#if !card || !showUploadList}{@render selectTrigger()}{/if}{@render list()}
  {/if}
</span>
