<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import BreadcrumbPrefixScope from './BreadcrumbPrefixScope.svelte';
  import reference from './ant-design-breadcrumb-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="breadcrumb-prefix-fixture">
  <label>Breadcrumb prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Breadcrumb prefix</label>
  <label>Live Breadcrumb prefix value <input bind:value={prefix} /></label>
  <label>Local Breadcrumb prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      token: { motionDurationMid: '0s' }, components: 'tokens' in sample && sample.tokens ? {
        Breadcrumb: { separatorMargin: 13, linkColor: '#135200', lastItemColor: '#722ed1' }
      } : undefined }}>
    <BreadcrumbPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <BreadcrumbPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motionDurationMid: '0s' } }}>
    <BreadcrumbPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
