<script module lang="ts">
  export interface UploadItemSample {
    id: string;
    listType?: string;
    mode?: string;
    error?: boolean;
    reversed?: boolean;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    ConfigProvider,
    Upload,
    enUS,
    type UploadFile,
    type UploadProps,
    type UploadItemRenderActions
  } from 'antd-svelte';

  let { sample }: { sample: UploadItemSample } = $props();
  let events = $state<string[]>([]);
  let listType = $derived<NonNullable<UploadProps['listType']>>(
    sample.listType === 'picture' || sample.listType === 'picture-card'
      || sample.listType === 'picture-circle' ? sample.listType : 'text'
  );
  let files = $derived.by<UploadFile[]>(() => {
    const result: UploadFile[] = [
      { uid: 'one', name: 'alpha.txt', status: sample.error ? 'error' : 'done' },
      { uid: 'two', name: 'beta.txt', status: 'done' }
    ];

    return sample.reversed ? result.reverse() : result;
  });
</script>

{#snippet row(originNode: Snippet, file: UploadFile, fileList: readonly UploadFile[], actions: UploadItemRenderActions)}
  {#if sample.mode !== 'empty'}
    <section data-custom-item={file.uid} data-item-file={file.name}
      data-item-list={fileList.map(file => file.name).join(',')} data-item-status={file.status}>
      {#if sample.mode !== 'replace'}<div data-origin>{@render originNode()}</div>{/if}
      <button type="button" aria-label={`Custom preview ${file.uid}`} onclick={actions.preview}>P</button>
      <button type="button" aria-label={`Custom download ${file.uid}`} onclick={actions.download}>D</button>
      <button type="button" aria-label={`Custom remove ${file.uid}`} onclick={actions.remove}>R</button>
    </section>
  {/if}
{/snippet}
<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-upload-item-host>
    <Upload {listType} fileList={files} disabled={sample.disabled}
      itemRender={sample.mode === 'default' ? undefined : row}
      onPreview={file => events.push(`preview:${file.uid}`)}
      onDownload={file => events.push(`download:${file.uid}`)}
      onRemove={file => {
        events.push(`remove:${file.uid}`);
        return false;
      }}
      onChange={() => events.push('change')}>
      <button type="button">Upload</button>
    </Upload>
  </section>
</ConfigProvider>
<output aria-label="Item render events">{JSON.stringify(events)}</output>
