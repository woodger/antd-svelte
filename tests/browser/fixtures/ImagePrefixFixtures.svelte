<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import ImagePrefixScope, { type ImagePrefixSample } from './ImagePrefixScope.svelte';
  import reference from './ant-design-image-prefix-reference.json';
  import independentReference from './ant-design-image-independent-preview-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let independent = $state(false);
  let cases = $derived(independent ? independentReference.cases : reference.cases);
  let customViewer = $state(false);
  let viewerPrefix = $state('viewer');
  let live = $state(false);
  let group = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let groupLocal = $state('');
  let sample = $derived(live ? {
    id: `live-${group ? 'group' : 'single'}`, prefix, group,
    local: local || undefined, groupLocal: groupLocal || undefined,
    previewPrefix: customViewer ? viewerPrefix : undefined
  } : (cases.find(entry => entry.sample.id === selected) ?? cases[0])
    .sample as ImagePrefixSample);
</script>

<section id="image-prefix-fixture">
  <label><input type="checkbox" bind:checked={independent} /> Independent Image samples</label>
  <label>Image prefix sample<select bind:value={selected}>
    {#each cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Image prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Image prefix</label>
  <label><input type="checkbox" bind:checked={group} /> Group Image prefix</label>
  <label>Live Image prefix value<input bind:value={prefix} /></label>
  <label>Local Image prefix value<input bind:value={local} /></label>
  <label>Local Image group prefix value<input bind:value={groupLocal} /></label>
  <label><input type="checkbox" bind:checked={customViewer} /> Custom Image viewer prefix</label>
  <label>Viewer Image prefix value<input bind:value={viewerPrefix} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Image: {
        previewOperationSize: 26, zIndexPopup: 1600, paddingSM: 16, marginSM: 18
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><ImagePrefixScope {sample} {scope} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <ImagePrefixScope {sample} {scope} local={false} />
        </ConfigProvider>
      {:else}<ImagePrefixScope {sample} {scope} />{/if}
    {/key}
  </ConfigProvider>
</section>
