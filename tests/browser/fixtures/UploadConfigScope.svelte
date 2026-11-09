<script module lang="ts">
  export interface UploadConfigSample {
    id: string;
    provider?: string;
    local?: string;
    scope?: string;
    drag?: boolean;
    disabled?: boolean;
    progress?: string;
  }
</script>

<script lang="ts">
  import {
    ConfigProvider,
    Upload,
    enUS,
    type UploadConfig,
    type UploadProps,
    type UploadRequestOptions
  } from 'antd-svelte';

  let { sample, requestOnly = false, localRequest = false, hold = false, onEvent }: {
    sample: UploadConfigSample;
    requestOnly?: boolean;
    localRequest?: boolean;
    hold?: boolean;
    onEvent?: (event: string) => void;
  } = $props();
  let events = $state<string[]>([]);
  let pending: { name: string; options: UploadRequestOptions; }[] = [];

  function record(event: string) {
    events.push(event);
    onEvent?.(event);
  }

  function request(name: string): NonNullable<UploadProps['customRequest']> {
    return options => {
      record(`request:${name}:${options.file.name}`);
      if (hold) pending.push({ name, options });
      else options.onSuccess?.({ ok: name });

      return { abort: () => record(`abort:${name}`) };
    };
  }

  function settings(name: string, callbacks = false): UploadConfig {
    const classNames = {
      root: `${name}-root`,
      list: `${name}-list`,
      item: `${name}-item`,
      trigger: `${name}-trigger`
    };
    const styles = {
      root: 'color:#135790;padding-top:3px',
      list: 'margin-top:7px',
      item: 'min-height:33px',
      trigger: 'color:#357913;padding-top:5px'
    };

    return {
      class: `${name}-class`,
      style: 'color:#975310;padding-top:11px',
      classNames: callbacks ? ({ props }) => ({
        ...classNames,
        root: `${classNames.root} raw-${props.accept || 'none'}-${props.disabled}`
      }) : classNames,
      styles: callbacks ? ({ props }) => ({
        ...styles,
        item: `min-height:${props.disabled ? 47 : 39}px`
      }) : styles,
      accept: '.txt',
      customRequest: request('provider')
    };
  }

  let outer = $derived.by<UploadConfig>(() => {
    if (requestOnly) return { customRequest: request('provider') };
    if (sample.provider === 'empty') return {};
    const upload = settings('config', sample.provider === 'callback');
    if (sample.provider === 'accept-object') upload.accept = { format: '.md', filter: 'native' };
    if (sample.progress) upload.progress = { size: [160, 5], showInfo: true };

    return upload;
  });
  let local = $derived.by<UploadConfig>(() => {
    const value: UploadConfig = sample.local === 'object' || sample.local === 'callback'
      ? settings('local', sample.local === 'callback') : {};
    delete value.customRequest;
    if (sample.local === 'accept') value.accept = '.csv';
    if (sample.local === 'empty-accept') value.accept = '';
    if (sample.local === 'empty') {
      value.classNames = {};
      value.styles = {};
    }
    if (sample.provider === 'accept-object') delete value.accept;

    return value;
  });
  let progress = $derived.by<UploadProps['progress']>(() => {
    if (sample.progress === 'hidden') return { showInfo: false };
    if (sample.progress === 'empty') return {};
    if (sample.progress === 'size') return { size: [160, 9] };
    return undefined;
  });
</script>

{#snippet widget(sibling = false)}
  <section data-upload-config-host
    data-upload-progress-host={sample.progress && !sibling ? '' : undefined} style="width:320px">
    {#if requestOnly}
      <Upload customRequest={localRequest ? request('local') : undefined}
        onChange={info => record(`change:${info.file.name}:${'status' in info.file ? info.file.status : undefined}`)}>
        <button type="button">Upload</button>
      </Upload>
    {:else if sibling}
      <Upload fileList={[{ uid: 'one', name: 'alpha.txt', status: 'done' }]}
        isImageUrl={() => false}><button type="button">Sibling Upload</button></Upload>
    {:else}
      <Upload fileList={[{ uid: 'one', name: 'alpha.txt',
          status: sample.progress ? 'uploading' : 'done', percent: 42, 'aria-label': 'File transfer' }]}
        {progress} type={sample.drag ? 'drag' : undefined} disabled={sample.disabled}
        isImageUrl={() => false} {...local}>
        <button type="button">Upload</button>
      </Upload>
    {/if}
  </section>
{/snippet}
<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }} upload={outer}>
  {#if sample.scope === 'nested'}<ConfigProvider>{@render widget()}</ConfigProvider>
  {:else if sample.scope === 'reset'}<ConfigProvider upload={{}}>{@render widget()}</ConfigProvider>
  {:else}{@render widget()}{/if}
  {#if sample.scope === 'sibling'}
    <ConfigProvider upload={{ accept: '.csv', class: 'config-sibling' }}>
      {@render widget(true)}
    </ConfigProvider>
  {/if}
</ConfigProvider>
<button type="button" onclick={() => {
  for (const entry of pending.splice(0)) entry.options.onSuccess?.({ ok: entry.name });
}}>Complete configured requests</button>
<output aria-label="Configured request events">{JSON.stringify(events)}</output>
