<script module lang="ts">
  export interface UploadThumbnailSample {
    id: string;
    listType?: string;
    mode?: string;
  }
</script>

<script lang="ts">
  import { ConfigProvider, Upload, enUS, type UploadFile, type UploadProps } from 'antd-svelte';

  let { sample }: { sample: UploadThumbnailSample } = $props();
  let calls = $state(0);
  const url = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="red"/%3E';
  const thumb = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="blue"/%3E';
  let listType = $derived<NonNullable<UploadProps['listType']>>(
    sample.listType === 'picture' || sample.listType === 'picture-circle'
      ? sample.listType
      : 'picture-card'
  );
  let file = $derived.by<UploadFile>(() => {
    const mode = sample.mode ?? 'url-only';
    let thumbUrl: string | undefined;

    if (['empty-thumb', 'empty-no-url', 'non-image-url', 'empty-with-origin'].includes(mode)) {
      thumbUrl = '';
    } else if (['thumb-and-url', 'thumb-only'].includes(mode)) {
      thumbUrl = thumb;
    }

    return {
      uid: 'one',
      name: 'alpha.png',
      type: mode === 'non-image-url' ? 'text/plain' : 'image/png',
      status: 'done',
      url: ['thumb-only', 'empty-no-url', 'no-images'].includes(mode) ? undefined : url,
      thumbUrl,
      originFileObj: mode === 'empty-with-origin'
        ? Object.assign(new File(['svg'], 'alpha.png', { type: 'image/png' }), { uid: 'one' })
        : undefined
    };
  });

  function previewFile() {
    calls++;
    return Promise.resolve(thumb);
  }
</script>

<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-upload-thumbnail-host style="width:420px">
    <Upload fileList={[file]} {listType} {previewFile} onPreview={() => {}}>
      <button type="button">Upload</button>
    </Upload>
    <output data-preview-file-calls>{calls}</output>
  </section>
</ConfigProvider>
