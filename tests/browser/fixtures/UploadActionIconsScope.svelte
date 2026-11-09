<script module lang="ts">
  export interface UploadActionSample {
    id: string;
    listType?: string;
    mode?: string;
    status?: string;
    disabled?: boolean;
    forceRemove?: boolean;
    twoFiles?: boolean;
    predicates?: boolean;
  }
</script>

<script lang="ts">
  import {
    ConfigProvider,
    Upload,
    enUS,
    type UploadFile,
    type UploadListOptions,
    type UploadProps
  } from 'antd-svelte';

  let { sample }: { sample: UploadActionSample } = $props();
  let events = $state<string[]>([]);
  const thumbUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8"/%3E';
  let listType = $derived<NonNullable<UploadProps['listType']>>(
    sample.listType === 'picture' || sample.listType === 'picture-card'
      || sample.listType === 'picture-circle' ? sample.listType : 'text'
  );
  let files = $derived.by<UploadFile[]>(() => {
    const result: UploadFile[] = [{
      uid: 'one',
      name: 'alpha.txt',
      status: sample.status === 'error' || sample.status === 'uploading' ? sample.status : 'done',
      thumbUrl
    }];
    if (sample.twoFiles) result.push({ uid: 'two', name: 'beta.txt', status: 'done', thumbUrl });
    return result;
  });
  let options = $derived<UploadListOptions>({
    showDownloadIcon: sample.predicates ? file => file.uid === 'one' : true,
    showPreviewIcon: true,
    showRemoveIcon: sample.forceRemove ? true : undefined,
    downloadIcon: sample.mode === 'default' ? undefined : download,
    removeIcon: sample.mode === 'default' ? undefined : remove,
    previewIcon: sample.mode === 'default' ? undefined : preview
  });
</script>

{#snippet content(action: string, file: UploadFile)}{#if sample.mode === 'zero'}{0}{:else if sample.mode !== 'empty'}<span data-custom-action={action} data-action-file={file.name}>{action[0].toUpperCase()}</span>{/if}{/snippet}
{#snippet download(file: UploadFile)}{@render content('download', file)}{/snippet}
{#snippet remove(file: UploadFile)}{@render content('remove', file)}{/snippet}
{#snippet preview(file: UploadFile)}{@render content('preview', file)}{/snippet}
<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-upload-actions-host style="width:420px">
    <Upload fileList={files} {listType} disabled={sample.disabled} showUploadList={options}
      onPreview={file => events.push(`preview:${file.uid}`)}
      onDownload={file => events.push(`download:${file.uid}`)}
      onRemove={file => {
        events.push(`remove:${file.uid}`);
        return false;
      }}><button type="button">Upload</button></Upload>
  </section>
</ConfigProvider>
<output aria-label="Action icon events">{JSON.stringify(events)}</output>
