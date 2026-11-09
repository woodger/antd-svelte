<script module lang="ts">
  export interface UploadRefSample {
    id: string;
    drag: boolean;
    mode: string;
    maxCount?: number;
  }
</script>

<script lang="ts">
  import { tick, untrack } from 'svelte';
  import {
    ConfigProvider, Upload, UploadDragger, UPLOAD_LIST_IGNORE,
    type UploadRef, type UploadFile, type UploadRcFile, type UploadRequestOptions
  } from 'antd-svelte';
  import { describeUploadRefFile, describeUploadRefChange } from '../upload-ref-metrics';

  let { sample }: { sample: UploadRefSample } = $props();
  const initial: UploadFile[] = untrack(() =>
    sample.mode === 'mixed' || sample.mode.startsWith('controlled')
      ? [{ uid: 'seed', name: 'seed.txt', status: 'done', percent: 100, url: '/seed.txt' }] : []
  );
  let files = $state.raw(initial);
  let Widget = $derived(sample.drag ? UploadDragger : Upload);
  let instance = $state<UploadRef>();
  let held = $state.raw<UploadRef>();
  let host = $state<HTMLElement>();
  let mounted = $state(true);
  let result = $state('');
  let callbackCount = $state(0);
  let beforeCount = $state(0);
  let requestCount = $state(0);
  let aborted = $state(0);
  let request: UploadRequestOptions | undefined;
  let captured: ReturnType<typeof describeUploadRefChange>[] = [];

  function makeFile(name: string): UploadRcFile {
    return Object.assign(new File([name], `${name}.txt`, {
      type: 'text/plain', lastModified: 1700000000000
    }), { uid: name });
  }

  async function capture() {
    const ref = instance;
    if (!ref) throw Error('Upload ref is unavailable after mount');
    captured = [];
    const raw = Object.fromEntries(['seed', 'a', 'b', 'c', 'unknown']
      .map(name => [name, makeFile(name)]));
    const shape = {
      methods: (['onBatchStart', 'onSuccess', 'onProgress', 'onError'] as const)
        .map(name => [name, typeof ref[name]]),
      fileList: Array.isArray(ref.fileList),
      uploadAbort: typeof ref.upload?.abort,
      nativeElement: ref.nativeElement === host?.querySelector('[data-ant-upload-root]')
    };
    const steps: { action: string; list: ReturnType<typeof describeUploadRefFile>[];
      events: ReturnType<typeof describeUploadRefChange>[]; }[] = [];
    async function act(action: string, fn: () => void) {
      const before = captured.length;
      fn();
      await tick();
      steps.push({ action, list: ref!.fileList.map(describeUploadRefFile),
        events: captured.slice(before) });
    }
    await act('unknown-progress', () => ref.onProgress({ percent: 21 }, raw.unknown));
    await act('unknown-success', () => ref.onSuccess('{"ignored":true}', raw.unknown));
    await act('unknown-error', () => ref.onError(Error('ignored'), { ignored: true }, raw.unknown));
    if (sample.mode !== 'empty') {
      if (sample.mode === 'ignored') Reflect.set(raw.a, UPLOAD_LIST_IGNORE, true);
      await act('batch', () => ref.onBatchStart(['a', 'b', 'c'].map(name => ({
        file: raw[name],
        parsedFile: sample.mode === 'manual' || sample.mode === 'mixed' && name === 'a'
          ? null : raw[name]
      }))));
      await act('progress', () => ref.onProgress({ percent: 37 }, raw.a));
      const xhr = new XMLHttpRequest();
      await act('success-json', () => ref.onSuccess('{"ok":true}', raw.a, xhr));
      await act('error', () => ref.onError(Error('ref failure'), { reason: 'rejected' }, raw.b));
      await act('success-text', () => ref.onSuccess('plain response', raw.c));
      await act('late-progress', () => ref.onProgress({ percent: 17 }, raw.a));
    }
    if (sample.mode.startsWith('controlled')) {
      await act('seed-progress', () => ref.onProgress({ percent: 66 }, raw.seed));
      await act('seed-success', () => ref.onSuccess('{"seed":true}', raw.seed));
    }
    result = JSON.stringify({ shape, initial: initial.map(describeUploadRefFile), steps });
  }
</script>

<section>
  <button type="button" onclick={capture}>Run Upload ref scenario</button>
  <button type="button" onclick={() => { instance?.upload?.abort(); }}>Abort delegated Upload</button>
  <button type="button" onclick={() => {
    if (request) instance?.onSuccess('{"imperative":true}', request.file);
  }}>Complete Upload through ref</button>
  <button type="button" onclick={() => { request?.onProgress?.({ percent: 55 }); }}>
    Progress Upload transport
  </button>
  <button type="button" onclick={() => { held = instance; mounted = false; }}>Unmount ref Upload</button>
  <button type="button" onclick={() => {
    const file = makeFile('late');
    held?.onBatchStart([{ file, parsedFile: file }]);
    held?.onProgress({ percent: 20 }, file);
    held?.onSuccess('{"late":true}', file);
    held?.onError(Error('late'), undefined, file);
  }}>Call held Upload ref</button>
  <input aria-label="Upload ref editor" value="Draft" />
  <output data-ref-callbacks>{callbackCount}</output>
  <output data-ref-before>{beforeCount}</output>
  <output data-ref-requests>{requestCount}</output>
  <output data-ref-aborted>{aborted}</output>
  <output data-ref-list>{JSON.stringify(instance?.fileList.map(file => ({
    name: file.name, status: file.status ?? null, percent: file.percent ?? null,
    response: file.response ?? null
  })) ?? [])}</output>
  <output data-ref-clean>{!held?.nativeElement && !held?.inputElement && !held?.upload}</output>
  <pre data-upload-ref-result>{result}</pre>
</section>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-upload-ref-host bind:this={host}>
    {#if mounted}
      <Widget bind:this={instance} defaultFileList={initial}
        fileList={sample.mode.startsWith('controlled') ? files : undefined}
        maxCount={sample.maxCount} id="ref-picker"
        beforeUpload={() => { beforeCount++; return true; }}
        customRequest={options => {
          request = options;
          requestCount++;
          return { abort: () => { aborted++; } };
        }}
        onChange={info => {
          callbackCount++;
          captured.push(describeUploadRefChange(info));
          if (sample.mode === 'controlled-accept') files = info.fileList;
        }}>
        <button type="button">Choose file</button>
      </Widget>
    {/if}
  </section>
</ConfigProvider>
