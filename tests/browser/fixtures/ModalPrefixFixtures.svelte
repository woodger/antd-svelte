<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import ModalPrefixScope, { type ModalPrefixSample } from './ModalPrefixScope.svelte';
  import reference from './ant-design-modal-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let confirmation = $state(false);
  let sample: ModalPrefixSample = $derived(live ? {
    id: `live-${confirmation ? 'confirm' : 'modal'}`, prefix, local: local || undefined,
    type: confirmation ? 'confirm' : undefined
  } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as ModalPrefixSample);
</script>

<section id="modal-prefix-fixture">
  <label>Modal prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Modal prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Modal prefix</label>
  <label><input type="checkbox" bind:checked={confirmation} /> Confirm prefix mode</label>
  <label>Live Modal prefix value<input bind:value={prefix} /></label>
  <label>Local Modal prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Modal: {
        titleFontSize: 21, titleColor: '#722ed1', contentBg: '#fffbe6',
        padding: 20, paddingLG: 28
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><ModalPrefixScope {sample} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <ModalPrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}<ModalPrefixScope {sample} />{/if}
    {/key}
  </ConfigProvider>
</section>
