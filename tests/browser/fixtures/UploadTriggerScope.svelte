<script module lang="ts">
  export interface UploadTriggerSample {
    id: string;
    listType?: string;
    drag?: boolean;
    children?: boolean;
    motion?: boolean;
    prefix?: string;
    localPrefix?: string;
    style?: { pointerEvents?: string; display?: string; };
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Upload, UploadDragger, enUS, type UploadProps } from 'antd-svelte';

  let { sample, animated = false }: { sample: UploadTriggerSample; animated?: boolean } = $props();
  let shown = $state(untrack(() => sample.children ?? true));
  let mounted = $state(true);
  let blocked = $state(false);
  let changes = $state(0);
  let Widget = $derived(sample.drag ? UploadDragger : Upload);
  let listType = $derived<NonNullable<UploadProps['listType']>>(
    sample.listType === 'picture' || sample.listType === 'picture-card'
      || sample.listType === 'picture-circle' ? sample.listType : animated ? 'picture-card' : 'text'
  );
  let style = $derived([
    sample.style?.pointerEvents && `pointer-events:${sample.style.pointerEvents}`,
    sample.style?.display && `display:${sample.style.display}`
  ].filter(Boolean).join(';') || undefined);
</script>

{#snippet choose()}<button type="button">Choose file</button>{/snippet}

<section>
  <button type="button" onclick={() => { shown = false; }}>Hide trigger</button>
  <button type="button" onclick={() => { shown = true; }}>Show trigger</button>
  <label><input type="checkbox" bind:checked={mounted} /> Mount trigger Upload</label>
  <label><input type="checkbox" bind:checked={blocked} /> Disable trigger Upload</label>
  <input aria-label="Upload trigger editor" value="Draft" />
  <output data-trigger-changes>{changes}</output>
</section>
<ConfigProvider prefixCls={sample.prefix} locale={enUS}
  theme={{ cssVar: {}, token: { motion: animated && sample.motion !== false } }}>
  <section data-upload-trigger-host>
    {#if mounted}<Widget prefixCls={sample.localPrefix} {listType} fileList={[]}
      id="source-picker" disabled={blocked} {style} children={shown ? choose : undefined}
      beforeUpload={() => false} onChange={() => { changes++; }} />{/if}
  </section>
</ConfigProvider>
