<script module lang="ts">
  export interface UploadErrorSample {
    id: string;
    response?: unknown;
    error?: { statusText?: string; message?: string; };
    nativeError?: boolean;
    progressEvent?: boolean;
  }
</script>

<script lang="ts">
  import { ConfigProvider, Upload, enUS, type UploadFile } from 'antd-svelte';

  let { sample }: { sample: UploadErrorSample } = $props();
  let error = $derived.by<UploadFile['error']>(() => {
    if (sample.nativeError) return new Error('Native error message');
    if (sample.progressEvent) {
      return typeof ProgressEvent === 'undefined' ? undefined : new ProgressEvent('error');
    }
    return sample.error;
  });
</script>

<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
  <Upload fileList={[{ uid: 'one', name: 'alpha.txt', status: 'error',
      response: sample.response, error }]} locale={{ uploadError: 'Fallback upload error' }}>
    <button type="button">Upload</button>
  </Upload>
</ConfigProvider>
