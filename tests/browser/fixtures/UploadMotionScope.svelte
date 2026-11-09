<script module lang="ts">
  export interface UploadMotionSample {
    id: string;
    listType?: string;
    motion?: boolean;
    prefix?: string;
    duration?: string;
    rtl?: boolean;
  }
</script>

<script lang="ts">
  import { ConfigProvider, Upload, enUS, type UploadFile, type UploadProps } from 'antd-svelte';

  let { sample }: { sample: UploadMotionSample } = $props();
  const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8"/%3E';
  let files = $state.raw<UploadFile[]>([file('alpha')]);
  let mounted = $state(true);
  let showList = $state(true);
  let noMotion = $state(false);
  let listType = $derived<NonNullable<UploadProps['listType']>>(
    sample.listType === 'picture' || sample.listType === 'picture-card'
      || sample.listType === 'picture-circle' ? sample.listType : 'text'
  );

  function file(uid: string): UploadFile {
    return { uid, name: `${uid}.png`, url: image, status: 'done' };
  }

  function add() {
    files = [...files.filter(item => item.uid !== 'beta'), file('beta')];
  }

  function restore() {
    files = [...files.filter(item => item.uid !== 'alpha'), file('alpha')];
  }
</script>

<section data-upload-motion-controls>
  <button type="button" onclick={add}>Add beta</button>
  <button type="button" onclick={() => { files = files.filter(item => item.uid !== 'alpha'); }}>
    Remove alpha
  </button>
  <button type="button" onclick={restore}>Restore alpha</button>
  <button type="button" onclick={() => { files = [...files].reverse(); }}>Reverse files</button>
  <button type="button" onclick={() => { files = [file('a'), file('__proto__')]; }}>
    Use prototype keys
  </button>
  <label><input type="checkbox" bind:checked={noMotion} /> Disable Upload motion</label>
  <label><input type="checkbox" bind:checked={showList} /> Show Upload list</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Upload</label>
  <input aria-label="Upload motion editor" value="Draft" />
</section>
<ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
  theme={{ cssVar: {}, token: {
    motion: sample.motion !== false && !noMotion,
    ...(sample.duration ? { motionDurationSlow: sample.duration } : {})
  } }}>
  <section data-motion-host style="width:420px">
    {#if mounted}
      <Upload fileList={files} {listType} showUploadList={showList}>
        <button type="button">Upload</button>
      </Upload>
    {/if}
  </section>
</ConfigProvider>
