<script module lang="ts">
  export interface UploadPasteSample {
    id: string;
    pastable?: boolean;
    disabled?: boolean;
    providerDisabled?: boolean;
    multiple?: boolean;
    accept?: string;
    filter?: string;
  }
</script>

<script lang="ts">
  import { ConfigProvider, Upload, UploadDragger, type UploadProps } from 'antd-svelte';

  let { sample, dragger = false, manual = true }: {
    sample: UploadPasteSample;
    dragger?: boolean;
    manual?: boolean;
  } = $props();
  let before = $state<{ name: string; batch: string[] }[]>([]);
  let changes = $state<{ name: string; status: string | null; list: string[] }[]>([]);
  let requests = $state<string[]>([]);
  let root = $state<HTMLSpanElement>();
  let input = $state<HTMLInputElement>();
  let uploadProps = $derived<UploadProps>({
    pastable: sample.pastable, disabled: sample.disabled, multiple: sample.multiple,
    accept: sample.filter === 'native' ? { format: sample.accept, filter: 'native' }
      : sample.filter === 'callback' ? {
        format: sample.accept, filter: file => file.name.endsWith('.keep')
      } : sample.accept,
    beforeUpload: (file, files) => {
      before.push({ name: file.name, batch: files.map(file => file.name) });
      return manual ? false : undefined;
    },
    onChange: info => changes.push({ name: info.file.name,
      status: 'status' in info.file ? info.file.status ?? null : null,
      list: info.fileList.map(file => file.name) }),
    customRequest: options => {
      requests.push(options.file.name);
      queueMicrotask(() => options.onSuccess?.({ ok: true }));
      return {};
    }
  });
</script>

<ConfigProvider componentDisabled={sample.providerDisabled}>
  {#if dragger}
    <UploadDragger {...uploadProps} bind:nativeElement={root} bind:inputElement={input}>
      <button type="button">Paste upload</button>
    </UploadDragger>
  {:else}
    <Upload {...uploadProps} bind:nativeElement={root} bind:inputElement={input}>
      <button type="button">Paste upload</button>
    </Upload>
  {/if}
</ConfigProvider>
<button type="button" onclick={() => { before = []; changes = []; requests = []; }}>
  Clear paste events
</button>
<output aria-label="Paste before">{JSON.stringify(before)}</output>
<output aria-label="Paste changes">{JSON.stringify(changes)}</output>
<output aria-label="Paste requests">{JSON.stringify(requests)}</output>
<output aria-label="Paste refs">{Boolean(root && input)}</output>
