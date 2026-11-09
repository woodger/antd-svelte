<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import UploadPrefixScope, { type UploadPrefixSample } from './UploadPrefixScope.svelte';
  import reference from './ant-design-upload-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as UploadPrefixSample);
</script>

<section id="upload-prefix-fixture">
  <label>Upload prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Upload prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload prefix</label>
  <label>Live Upload prefix value<input bind:value={prefix} /></label>
  <label>Local Upload prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Upload: {
        pictureCardSize: 128, actionsColor: '#389e0d', fontSize: 17, colorText: '#722ed1'
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><UploadPrefixScope {sample} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <UploadPrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}<UploadPrefixScope {sample} />{/if}
    {/key}
  </ConfigProvider>
</section>
