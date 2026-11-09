<script module lang="ts">
  export interface UploadIconSample {
    id: string;
    listType?: string;
    status?: string;
    mode?: string;
    thumbnail?: boolean;
  }
</script>

<script lang="ts">
  import { ConfigProvider, Upload, enUS, type UploadFile, type UploadProps } from 'antd-svelte';

  let { sample }: { sample: UploadIconSample } = $props();
  const thumbnail = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E';
  let listType = $derived<NonNullable<UploadProps['listType']>>(sample.listType === 'picture' || sample.listType === 'picture-card'
    || sample.listType === 'picture-circle' ? sample.listType : 'text');
  let file = $derived<UploadFile>({ uid: 'one', name: 'report.txt',
    status: sample.status === 'uploading' || sample.status === 'error' ? sample.status : 'done',
    percent: 40, ...(sample.thumbnail ? { thumbUrl: thumbnail } : {}) });
</script>

{#snippet icon(current: UploadFile, type: string)}{#if sample.mode === 'zero'}0{:else if sample.mode !== 'empty'}<span data-file-icon={current.name} data-icon-type={type} data-icon-status={current.status}>{current.name}:{type}:{current.status}</span>{/if}{/snippet}
<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-upload-icon-host>
    <Upload {listType} fileList={[file]} iconRender={sample.mode === 'default' ? undefined : icon}>
      <button type="button">Upload</button>
    </Upload>
  </section>
</ConfigProvider>
