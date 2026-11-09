<script lang="ts">
  import { untrack } from 'svelte';
  import {
    Button, Upload, UploadDragger, type UploadFile,
    type UploadProps, type UploadRequestOptions
  } from 'antd-svelte';

  export interface UploadPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    listType?: UploadProps['listType'];
    drag?: boolean;
    disabled?: boolean;
    progress?: boolean;
    noList?: boolean;
    noTrigger?: boolean;
    userStyle?: boolean;
  }
  let { sample, local = true }: { sample: UploadPrefixSample; local?: boolean } = $props();
  let files = $state.raw<UploadFile[]>(untrack(() => [
    { uid: 'one', name: 'note.txt', status: sample.progress ? 'uploading' : 'done',
      percent: 62, url: 'data:text/plain,example' },
    { uid: 'two', name: 'broken.txt', status: 'error', response: 'Upload error',
      url: 'data:text/plain,broken' }
  ]));
  let events = $state<string[]>([]);
  let pending = $state.raw<UploadRequestOptions>();
  let root = $state<HTMLSpanElement>();
  let input = $state<HTMLInputElement>();
  let uploadProps = $derived<UploadProps>({
    prefixCls: local ? sample.local : undefined,
    fileList: files,
    class: 'fixture-upload-prefix',
    listType: sample.listType ?? 'text',
    showUploadList: sample.noList ? false : { showDownloadIcon: true },
    disabled: sample.disabled,
    style: sample.userStyle ? 'width:117px;height:119px;border-radius:13px' : undefined,
    onChange: info => {
      files = info.fileList;
      events.push(`change:${info.file.name}:${'status' in info.file ? info.file.status : ''}`);
    },
    onRemove: file => { events.push(`remove:${file.name}`); },
    onDownload: file => { events.push(`download:${file.name}`); },
    customRequest: options => {
      pending = options;
      events.push(`request:${options.file.name}`);
      return { abort: () => events.push('abort') };
    }
  });
</script>

{#snippet selectContent()}<Button>Upload</Button>{/snippet}
<div style="width:600px">
  {#if sample.drag}
    <UploadDragger {...uploadProps} bind:nativeElement={root} bind:inputElement={input}>
      <p class="files-text">Drop files</p>
      <p class="files-hint">Choose multiple files</p>
    </UploadDragger>
  {:else}
    <Upload {...uploadProps} children={sample.noTrigger ? undefined : selectContent}
      bind:nativeElement={root} bind:inputElement={input} />
  {/if}
  <button type="button" onclick={() => pending?.onSuccess?.({ ok: true })}>
    Complete prefix Upload
  </button>
  <output aria-label="Upload prefix events">{events.join('|')}</output>
  <output aria-label="Upload prefix refs">{root?.classList.contains('fixture-upload-prefix') && input?.type === 'file' ? 'connected' : 'empty'}</output>
</div>
