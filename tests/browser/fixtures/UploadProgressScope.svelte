<script module lang="ts">
  export interface UploadProgressSample {
    id: string;
    mode?: string;
    listType?: string;
    percent?: number;
    uploading?: boolean;
  }
</script>

<script lang="ts">
  import {
    ConfigProvider,
    Upload,
    enUS,
    type UploadFile,
    type UploadListProgressProps,
    type UploadProps
  } from 'antd-svelte';

  let { sample }: { sample: UploadProgressSample } = $props();
  let listType = $derived<NonNullable<UploadProps['listType']>>(
    sample.listType === 'picture' || sample.listType === 'picture-card'
      || sample.listType === 'picture-circle' ? sample.listType : 'text'
  );
  let progress = $derived.by(() => {
    const size: [number, number] = [160, 6];
    const presets: Record<string, UploadListProgressProps | undefined> = {
      default: undefined,
      empty: {},
      thin: { size: [160, 3], showInfo: false },
      info: { size, showInfo: true },
      colored: {
        size,
        showInfo: true,
        strokeColor: '#fa541c',
        railColor: '#eeeeee',
        strokeLinecap: 'butt'
      },
      gradient: {
        size: [160, 8],
        showInfo: false,
        strokeColor: { from: '#108ee9', to: '#87d068', direction: 'to right' }
      },
      success: { size, success: { percent: 12, strokeColor: '#52c41a' }, showInfo: true },
      active: { size, status: 'active', showInfo: false },
      exception: { size, status: 'exception' },
      steps: {
        size,
        steps: 5,
        showInfo: false,
        strokeColor: ['#ff0000', '#00ff00', '#0000ff']
      },
      format: { size, showInfo: true, format: percent => `${percent}% sent` },
      semantic: {
        size,
        showInfo: true,
        classNames: { root: 'custom-progress-root' },
        styles: { rail: 'height:5px', track: 'background-color:#ffaa00' }
      },
      aria: { size, showInfo: false, 'aria-label': 'Custom transfer' }
    };

    return presets[sample.mode ?? 'default'];
  });
  let file = $derived<UploadFile>({
    uid: 'one',
    name: 'alpha.txt',
    status: sample.uploading === false ? 'done' : 'uploading',
    percent: sample.percent ?? 42,
    'aria-label': 'File transfer'
  });
</script>

<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-upload-progress-host style="width:320px">
    <Upload {listType} {progress} fileList={[file]} isImageUrl={() => false}>
      <button type="button">Upload</button>
    </Upload>
  </section>
</ConfigProvider>
<output aria-label="Progress file">{JSON.stringify({ uid: file.uid, percent: file.percent })}</output>
