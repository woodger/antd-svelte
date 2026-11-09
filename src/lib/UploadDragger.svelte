<script lang="ts" generics="T = unknown">
  import Upload from './Upload.svelte';
  import type { UploadDraggerProps, UploadFile, UploadRef } from './upload.types';
  let {
    height,
    style,
    hasControlInside = false,
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...props
  }: UploadDraggerProps<
    T
  > = $props();
  let innerUpload = $state<Upload<T>>();
  let files = $derived(innerUpload?.fileList ?? props.fileList ?? props.defaultFileList ?? []);
  let uploader = $derived(innerUpload?.upload ?? null);
  export { files as fileList, uploader as upload, nativeElement, inputElement };
  export function abort(file?: UploadFile<T> | string) {
    innerUpload?.abort(file);
  }
  export const onBatchStart: UploadRef<T>['onBatchStart'] = batch =>
    innerUpload?.onBatchStart(batch);
  export const onProgress: UploadRef<T>['onProgress'] = (event, file) =>
    innerUpload?.onProgress(event, file);
  export const onSuccess: UploadRef<T>['onSuccess'] = (response, file, xhr) =>
    innerUpload?.onSuccess(response, file, xhr);
  export const onError: UploadRef<T>['onError'] = (error, response, file) =>
    innerUpload?.onError(error, response, file);
</script>
<Upload {...props} type="drag" {hasControlInside} style={[style, height !== undefined
    && `height:${height}px`].filter(Boolean).join(
      ';'
    )} bind:nativeElement bind:inputElement bind:this={innerUpload} />
