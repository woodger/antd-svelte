<script lang="ts">
  import { untrack } from 'svelte';
  import {
    Button,
    Upload,
    UploadDragger,
    type UploadFile,
    type UploadProps,
    type UploadRequestOptions
  } from 'antd-svelte';

  let {
    mode = 'default',
    scope = 'normal',
    prefix = 'ant',
    priority = false
  }: {
    mode?: string;
    scope?: string;
    prefix?: string;
    priority?: boolean;
  } = $props();
  let files = $state.raw<UploadFile[]>(untrack<UploadFile[]>(() => [
    {
      uid: 'one', name: 'note.txt', status: mode === 'progress' ? 'uploading' : 'done',
      percent: 62, url: 'data:text/plain,example'
    },
    {
      uid: 'two', name: 'broken.txt', status: 'error', response: 'Upload error',
      url: 'data:text/plain,broken'
    }
  ]));
  let events = $state<string[]>([]);
  let pending = $state.raw<UploadRequestOptions>();
  let styled = $derived(priority || scope === 'priority');
  let listType = $derived.by<UploadProps['listType']>(() => {
    if (mode === 'picture' || mode === 'picture-circle') return mode;
    return ['picture-card', 'card-hover', 'card-disabled', 'trigger-variables'].includes(mode)
      ? 'picture-card' : 'text';
  });
  let areaStyle = $derived([
    styled && 'width:117px;height:119px;border-radius:13px',
    (scope === 'variable' || mode === 'trigger-variables')
      && `--${prefix}-upload-picture-card-size:139px;--${prefix}-upload-actions-color:rgb(0,128,0)`
  ].filter(Boolean).join(';'));
  let uploadProps = $derived<UploadProps>({
    fileList: files,
    showUploadList: { showDownloadIcon: true },
    disabled: mode === 'disabled' || mode === 'card-disabled',
    style: areaStyle,
    onChange: info => {
      files = info.fileList;
      const status = 'status' in info.file ? info.file.status : undefined;
      events.push(`change:${info.file.name}:${status}`);
    },
    onRemove: (file: UploadFile) => { events.push(`remove:${file.name}`); },
    onPreview: (file: UploadFile) => { events.push(`preview:${file.name}`); },
    onDownload: (file: UploadFile) => { events.push(`download:${file.name}`); },
    customRequest: (options: UploadRequestOptions) => {
      pending = options;
      events.push(`request:${options.file.name}`);
      return { abort: () => { events.push('abort'); } };
    }
  });
</script>

<div style="width:600px">
  {#if mode === 'drag'}
    <UploadDragger {...uploadProps}>
      <p class="ant-upload-text">Drop files</p>
      <p class="ant-upload-hint">Choose multiple files</p>
    </UploadDragger>
  {:else}
    <Upload {...uploadProps} {listType}><Button>Upload</Button></Upload>
  {/if}
  <button type="button" onclick={() => pending?.onSuccess?.({ ok: true })}>
    Complete pending Upload
  </button>
  <output aria-label="Upload theme events">{JSON.stringify(events)}</output>
</div>
