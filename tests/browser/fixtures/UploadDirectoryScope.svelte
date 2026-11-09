<script module lang="ts">
  export interface UploadDirectorySample {
    id: string;
    directory?: boolean;
    paste?: boolean;
    multiple?: boolean;
    accept?: string;
    filter?: string;
  }
</script>

<script lang="ts">
  import { Upload, UploadDragger, type UploadProps } from 'antd-svelte';

  let { sample, dragger = false, disabled = false, onBefore }: {
    sample: UploadDirectorySample;
    dragger?: boolean;
    disabled?: boolean;
    onBefore?: (name: string) => void;
  } = $props();
  type FileInfo = { name: string; path: string };
  let before = $state<{ file: FileInfo; batch: FileInfo[] }[]>([]);
  let changes = $state<{ name: string; files: FileInfo[] }[]>([]);
  let input = $state<HTMLInputElement>();
  let root = $state<HTMLSpanElement>();
  const info = (file: File) => ({ name: file.name, path: file.webkitRelativePath || '' });
  let uploadProps = $derived<UploadProps>({
    directory: sample.directory, pastable: sample.paste, multiple: sample.multiple, disabled,
    accept: sample.filter === 'native' ? { format: sample.accept, filter: 'native' } : sample.accept,
    beforeUpload: (file, files) => {
      before.push({ file: info(file), batch: files.map(info) });
      onBefore?.(file.name);
      return false;
    },
    onChange: event => changes.push({ name: event.file.name,
      files: event.fileList.map(file => info(file.originFileObj!)) })
  });
</script>

{#if dragger}
  <UploadDragger {...uploadProps} bind:nativeElement={root} bind:inputElement={input}>
    <button type="button">Upload directory</button>
  </UploadDragger>
{:else}
  <Upload {...uploadProps} bind:nativeElement={root} bind:inputElement={input}>
    <button type="button">Upload directory</button>
  </Upload>
{/if}
<button type="button" onclick={() => { before = []; changes = []; }}>Clear directory events</button>
<output aria-label="Directory before">{JSON.stringify(before)}</output>
<output aria-label="Directory changes">{JSON.stringify(changes)}</output>
<output aria-label="Directory refs">{Boolean(root && input)}</output>
