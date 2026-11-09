<script module lang="ts">
  export interface UploadProgressMotionSample {
    id: string;
    listType?: string;
    motion?: boolean;
    prefix?: string;
    localPrefix?: string;
    duration?: string;
    componentDuration?: string;
    percentMode?: string;
    initialStatus?: string;
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Upload, enUS, type UploadFile, type UploadProps } from 'antd-svelte';

  let { sample }: { sample: UploadProgressMotionSample } = $props();
  let status = $state<'uploading' | 'done'>(untrack(() =>
    sample.initialStatus === 'done' ? 'done' : 'uploading'));
  let mounted = $state(true);
  let noMotion = $state(false);
  let listType = $derived<NonNullable<UploadProps['listType']>>(
    sample.listType === 'picture' || sample.listType === 'picture-card'
      || sample.listType === 'picture-circle' ? sample.listType : 'text'
  );
  let file = $derived.by<UploadFile>(() => {
    const value: UploadFile = { uid: 'one', name: 'alpha.png', status, 'aria-label': 'Transfer alpha' };
    if (sample.percentMode !== 'missing') {
      value.percent = sample.percentMode === 'undefined' ? undefined : 40;
    }
    return value;
  });
</script>

<section>
  <button type="button" onclick={() => { status = 'uploading'; }}>Start upload</button>
  <button type="button" onclick={() => { status = 'done'; }}>Complete upload</button>
  <label><input type="checkbox" bind:checked={mounted} /> Mount progress Upload</label>
  <label><input type="checkbox" bind:checked={noMotion} /> Disable progress motion</label>
  <input aria-label="Upload progress motion editor" value="Draft" />
</section>
<ConfigProvider prefixCls={sample.prefix} locale={enUS} theme={{ cssVar: {},
  components: sample.componentDuration
    ? { Upload: { motionDurationMid: sample.componentDuration } } : undefined, token: {
  motion: sample.motion !== false && !noMotion,
  ...(sample.duration ? { motionDurationMid: sample.duration } : {})
} }}>
  <section data-progress-motion-host style="width:420px">
    {#if mounted}<Upload fileList={[file]} {listType} prefixCls={sample.localPrefix}>
      <button type="button">Upload</button>
    </Upload>{/if}
  </section>
</ConfigProvider>
